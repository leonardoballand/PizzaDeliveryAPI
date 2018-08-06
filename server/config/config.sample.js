/**
 * Environment variables configuration
 * Handled mode: development, staging and production
 */

const fs = require("fs");
const path = require("path");

const config = {};

const env = process.env.NODE_ENV || "development";

// DEV CONFIG
config.development = {
  http: {
    port: process.env.port || 3000
  },
  https: {
    port: process.env.port || 3001,
    key: fs.readFileSync(path.join(__dirname, "./key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "./cert.pem")),
    requestCert: false,
    rejectUnauthorized: false
  },
  envName: "development",
  secretKey: "iL0veC4ch4ca",
  stripe: {
    pkey: "YOUR_OWN_KEY",
    skey: "YOUR_OWN_KEY",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "YOUR_RECIPIENT_MAILGUN_EMAIL",
    key: "YOUR_OWN_KEY"
  }
};

// STAGING CONFIG
config.staging = {
  http: {
    port: process.env.port || 5000
  },
  https: {
    port: process.env.port || 5001,
    key: "",
    cert: "",
    requestCert: true,
    rejectUnauthorized: false
  },
  envName: "staging",
  secretKey: "ISup3rL0veC4ch4ca",
  stripe: {
    pkey: "YOUR_OWN_KEY",
    skey: "YOUR_OWN_KEY",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "YOUR_RECIPIENT_MAILGUN_EMAIL",
    key: "YOUR_OWN_KEY"
  }
};

// PROD CONFIG
config.production = {
  http: {
    port: process.env.port || 7000
  },
  https: {
    port: process.env.port || 7001,
    key: "",
    cert: "",
    requestCert: true,
    rejectUnauthorized: true
  },
  envName: "production",
  secretKey: "iR34llyLUveC4ch4ca",
  stripe: {
    pkey: "YOUR_OWN_KEY",
    skey: "YOUR_OWN_KEY",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "YOUR_RECIPIENT_MAILGUN_EMAIL",
    key: "YOUR_OWN_KEY"
  }
};

module.exports = config[env];
