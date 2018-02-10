/* database parameters */
const DATABASE_HOST = '127.0.0.1';
const DATABASE_USER = 'root';
const DATABASE_PASSWORD = 'bachmair';
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
const INVALID_TOKEN_ERROR = 105;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = new Client({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  db: DATABASE_NAME
});

function isValidToken(userName, token, callback) {
 const prep = db.prepare(
      'SELECT token FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name'
  );

  db.query(prep({ user_name: userName }), (err, rows) => {
    if (err || rows.length == 0)
      callback(err || rows.length == 0, undefined);
    else {
      const expected_token = rows[0].token;
      callback(err, token == expected_token);
    }
  });
}

app.get('/is-user-name-in-use', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'SELECT user_name FROM ' + USERS_TABLE_NAME + ' WHERE user_name = :user_name'
  );

  db.query(prep({ user_name: req.query.user_name }), (err, rows) => {
    console.log(rows);
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else
      res.send(JSON.stringify({ status: SUCCESS, is_in_use: rows.length != 0 }));
  });
});

app.get('/is-email-in-use', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'SELECT email FROM ' + USERS_TABLE_NAME + ' WHERE email = :email'
  );

  db.query(prep({ email: req.query.email }), (err, rows) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else
      res.send(JSON.stringify({ status: SUCCESS, is_in_use: rows.length != 0 }));
  });
});

app.post('/register-user', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
    'INSERT IGNORE INTO ' + USERS_TABLE_NAME + '(email, user_name, password_hash, password_salt)'
    + ' values (:email, :user_name, :password_hash, :password_salt)'
  );

  const salt = crypto.randomBytes(127).toString('base64').substring(0, 127);
  const hash = crypto.createHash('sha512').update(salt + req.body.password).digest('base64');

  db.query(
    prep({ email: req.body.email, user_name: req.body.user_name, password_hash: hash, password_salt: salt }),
    (err, rows) => {
      if (err)
        res.send(JSON.stringify({ status: USER_REGISTRATION_ERROR }));
      else
        res.send(JSON.stringify({ status: SUCCESS }));
    }
  );
});

app.post('/log-in', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare(
      'SELECT password_hash, password_salt FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name'
  );

  db.query(prep({ user_name: req.body.user_name }), (err, rows) => {
    if (err || rows.length == 0) {
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
      return;
    }

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

      db.query(updatePrep({ token: token, user_name: req.body.user_name }), (err, rows) => {
        if (err)
          res.send(JSON.stringify({ status: DATABASE_UPDATE_ERROR }));
        else
          res.send(JSON.stringify({ status: SUCCESS, token: token }));
      });
    }
  });
});

app.post('/log-out', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  isValidToken(req.body.user_name, req.body.token, (err, isValid) => {
	if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else if (!isValid)
      res.send(JSON.stringify({ status: INVALID_TOKEN_ERROR }));
    else {
	  const prep = db.prepare('UPDATE ' + USERS_TABLE_NAME + ' SET token = NULL WHERE user_name = :user_name');
	  db.query(prep({ user_name: req.body.user_name }), (err, rows) => {
		if (err)
		  res.send(JSON.stringify({ status: DATABASE_UPDATE_ERROR }));
	    else
		  res.send(JSON.stringify({ status: SUCCESS }));
	  });
	}
  });
});

app.get('/is-valid-token', (req, res) => {
  res.setHeader('Content-Type', 'application/json');     
  isValidToken(req.query.user_name, req.query.token, (err, isValid) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else
      res.send(JSON.stringify({ status: SUCCESS, is_valid: isValid }))
  });
});

app.post('/start-game', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  isValidToken(req.body.user_name, req.body.token, (err, isValid) => {
    if (err)
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
    else if (!isValid)
      res.send(JSON.stringify({ status: INVALID_TOKEN_ERROR }));
    else {
      const idPrep = db.prepare('SELECT id FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name');
      db.query(idPrep({ user_name: req.body.user_name }), (err, rows) => {
        if (err || rows.length == 0) {
          res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
          return;
        }

        const prep = db.prepare(
          'INSERT INTO ' + GAMES_TABLE_NAME + ' (name, host_id, type, visibility, latitude, longitude, until)'
          + ' values (:name, :host_id, :type, :visibility, :latitude, :longitude, :until) ON DUPLICATE KEY UPDATE'
          + ' name = :name, type = :type, visibility = :visibility, latitude = :latitude, longitude = :longitude'
          + ' until = :until'
        );

        db.query(prep({ 
          name: req.body.name, 
          host_id: rows[0].id, 
          type: req.body.type, 
          visibility: req.body.visibility, 
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          until: req.body.until
        }), (err, insertInfo) => {
          if (err)
            res.send(JSON.stringify({ status: DATABASE_UPDATE_ERROR }));
          else
            res.send(JSON.stringify({ status: SUCCESS, game_id: insertInfo.info.insertId }));
        });
      });
    }
  });
});

app.get('/does-user-have-game-running', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const idPrep = db.prepare('SELECT id FROM ' + USERS_TABLE_NAME + ' where user_name = :user_name');
  db.query(idPrep({ user_name: req.query.user_name }), (err, rows) => {
    if (err || rows.length == 0) {
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
      return;
    }

    const prep = db.prepare('SELECT host_id FROM ' + GAMES_TABLE_NAME 
      + ' WHERE host_id = :host_id AND until > :now');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query(prep({ user_name: req.query.user_name, now: now }), (err, rows) => {
      if (err)
        res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
      else
        res.send(JSON.stringify({ status: SUCCESS, has_game_running: rows.length != 0 }));
    });
  });
});

app.get('/find-games', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const prep = db.prepare('SELECT id, name, host_id, type, visibility, latitude, longitude, until) from ' 
    + GAMES_TABLE_NAME + ' WHERE LAT_LNG_DIST(latitude, longitude, :latitude, :longitude) < :radius');
  db.query(prep({ latitude: req.query.latitude, longitude: req.query.longitude, radius: req.query.radius }), (err, rows) => {
    if (err) {
      res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
      return;
    }

    for (let i = 0; i < rows.length; ++i)
      ((index) => {
        const idPrep = db.prepare('SELECT user_name FROM ' + USERS_TABLE_NAME + ' where id = :host_id');
        db.query(idPrep({ host_id: rows[index].host_id }), (row, err) => {
          if (err || rows.length == 0)
            res.send(JSON.stringify({ status: DATABASE_LOOKUP_ERROR }));
          else {
            rows[index].user_name = row[0].user_name;
            rows[index].host_id = undefined;
          }
        });
      })(i);
    res.send({ status: SUCCESS, games: JSON.stringify(rows) });
  });
});

app.listen(8080, () => {
  console.log("Listening on port 8080.");
});
