/**
 *
 * Routes handling
 *
 */

const users = require("./users");
const menus = require("./menus");
const carts = require("./carts");
const orders = require("./orders");
const {
  generateToken,
  validateToken,
  invalidateToken,
  refreshToken
} = require("./tokens");

const routes = {
  api: data => {
    return new Promise((resolve, reject) => {
      resolve({
        status: 200,
        data: {
          name: "Pizza Delivery API",
          version: "0.1.0",
          author: "Leonardo BALLAND",
          company: "Baleo IT",
          protocolSupport: {
            http: true,
            https: true
          },
          authProtect: "active"
        },
        message: "API informations"
      });
    });
  },
  notFound: data => {
    return new Promise((resolve, reject) => {
      resolve({
        status: 404,
        data: {
          message: "No API endpoint found!"
        }
      });
    });
  },
  users: data => {
    const acceptableMethods = ["get", "post", "put", "delete"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        users[data.method](data)
          .then(responseData => {
            resolve(responseData);
          })
          .catch(e => reject(e));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  "auth/refreshtoken": data => {
    const acceptableMethods = ["get"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        refreshToken(data)
          .then(responseData => {
            resolve(responseData);
          })
          .catch(e => reject(e));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  "auth/login": data => {
    const acceptableMethods = ["post"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        generateToken(data)
          .then(responseData => {
            resolve(responseData);
          })
          .catch(e => reject(e));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  "auth/logout": data => {
    const acceptableMethods = ["get"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        invalidateToken(data.headers.token)
          .then(responseData => {
            resolve(responseData);
          })
          .catch(e => reject(e));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  menu: data => {
    const acceptableMethods = ["get"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        menus[data.method](data)
          .then(responseData => resolve(responseData))
          .catch(err => reject(err));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  cart: data => {
    const acceptableMethods = ["get", "post", "put", "delete"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        carts[data.method](data)
          .then(responseData => resolve(responseData))
          .catch(err => reject(err));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  },
  order: data => {
    const acceptableMethods = ["post"];

    return new Promise((resolve, reject) => {
      if (acceptableMethods.includes(data.method)) {
        orders[data.method](data)
          .then(responseData => resolve(responseData))
          .catch(err => reject(err));
      } else {
        reject({
          status: 400,
          message: "Request method not available."
        });
      }
    });
  }
};

module.exports = routes;
