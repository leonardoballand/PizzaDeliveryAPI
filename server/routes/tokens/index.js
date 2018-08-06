/**
 * Token authentication lib
 */

const { read, create, update, remove } = require("../../libs/data");
const helpers = require("../../libs/helpers");
const { validateEmail, validateString } = require("../../libs/validation");

const tokens = {};

// Generate a new token
// Required data: email, password
tokens.generateToken = data => {
  return new Promise((resolve, reject) => {
    const userId = validateEmail(data.payload.email);
    const password = validateString(data.payload.password);

    if (userId && password) {
      read("users", userId)
        .then(user => {
          const hash = helpers.hash(password);

          if (hash) {
            if (user.password === hash) {
              // Can generate token
              const id = helpers.generateRandomString(20);
              const expires = Date.now() + 1000 * 60 * 60 * 2;

              const tokenData = {
                id,
                expires,
                userId: user.email
              };

              create("tokens", id, tokenData)
                .then(token => {
                  resolve({
                    status: 201,
                    data: tokenData,
                    message: "Token has been created."
                  });
                })
                .catch(err => {
                  reject({
                    status: 500,
                    message: "Token could not be generated."
                  });
                });
            } else {
              reject({
                status: 301,
                message: "Password invalid for this email account."
              });
            }
          } else {
            reject({
              status: 500,
              message: "Could not hash password."
            });
          }
        })
        .catch(err => {
          console.log("error", err);
          reject({
            status: 404,
            message: "User not found."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required fields."
      });
    }
  });
};

// Validate a token
// Required data: email, token
tokens.validateToken = (userEmail, tokenId) => {
  return new Promise((resolve, reject) => {
    const userId = validateEmail(userEmail);
    const tokenID = validateString(tokenId);

    if (userId && tokenID) {
      // Can validate token
      read("tokens", tokenID)
        .then(token => {
          if (token.userId === userId) {
            if (token.expires > Date.now()) {
              resolve({
                status: 200,
                message: "Token is valid."
              });
            } else {
              tokens
                .invalidateToken(tokenId)
                .then(() => {
                  reject({
                    status: 401,
                    message: "Token has expired. Will be invalid now!"
                  });
                })
                .catch(err => {
                  reject({
                    status: 500,
                    message: "Token could not be deleted"
                  });
                });
            }
          } else {
            reject({
              status: 401,
              message: "Token is invalid."
            });
          }
        })
        .catch(err => {
          reject({
            status: 400,
            message: "Token is invalid."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required token fields."
      });
    }
  });
};

// Refresh a token
// Required data: token
tokens.refreshToken = data => {
  return new Promise((resolve, reject) => {
    const email = validateEmail(data.query.id);
    const token = validateString(data.headers.token);

    if (token && email) {
      read("tokens", token)
        .then(tokenData => {
          tokens
            .validateToken(email, token)
            .then(() => {
              const newToken = {
                ...tokenData,
                expires: Date.now() + 1000 * 60 * 60 * 2
              };

              update("tokens", token, newToken)
                .then(() => {
                  resolve({
                    status: 200,
                    data: newToken,
                    message: "Token has been extended."
                  });
                })
                .catch(err => {
                  reject({
                    status: 500,
                    message: "Could not refresh token."
                  });
                });
            })
            .catch(err => reject(err));
        })
        .catch(err => {
          reject({
            status: 400,
            message: "Could not find token. Token is invalid."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required fields."
      });
    }
  });
};

// Invalidate a token
// Required data: token
tokens.invalidateToken = tokenId => {
  return new Promise((resolve, reject) => {
    const tokenID = validateString(tokenId);

    if (tokenID) {
      remove("tokens", tokenID)
        .then(() => {
          resolve({
            status: 200,
            message: "Token is now invalid."
          });
        })
        .catch(err => {
          reject({
            status: 500,
            message: "Could not invalidate token."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required field."
      });
    }
  });
};

module.exports = tokens;
