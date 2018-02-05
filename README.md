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
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;name: _string_, name of game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;id: _int_, id of game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;user_name: _string_, username of user hosting game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;type: _GameType_, type of game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;visibility: _VisibilityType_, specifies who can see the game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;latitude: _float_, latitude of game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;longitude: _float_, longitude of game.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;until: _Date_, time that game lasts until  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_register-user_: GET, Registers a user.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**user\_name**: _string_, username of user.  
&npsp;&nbsp;&nbsp;&nbsp;**email**: _string_, user's email.  
&npsp;&nbsp;&nbsp;&nbsp;**password**: _string_, user's password  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if registration succeeded, USER_REGISTRATION_ERROR otherwise  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_is-email-in-use_: GET, checks if the specified email is in use.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**email**: _string_, email to check if in use.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise,  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;is_in_use: _boolean_, true if email is in use, false otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_is-user-name-in-use_: GET, checks if the specified user-name is in use.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**user\_name**: _string_, username to check if in use.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise,  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;is_in_use: _boolean_, true if username is in use, false otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_log-in_: POST, Logs in a user. Returns a token to be used for actions that require authentication.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**user\_name**: _string_, user's username.  
&npsp;&nbsp;&nbsp;&nbsp;**password**: _string_, user's password.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if log-in succeeded, otherwise AUTHENTICATION_ERROR or DATABASE_LOOKUP_ERROR  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;token: _string_, token to be used for actions that require authentication.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_is-valid-token_: GET, Checks if a token is valid for a specified user.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**username**: _string_, user's username.  
&npsp;&nbsp;&nbsp;&nbsp;**token**: _string_, user's login token.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if check succeeded, DATABASE_LOOKUP_ERROR otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;is_valid: _boolean_, true if the token is valid, false otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_start-game_: POST, Starts a new game and returns the game ID.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**username**: _string_, The username of the user starting the game.  
&npsp;&nbsp;&nbsp;&nbsp;**token**: _string_, The login token for the user.  
&npsp;&nbsp;&nbsp;&nbsp;**name**: _string_, The name of the game.  
&npsp;&nbsp;&nbsp;&nbsp;**type**: _GameType_, The type of the game being started.  
&npsp;&nbsp;&nbsp;&nbsp;**visibility**: _VisibilityType_: Specifies who can see the game.  
&npsp;&nbsp;&nbsp;&nbsp;**latitude**: _float_, The latitude of the game location.  
&npsp;&nbsp;&nbsp;&nbsp;**longitude**: _float_, The longitude of the game location  
&npsp;&nbsp;&nbsp;&nbsp;**until**: _Date_, The time the game lasts until.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if game was able to start, DATABASE_UPDATE_ERROR otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;id: _int_, The ID of the game.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_does-user-have-game-running_: GET, Checks whether a user has a game running.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**username**: _string_, The username of the user being checked.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if game check succeeded, DATABASE_LOOKUP_ERROR otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;has_game_running: _boolean_, Whether the user has a game running.  
&npsp;&nbsp;&nbsp;&nbsp;}  
  
_find-game_: GET, Finds games around a user.  
Parameters:  
&npsp;&nbsp;&nbsp;&nbsp;**latitude**: _float_, The user's latitude.  
&npsp;&nbsp;&nbsp;&nbsp;**longitude**: _float_, The user's longitude.  
&npsp;&nbsp;&nbsp;&nbsp;**radius**: _float_, The maximum distance a game can be from the user, in kilometers.  
Return:  
&npsp;&nbsp;&nbsp;&nbsp;JSON-Encoded Data: {   
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;status: _int_, SUCCESS if able to look for games, DATABASE_LOOKUP_ERROR otherwise.  
&npsp;&nbsp;&nbsp;&nbsp;&nbsp;games: _Game[]_, Array of games.  
&npsp;&nbsp;&nbsp;&nbsp;}  
