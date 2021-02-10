const express = require("express");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const crypto = require("crypto");
const config = require("./config.json");
const rateLimit = require("express-rate-limit");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 10 requests per windowMs
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(limiter);

app.post("/autoupdate", (req, res) => {
  // We only care about push event)))
  if (req.headers["x-github-event"] != "push") {
    return res.sendStatus(400);
  }

  const hmac = crypto.createHmac("sha256", config.secret);
  const sig = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

  // verify if secret matches sha256 signature
  if (req.headers["x-hub-signature-256"] != sig) {
    return res.sendStatus(401);
  }

  console.log("Push event received");

  const commits = req.body.commits
    .map((commit) => {
      return `\n > ${commit.message}`;
    })
    .join("");

  const msgSuccess =
    `${new Date().toUTCString()}\n` +
    `[GIT] Updated\n` +
    `- Commits: ${commits}\n\n`;

  const msgError = (error) =>
    `${new Date().toUTCString()}\n` +
    `[GIT] Failed to update\n` +
    `- Commits: ${commits}` +
    `- Error: ${error}\n\n`;

  exec("./autoupdate.sh")
    .then(() => {
      console.log(msgSuccess);
      fs.appendFileSync("update.log", msgSuccess);
    })
    .catch((error) => {
      console.log(msgError(error));
      fs.appendFileSync("update.log", msgError(error));
    });

  return res.sendStatus(200); // Send back OK status
});

app.listen(config.port, () => {
  console.log("Listening on port " + config.port);
});
