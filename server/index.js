/**
 * Server HTTP && HTTPS
 */

const http = require("http");
const https = require("https");
const url = require("url");
const { StringDecoder } = require("string_decoder");
const util = require("util");

const config = require("./config");
const routes = require("./routes");
const helpers = require("./libs/helpers");

const debug = util.debuglog("servers");

const server = {};

// HTTPS configuration
server.httpsOptions = {
  key: config.https.key,
  cert: config.https.cert,
  requestCert: config.https.requestCert,
  rejectUnauthorized: config.https.rejectUnauthorized
};

// Create HTTP server
server.httpServer = http.createServer((req, res) =>
  server.unifiedServer(req, res)
);

// Create HTTPS server
server.httpsServer = https.createServer(server.httpsOptions, (req, res) =>
  server.unifiedServer(req, res)
);

// Business logic for both HTTP && HTTPS servers
server.unifiedServer = (req, res) => {
  /**
   * Get the URL and parse it
   * protocol String
   * slashes String
   * auth String
   * host String
   * port Number
   * hostname String
   * hash String
   * search String
   * query Object
   * pathname String
   * path String
   * href String
   */
  const parsedUrl = url.parse(req.url, true);

  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");

  // Get the payload
  const decoder = new StringDecoder();
  let buffer = "";

  req.on("data", data => (buffer += decoder.write(data)));

  req.on("end", () => {
    buffer += decoder.end();

    const currentRoute =
      typeof server.router[path] !== "undefined"
        ? server.router[path]
        : server.router.notFound;

    // Data to send to the requested route
    const requestData = {
      path,
      query: parsedUrl.query,
      method: req.method.toLowerCase(),
      headers: req.headers,
      payload: helpers.parseJsonToObject(buffer)
    };

    currentRoute(requestData)
      .then(responseData => {
        const { status, data, message } = responseData;

        const statusCode = typeof status == "number" ? status : 200;
        const dataPayload = typeof data == "object" ? data : {};
        const messagePayload = typeof message == "string" ? message : "";

        const payload = {
          status: statusCode,
          data: dataPayload,
          message: messagePayload
        };

        res.setHeader("Content-Type", "application/json");
        res.writeHead(statusCode);
        res.end(JSON.stringify(payload));

        if (status === 200) {
          debug(
            "\x1b[32m%s\x1b[0m",
            `${req.method.toUpperCase()} /${path} ${status}`
          );
        } else {
          debug(
            "\x1b[31m%s\x1b[0m",
            `${req.method.toUpperCase()} /${path} ${status}`
          );
        }
      })
      .catch(err => {
        const { status, message } = err;

        const statusCode = typeof status == "number" ? status : 500;
        const error =
          typeof message == "string" ? message : "Server encountered an error";

        res.setHeader("Content-Type", "application/json");
        res.writeHead(statusCode);
        res.end(
          JSON.stringify({
            status,
            error
          })
        );

        debug(
          "\x1b[31m%s\x1b[0m",
          `${req.method.toUpperCase()} /${path} ${status}`
        );
      });
  });
};

// Load routes
server.router = routes;

// Initialization script
server.init = () => {
  console.clear();
  console.log("\x1b[33m%s\x1b[0m", `[ENV] ${config.envName.toUpperCase()}`);

  server.httpServer.listen(config.http.port, () => {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `[HTTP] Server is listening on port ${config.http.port}`
    );
  });

  server.httpsServer.listen(config.https.port, () => {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `[HTTPS] Server is listening on port ${config.https.port}`
    );
  });
};

module.exports = server;
