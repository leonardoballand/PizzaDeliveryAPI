/**
 * Orders routes
 */

const https = require("https");
const querystring = require("querystring");

const config = require("../../config");
const { sendEmail } = require("../../libs/mailgun");
const { read, create, update } = require("../../libs/data");
const { validateString, validateNumber } = require("../../libs/validation");
const { validateToken } = require("../tokens");
const { parseJsonToObject, formatDate } = require("../../libs/helpers");

const orders = {};

// Make an order
// Required data: cartId (String)
orders.post = data => {
  return new Promise((resolve, reject) => {
    const cartId = validateString(data.payload.cartId);

    if (cartId) {
      // Get cart content
      read("carts", cartId)
        .then(cart => {
          // Check for access token
          const token = validateString(data.headers.token);
          validateToken(cart.userId, token)
            .then(() => {
              // Can create order
              const amount = cart.total;
              const currency = config.stripe.currency; // load from config file

              // For testing payment, using a testing data token provided by Stripe
              const source = config.stripe.source; // load from config file

              const payload = querystring.stringify({
                amount,
                currency,
                source,
                description: `Charge for ${cart.userId}`
              });

              const reqOptions = {
                protocol: "https:",
                method: "POST",
                hostname: "api.stripe.com",
                path: "/v1/charges",
                headers: {
                  Authorization: `Bearer ${config.stripe.skey}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                  "Content-Length": Buffer.byteLength(payload)
                }
              };

              const req = https.request(reqOptions, res => {
                res.on("data", data => {
                  // Check the payment status
                  const {
                    id,
                    amount,
                    created,
                    currency,
                    description,
                    paid,
                    status
                  } = parseJsonToObject(data.toString());

                  const paymentData = {
                    id,
                    amount,
                    created,
                    currency,
                    description,
                    paid,
                    status,
                    userId: cart.userId
                  };

                  if (paid && status === "succeeded") {
                    // Save the order
                    create("orders", id, paymentData)
                      .then(() => {
                        // Update user orders
                        read("users", paymentData.userId)
                          .then(user => {
                            // Add new order ID to user orders
                            const updatedUser = {
                              ...user,
                              orders: [...user.orders, paymentData.id]
                            };

                            // Update user with the updated orders array
                            update("users", paymentData.userId, updatedUser)
                              .then(() => {
                                const amountValue = (amount * 0.01).toFixed(2);

                                // Send a confirmation email
                                sendEmail(
                                  cart.userId,
                                  "Payment confirmation",
                                  `Your payment of ${amountValue}€ has been authorized - ${formatDate(
                                    created
                                  )}`
                                )
                                  .then(() => {
                                    // Resolve order response
                                    resolve({
                                      status: 200,
                                      data: paymentData,
                                      message:
                                        "Order has been authorized and an email confirmation has been sent."
                                    });
                                  })
                                  .catch(err => {
                                    // Resolve with email error
                                    resolve({
                                      status: 200,
                                      data: paymentData,
                                      message:
                                        "Order has been created but confirmation email could not be sent."
                                    });
                                  });
                              })
                              .catch(err => {
                                // Resolve with user update error
                                resolve({
                                  status: 200,
                                  data: paymentData,
                                  message:
                                    "Order has been authorized but user could not be updated. The email confirmation has not been sent."
                                });
                              });
                          })
                          .catch(err => {
                            // Resolve with user error
                            resolve({
                              status: 200,
                              data: paymentData,
                              message:
                                "Order has been authorized but user could not be found. The email confirmation has not been sent."
                            });
                          });
                      })
                      .catch(err => {
                        reject({
                          status: 500,
                          message: "Could not save the order."
                        });
                      });
                  } else {
                    // Send unauthorized payment email
                    sendEmail(
                      cart.userId,
                      "Payment error",
                      `Your payment of ${amountValue}€ has been declined - ${formatDate(
                        created
                      )}`
                    )
                      .then(() => {
                        // Reject for declined payment
                        reject({
                          status: 400,
                          message:
                            "Your payment has been declined, your order could not be saved. An email has been sent to you."
                        });
                      })
                      .catch(err => {
                        reject({
                          status: 400,
                          message:
                            "Your payment has been declined and your order could not be saved. Sorry, but notification email could not be sent to you."
                        });
                      });
                  }
                });
              });

              req.write(payload);
              req.end();

              req.on("error", err => {
                console.log("err", err);
                reject({
                  status: err.statusCode,
                  message: "Payment could not be validated."
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
        message: "Missing required field(s)"
      });
    }
  });
};

module.exports = orders;
