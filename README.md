# HLKZ Autoupdate listener server

This tool listens for GitHub Webhook events and updates the HL KreedZ plugin (with a server restart) after push events are received.

## Installation

- Clone the tool to your HLKZ server root directory (or anywhere but preferably on the same user as the server)
- Run `npm i` to initialize Node.js files.

## Setup

- Create a webhook for the repo for your server with secret key

![https://i.imgur.com/VhwTSrw.png](https://i.imgur.com/VhwTSrw.png)

- Upload node app onto the server user where HLKZ server is running
- Edit config.json file with the secret key and port you wish to run the server on
- Expose node app on nginx specified port (edit sites-available/default like so)

```bash
location /autoupdate {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Host $http_host;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_http_version 1.1;
                proxy_redirect off;

                proxy_pass http://localhost:<port>;
        }
```

- Configure paths in autoupdate.sh and make it executable

  `chmod +x autoupdate.sh`

- Clone git repo with branch unstable according to your autoupdate.sh paths

  `git clone [https://github.com/YaLTeR/hlkreedz.git](https://github.com/YaLTeR/hlkreedz.git) -b unstable`

- Enter cloned repo and verify that git pull works without errors (should say Already up to date)

  `git pull`

- Run the node app (webhook listener server)

  `node index.js`
