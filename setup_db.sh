#!/bin/bash

# Edit these values as necessary
MYSQL_COMMAND="mysql"
MYSQL_HOST="localhost"
MYSQL_USER_NAME="root"  
MYSQL_PASSWORD="bachmair"

DATABASE_NAME="pickup_game"
USERS_TABLE_NAME="users"
GAMES_TABLE_NAME="games"

$MYSQL_COMMAND -h "$MYSQL_HOST" -u "$MYSQL_USER_NAME" --password="$MYSQL_PASSWORD"  << END_OF_PICKUP_DB_SCRIPT
  CREATE DATABASE $DATABASE_NAME;
  USE $DATABASE_NAME;
  CREATE TABLE $USERS_TABLE_NAME (
  id int(11) NOT NULL AUTO_INCREMENT,
  email varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  user_name varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  password_hash varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  password_salt char(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  token char(127),
  UNIQUE (user_name, email),
  PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  CREATE TABLE $GAMES_TABLE_NAME (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
  host_id int(11) NOT NULL,
  type enum('basketball','baseball','soccer') COLLATE utf8mb4_unicode_ci NOT NULL,
  visibility enum('public','private') COLLATE utf8mb4_unicode_ci NOT NULL,
  latitude double NOT NULL,
  longitude double NOT NULL,
  until date NOT NULL,
  UNIQUE (host_id),
  PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
END_OF_PICKUP_DB_SCRIPT
