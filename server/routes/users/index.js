/**
 * Users routes
 * [POST, GET, PUT, DELETE]
 */

const { validateToken } = require("../tokens");
const { validateEmail, validateString } = require("../../libs/validation");
const { create, read, update, remove } = require("../../libs/data");
const helpers = require("../../libs/helpers");

const users = {};

/**
 * Get user details
 * @param {Object} data
 * @return {Object} user (id, name, email, address)
 */
users.get = data => {
  return new Promise((resolve, reject) => {
    const id = validateEmail(data.query.id);
    const token = validateString(data.headers.token);

    if (id && token) {
      read("users", id)
        .then(user => {
          if (user) {
            validateToken(user.id, token)
              .then(() => {
                // @TODO Populate orders and carts
                const { password, ...userData } = user;
                resolve({
                  status: 200,
                  data: userData,
                  message: "User details has been found."
                });
              })
              .catch(err => reject(err));
          }
        })
        .catch(err =>
          reject({ status: 404, message: "User could not be found" })
        );
    } else {
      reject({
        status: 400,
        message: "Missing required field(s)."
      });
    }
  });
};

users.post = data => {
  return new Promise((resolve, reject) => {
    const firstName = validateString(data.payload.firstName);
    const lastName = validateString(data.payload.lastName);
    const email = validateEmail(data.payload.email);
    const address = validateString(data.payload.address);
    const password = validateString(data.payload.password);

    if (firstName && lastName && email && address && password) {
      // Generate id and create user
      const id = email;
      const hash = helpers.hash(password);

      if (hash) {
        // Check if user already exists
        read("users", id)
          .then(user => {
            reject({
              message: "Already has an account with this email.",
              status: 400
            });
          })
          .catch(() => {
            const user = {
              id,
              firstName,
              lastName,
              email,
              address,
              password: hash,
              carts: [],
              orders: [],
              createdAt: Date.now(),
              updatedAt: Date.now()
            };

            // Can create user
            create("users", id, user)
              .then(() => {
                const { password, ...userData } = user;
                resolve({
                  status: 201,
                  data: userData,
                  message: "User has been created."
                });
              })
              .catch(err => {
                reject({
                  status: 500,
                  message: "Could not create user."
                });
              });
          });
      } else {
        reject({
          status: 500,
          message: "Could not hash password."
        });
      }
    } else {
      reject({
        status: 400,
        message: "Missing required fields."
      });
    }
  });
};

users.put = data => {
  return new Promise((resolve, reject) => {
    const id = validateString(data.query.id);
    const firstName = validateString(data.payload.firstName);
    const lastName = validateString(data.payload.lastName);
    const email = validateEmail(data.payload.email);
    const address = validateString(data.payload.address);
    const token = validateString(data.headers.token);

    if (id && token) {
      if (firstName || lastName || email || address) {
        // check if user exists
        read("users", id)
          .then(user => {
            // check if token is valid for current user
            validateToken(user.id, token)
              .then(() => {
                // return user updated details
                const updatedUser = {
                  ...user,
                  updatedAt: Date.now()
                };
                // update user details
                if (firstName) {
                  updatedUser.firstName = firstName;
                }

                if (lastName) {
                  updatedUser.lastName = lastName;
                }

                if (email) {
                  updatedUser.email = email;
                }

                if (address) {
                  updatedUser.address = address;
                }

                update("users", id, updatedUser)
                  .then(() => {
                    resolve({
                      message: "User updated.",
                      data: updatedUser,
                      status: 200
                    });
                  })
                  .catch(() => {
                    reject({
                      message: "User could not be updated.",
                      status: 500
                    });
                  });
              })
              .catch(err => reject(err));
          })
          .catch(err => {
            reject({
              message: "User not found. Please check user ID!",
              status: 400
            });
          });
      } else {
        reject({
          message: "Missing field(s) to update.",
          status: 400
        });
      }
    } else {
      reject({
        message: "Missing required field(s).",
        status: 400
      });
    }
  });
};

users.delete = data => {
  return new Promise((resolve, reject) => {
    const id = validateString(data.query.id);
    const token = validateString(data.headers.token);

    if (id && token) {
      validateToken(id, token)
        .then(() => {
          read("users", id)
            .then(user => {
              // Remove user orders
              const deleteOrdersPromise = new Promise((resolve, reject) => {
                // If user has orders
                if (user.orders.length) {
                  const deleteOrdersPromises = user.orders.map(order =>
                    remove("orders", order)
                  );
                  Promise.all(deleteOrdersPromises)
                    .then(() => resolve(true))
                    .catch(err => resolve(false));
                } else {
                  resolve(true);
                }
              });

              // Remove user carts
              const deleteCartsPromise = new Promise((resolve, reject) => {
                // If user has carts
                if (user.carts.length) {
                  const deleteCartsPromises = user.carts.map(cart =>
                    remove("carts", cart)
                  );
                  Promise.all(deleteCartsPromises)
                    .then(() => resolve(true))
                    .catch(err => resolve(false));
                } else {
                  resolve(true);
                }
              });

              const tasks = [deleteOrdersPromise, deleteCartsPromise];

              Promise.all(tasks)
                .then(deletion => {
                  if (deletion.every(response => response === true)) {
                    remove("users", id)
                      .then(() => {
                        remove("tokens", token)
                          .then(() => {
                            resolve({
                              status: 200,
                              message: "User has been deleted."
                            });
                          })
                          .catch(err => {
                            reject({
                              status: 400,
                              message:
                                "User has been deleted but token could not."
                            });
                          });
                      })
                      .catch(err => {
                        reject({
                          status: 400,
                          message: "User could not be deleted."
                        });
                      });
                  } else {
                    reject({
                      status: 400,
                      message:
                        "User data could not be deleted. User has not been deleted."
                    });
                  }
                })
                .catch(err => console.log(err));
            })
            .catch(err => {
              reject({ status: 404, message: "User could not be found." });
            });
        })
        .catch(err => reject(err));
    } else {
      reject({
        status: 400,
        message: "Missing required field(s)."
      });
    }
  });
};

module.exports = users;
