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

## API

### Types
_GameType_: enum { "BASEBALL", "BASKETBALL", "SOCCER" }  
_VisibilityType_: enum { "PUBLIC", "PRIVATE" }  
_Date_: "YYYY-MM-DD HH:MM:SS"  
_Game_: {  
    name: _string_, name of game.  
    id: _int_, id of game.  
    user_name: _string_, username of user hosting game.  
    type: _GameType_, type of game.  
    visibility: _VisibilityType_, specifies who can see the game.  
    latitude: _float_, latitude of game.  
    longitude: _float_, longitude of game.  
    _until_: _Date_, time that game lasts until  
    }  
  
_register-user_: GET, Registers a user.  
Parameters:  
  **user\_name**: _string_, username of user.  
  **email**: _string_, user's email.  
  **password**: _string_, user's password  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if registration succeeded, USER_REGISTRATION_ERROR otherwise  
  }  
  
_is-email-in-use_: GET, checks if the specified email is in use.  
Parameters:  
  **email**: _string_, email to check if in use.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise,  
    is_in_use: _boolean_, true if email is in use, false otherwise.  
  }  
  
_is-user-name-in-use_: GET, checks if the specified user-name is in use.  
Parameters:  
  **user\_name**: _string_, username to check if in use.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise,  
    is_in_use: _boolean_, true if username is in use, false otherwise.  
  }  
  
_log-in_: POST, Logs in a user. Returns a token to be used for actions that require authentication.  
Parameters:  
  **user\_name**: _string_, user's username.  
  **password**: _string_, user's password.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if log-in succeeded, otherwise AUTHENTICATION_ERROR or DATABASE_LOOKUP_ERROR  
    token: _string_, token to be used for actions that require authentication.  
  }  
  
_is-valid-token_: GET, Checks if a token is valid for a specified user.  
Parameters:  
  **username**: _string_, user's username.  
  **token**: _string_, user's login token.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise.  
    is_valid: _boolean_, true if the token is valid, false otherwise.  
  }  
  
_start-game_: POST, Starts a new game and returns the game ID.  
Parameters:  
  **username**: _string_, The username of the user starting the game.  
  **token**: _string_, The login token for the user.  
  **name**: _string_, The name of the game.  
  **type**: _GameType_, The type of the game being started.  
  **visibility**: _VisibilityType_: Specifies who can see the game.  
  **latitude**: _float_, The latitude of the game location.  
  **longitude**: _float_, The longitude of the game location  
  **until**: _Date_, The time the game lasts until.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if game was able to start, DATABASE_UPDATE_ERROR otherwise.  
    id: _int_, The ID of the game.  
  }  
  
_does-user-have-game-running_: GET, Checks whether a user has a game running.  
Parameters:  
  **username**: _string_, The username of the user being checked.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if game check succeeded, DATABASE_LOOKUP_ERROR otherwise.  
    has_game_running: _boolean_, Whether the user has a game running.  
  }  
  
_find-game_: GET, Finds games around a user.  
Parameters:  
  **latitude**: _float_, The user's latitude.  
  **longitude**: _float_, The user's longitude.  
  **radius**: _float_, The maximum distance a game can be from the user, in kilometers.  
Return:  
  JSON-Encoded Data: {   
    status: _int_, SUCCESS if able to look for games, DATABASE_LOOKUP_ERROR otherwise.  
    games: _Game[]_, Array of games.  
  }  
