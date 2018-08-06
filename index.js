/**
 * Main file
 */

const server = require("./server");

const app = {
  init: () => {
    // Start server
    server.init();
  }
};

// Initialize app
app.init();

module.exports = app;
