routes/auth-routes

# POST /signup
Requires a username, email, and password. Returns 400 for all invalid/missing data.

# GET /signin
Requires username and password credentials for login Calls verifyPassword(password) to compare password to saved User hashAsync. Returns 401 for all Unauthorized login attempts.


# GET /mystuff
Requires a valid token passed in, with following format: 'Bearer ' (must be one string) If token is invalid or missing, will return an error.
