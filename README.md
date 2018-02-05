# pickup-game-server

## Setup
Ensure that you have the latest version of [MariaDB](https://mariadb.com/downloads/mariadb-tx) and [NodeJS](https://nodejs.org/en/) installed. Once MariaDB is setup and running (usually involes setting up an account and a password), do:
```
git clone https://github.com/Bachmair-Boys/pickup-game-server
cd pickup-game-server
```

Edit `setup_db.sh` and modify the variables `MYSQL_USER_NAME` and `MYSQL_PASSWORD` so that they match your MariaDB username and password. To run, do;
```
node index.js
```

