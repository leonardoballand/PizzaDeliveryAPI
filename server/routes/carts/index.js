/**
 * Shopping cart routes
 * [POST, GET, PUT, DELETE]
 */

const { validateEmail, validateString } = require("../../libs/validation");
const { validateToken } = require("../tokens");
const { create, read, update, remove } = require("../../libs/data");
const { generateRandomString } = require("../../libs/helpers");

const carts = {};

// Create a new cart
// Required data: userId, items
carts.post = data => {
  return new Promise((resolve, reject) => {
    const userId = validateEmail(data.payload.userId);
    const items =
      data.payload.items && data.payload.items.length
        ? data.payload.items
        : false;

    if (userId && items) {
      const token = validateString(data.headers.token);
      read("tokens", token)
        .then(tokenData => {
          validateToken(tokenData.userId, token)
            .then(() => {
              // Can create shopping cart
              const cartID = generateRandomString(10);

              // Get an array of Promises for each cart item
              const tasks = items.map(itemId => read("menus", itemId));

              // Execute each Promise to get the item details
              // Return each item details to the next Promises
              // At the end of the chain, return an array containing each item details
              // Then it may be possible to sum the total
              return tasks
                .reduce((promiseChain, currentTask) => {
                  return promiseChain.then(result =>
                    currentTask.then(currentResult => [
                      ...result,
                      currentResult
                    ])
                  );
                }, Promise.resolve([]))
                .then(itemsMenu => {
                  const total = items.reduce(
                    (total, item) =>
                      itemsMenu.find(i => i.id == item).price + total,
                    0
                  );

                  const cart = {
                    id: cartID,
                    userId: userId,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    items,
                    total
                  };

                  create("carts", cartID, cart)
                    .then(() => {
                      // Get cart user
                      read("users", userId)
                        .then(user => {
                          const userUpdate = {
                            ...user,
                            carts: [...user.carts, cartID]
                          };

                          // Update user with new cart created
                          update("users", userId, userUpdate)
                            .then(() => {
                              resolve({
                                status: 200,
                                data: cart,
                                message: "Cart has been created."
                              });
                            })
                            .catch(err => {
                              resolve({
                                status: 200,
                                data: cart,
                                message:
                                  "Cart has been created but user could not be updated."
                              });
                            });
                        })
                        .catch(err => {
                          resolve({
                            status: 200,
                            data: cart,
                            message:
                              "Cart has been created but could not find user to update."
                          });
                        });
                    })
                    .catch(err => {
                      reject({
                        status: 500,
                        message: "Cart could not be created."
                      });
                    });
                });
            })
            .catch(err => reject(err));
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
        message: "Missing required field(s)."
      });
    }
  });
};

