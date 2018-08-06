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
  secretKey: "iLoveV0dK4",
  stripe: {
    pkey: "pk_test_Rf0fbaFpyLhrghFRlrXL2Sgr",
    skey: "sk_test_7klGKb2yy3FJDGT8bkbHRGvC",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "no-reply@baleo-it.com",
    key: "a9594ae5408586cc1cfd6f490234e13b-a5d1a068-8a3e96b6"
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
  secretKey: "ISup3rLoveV0dK4",
  stripe: {
    pkey: "pk_test_Rf0fbaFpyLhrghFRlrXL2Sgr",
    skey: "sk_test_7klGKb2yy3FJDGT8bkbHRGvC",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "Baleo IT <mailgun@baleo-it.com>",
    key: "a9594ae5408586cc1cfd6f490234e13b-a5d1a068-8a3e96b6"
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
  secretKey: "iR34llyLUveV0dK4",
  stripe: {
    pkey: "pk_test_Rf0fbaFpyLhrghFRlrXL2Sgr",
    skey: "sk_test_7klGKb2yy3FJDGT8bkbHRGvC",
    currency: "eur",
    source: "tok_fr"
  },
  mailgun: {
    from: "Baleo IT <mailgun@baleo-it.com>",
    key: "a9594ae5408586cc1cfd6f490234e13b-a5d1a068-8a3e96b6"
  }
};

module.exports = config[env];
