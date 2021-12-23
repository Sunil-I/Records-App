# Records App

## Introduction

This project is a data-driven full stack web-application that was designed to handle a problem where other applications did not solve the issue completely.

## How to run

1. Clone the repo

```shell

git clone https://github.com/Sunil-I/Records-App/ app

```

2. Change your current directory to the application

```shell

cd app

```

3. Install the required dependcies

```shell

npm install

```

4. Fill out the env values

```shell

mv .env.example .env

nano .env

```

5. Run the application

```shell

node .

```

## Requirements

1. [MongoDB Database](https://www.mongodb.com/cloud)
2. [Node.js v16+](https://nodejs.org/en/)
3. [Sentry](https://sentry.io)
4. [SMTP Server](https://mailtrap.io)

# Publicly hosted instances

1. [Development instance](https://com519-dev.sunil.sh)
2. [Staging instance](https://com519-staging.sunil.sh)
3. [Production instance](https://com519.sunil.sh)
4. [Backup Instance](https://com519-production.herokuapp.com/)

- Development instance was used to test features live without production configurations being used.

- Staging instance mimics the production settings locally to ensure production is stable.

- Production instance is completed features deployed live via heroku.