// Get cart informations
// Required data: cartId
carts.get = data => {
  return new Promise((resolve, reject) => {
    const cartId = validateString(data.query.id);

    if (cartId) {
      read("carts", cartId)
        .then(cart => {
          const token = validateString(data.headers.token);
          validateToken(cart.userId, token)
            .then(() => {
              const cartItems = cart.items;

              if (cartItems.length) {
                const cartItemsLength = cartItems.length;
                const populatedCartItems = [];

                cartItems.forEach((item, index) => {
                  read("menus", item)
                    .then(data => {
                      populatedCartItems.push(data);

                      if (cartItemsLength == populatedCartItems.length) {
                        resolve({
                          status: 200,
                          data: {
                            ...cart,
                            items: populatedCartItems
                          },
                          message: `Cart contains ${cartItems.length} items.`
                        });
                      }
                    })
                    .catch(err => {
                      reject({
                        status: 500,
                        message: "Could not find the menu item."
                      });
                    });
                });
              } else {
                resolve({
                  status: 200,
                  data: cart,
                  message: "Cart has been found but it is empty."
                });
              }
            })
            .catch(err => reject(err));
        })
        .catch(err => {
          reject({
            status: 404,
            message: "Cart could not be found."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required field(s)."
      });
    }
  });
};

// Update a cart
// Required data: cartId, items
carts.put = data => {
  return new Promise((resolve, reject) => {
    const cartId = validateString(data.query.id);
    const items =
      data.payload.items && data.payload.items.length
        ? data.payload.items
        : false;

    if (cartId && items) {
      read("carts", cartId)
        .then(cart => {
          const token = validateString(data.headers.token);
          read("tokens", token)
            .then(tokenData => {
              validateToken(cart.userId, token)
                .then(() => {
                  // Add new items to cart items
                  const updatedItems = [...cart.items, ...items];

                  // Get an array of Promises for each cart item
                  const getItems = updatedItems.map(itemId =>
                    read("menus", itemId)
                  );

                  // Execute each Promise to get the item details
                  // Return each item details to the next Promises
                  // At the end of the chain, return an array containing each item details
                  // Then it may be possible to sum the total
                  return getItems
                    .reduce((promiseChain, currentItem) => {
                      return promiseChain.then(result =>
                        currentItem.then(currentResult => [
                          ...result,
                          currentResult
                        ])
                      );
                    }, Promise.resolve([]))
                    .then(itemsMenu => {
                      // Sum the cart items total
                      const total = itemsMenu.reduce(
                        (total, item) => item.price + total,
                        0
                      );

                      // Prepare data to update file with updated items
                      const updatedCart = {
                        ...cart,
                        items: updatedItems,
                        total,
                        updatedAt: Date.now()
                      };

                      update("carts", cartId, updatedCart)
                        .then(() => {
                          // Resolve with populated cart items
                          resolve({
                            status: 200,
                            data: {
                              ...updatedCart,
                              items: itemsMenu
                            },
                            message: "Cart has been updated."
                          });
                        })
                        .catch(err => {
                          reject({
                            status: 500,
                            message: "Could not update cart."
                          });
                        });
                    });
                })
                .catch(err => reject(err));
            })
            .catch(err => {
              reject({
                status: 400,
                message: "Token is invalid."
              });
            });
        })
        .catch(err => {
          reject({
            status: 500,
            message: "Cart could not be found."
          });
        });
    } else {
      const message = !cartId
        ? "Missing required field."
        : "Missing fields to update.";
      reject({
        status: 400,
        message
      });
    }
  });
};

// Delete a cart
// Required data: cartId
carts.delete = data => {
  return new Promise((resolve, reject) => {
    const cartId = validateString(data.query.id);

    if (cartId) {
      read("carts", cartId)
        .then(cart => {
          const token = validateString(data.headers.token);
          validateToken(cart.userId, token)
            .then(() => {
              // Can delete cart
              remove("carts", cartId)
                .then(() => {
                  // Remove cart from user carts
                  read("users", cart.userId)
                    .then(user => {
                      // Remove the cartId from user carts
                      const userCartsUpdated = user.carts.filter(
                        item => item.id === cartId
                      );

                      // Update user with new carts array
                      const userUpdate = {
                        ...user,
                        carts: userCartsUpdated
                      };

                      // Update user with new cart created
                      update("users", cart.userId, userUpdate)
                        .then(() => {
                          resolve({
                            status: 200,
                            message: "Cart has been deleted."
                          });
                        })
                        .catch(err => {
                          resolve({
                            status: 200,
                            message:
                              "Cart has been deleted but user could not be updated."
                          });
                        });
                    })
                    .catch(err => {
                      resolve({
                        status: 200,
                        message:
                          "Cart has been deleted but could not find user to update."
                      });
                    });
                })
                .catch(err => {
                  reject({
                    status: 500,
                    message: "Could not delete cart."
                  });
                });
            })
            .catch(err => reject(err));
        })
        .catch(err => {
          reject({
            status: 404,
            message: "Cart could not be found."
          });
        });
    } else {
      reject({
        status: 400,
        message: "Missing required field(s)."
      });
    }
  });
};

module.exports = carts;
