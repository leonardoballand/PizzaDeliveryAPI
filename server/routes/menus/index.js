/**
 * Menu routes
 * [GET, ]
 */

const { validateEmail, validateString } = require("../../libs/validation");
const { validateToken } = require("../tokens");
const { read, listAll } = require("../../libs/data");

const menus = {};

// Get all menu items
menus.get = data => {
  return new Promise((resolve, reject) => {
    listAll("menus")
      .then(items => {
        if (items && items.length) {
          let itemsList = [];
          const itemsLength = items.length;

          items.forEach((item, index) => {
            read("menus", item)
              .then(dataFile => {
                if (dataFile) {
                  itemsList.push(dataFile);

                  if (itemsLength == itemsList.length) {
                    if (itemsList.length) {
                      resolve({
                        status: 200,
                        data: itemsList,
                        message: `List contains ${items.length} menu items.`
                      });
                    } else {
                      reject({
                        status: 404,
                        message: "List is empty."
                      });
                    }
                  }
                }
              })
              .catch(err => {
                reject({
                  status: 500,
                  message: "Menu items content could not be read."
                });
              });
          });
        } else {
          reject({
            status: 404,
            message: "List of menu items seems to be empty."
          });
        }
      })
      .catch(err => {
        reject({
          status: 404,
          message: "Items list seems to be empty."
        });
      });
  });
};

module.exports = menus;
