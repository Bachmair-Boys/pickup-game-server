/* database parameters */

const DATABASE_HOST = '127.0.0.1';
const DATABASE_USER = 'root';
const DATABSE_PASSWORD = 'bachmair';
const DATABASE_NAME='pickup_game';
const USERS_TABLE_NAME = 'users';
const GAMES_TABLE_NAME = 'games'

const Client = require('mariasql');
const express = require('express');
const crypto = require('crypto');
const app = express();

const SUCCESS = 0;
const USER_REGISTRATION_ERROR = 101;
const DATABASE_LOOKUP_ERROR = 102;
const AUTHENTICATION_ERROR = 103;
const DATABASE_UPDATE_ERROR = 104;

app.use(express.json());
app.use(express.urlencoded());

const db = new Client({
  host: DATABSE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  db: DATABSE_NAME
});

app.get('is-user-name-in-use', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'SELECT user_name FROM ' + USERS_TABLE_NAME + ' WHERE user_name = :user_name'
  );

  db.query({ user_name: req.body.user_name }, (err, rows) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR });

    res.send(JSON.stringify({ status: SUCCESS, is_in_use: rows.length != 0 }));
});

app.get('is-email-in-use', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'SELECT email FROM ' + USERS_TABLE_NAME + ' WHERE email = :email'
  );

  db.query({ email: req.body.email }, (err, rows) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));

    res.send(JSON.stringify({ status: SUCCESS, is_in_use: rows.length != 0 }));
});

app.post('register-user', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'INSERT IGNORE INTO ' + USERS_TABLE_NAME + ' values (:email :user_name :password_hash :password_salt)'
  );

  const salt = crypto.randomBytes(127).toString('base64').substring(0, 127);
  const hash = crypto.createHash('sha512').update(salt + req.body.password).digest('base64');

  db.query(
    prep({ email: req.body.email, user_name: req.user_name, password_hash: hash, password_salt: salt }),
    (err, rows) => {
      if (err)
        res.send(JSON.stringify({ status: USER_REGISTRATION_ERROR }));
      else
        res.send(JSON.stringify({ status: SUCCESS });
    }
  );
);

app.post('log-in', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
      'SELECT password_hash, password_salt FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name'
    );

  db.query(prep({ user_name = req.body.user_name }), (err, rows) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));

    const salt = rows[0].password_salt;
    const expected_hash = rows[0].password_hash;
    const hash = crypto.createHash('sha512').update(salt + req.body.password).digest('base64');

    if (hash != expected_hash)
      res.send(JSON.stringify({ status: AUTHENTICATION_ERROR }));
    else {
      const token = crypto.randomBytes(127).toString('base64').substring(0, 127);
      const updatePrep = db.prepare(
        'UPDATE ' + USERS_TABLE_NAME + ' SET token=:token WHERE user_name=:user_name'
      );

      db.query(updatePrep({ token: token, user_name, req.body.user_name }), (err, rows) => {
        if (err)
          res.send(JSON.stringify({ status: DATABASE_UPDATE_ERROR }));
        else
          res.send(JSON.stringify({ status: SUCCESS, token: token }));
      });
    }
  });
});

app.get('is-valid-token', (req, res) => {
  res.setHeader('Content-Type', 'application/json');     
  const prep = db.prepare(
      'SELECT token FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name'
  );

  db.query(prep({ user_name: req.body.user_name }), (err, rows) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else {
      const token = rows[0].token;
      res.send(JSON.stringify({ status: SUCCESS, is_valid_token: req.body.token == token }));
    }
  });
);




