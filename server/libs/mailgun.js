/**
 * Mailgun library
 */

const https = require("https");
const querystring = require("querystring");

const config = require("../config");
const { validateString, validateEmail } = require("./validation");
const { parseJsonToObject } = require("./helpers");

const mailgun = {};

// Send an email using Mailgun API
// Required data: emailTo (String), emailSubject (String), emailText (String)
mailgun.sendEmail = (emailTo, emailSubject, emailText) => {
  return new Promise((resolve, reject) => {
    const to =
      config.envName === "development"
        ? "balland.leonardo@gmail.com"
        : validateEmail(emailTo);
    const subject = validateString(emailSubject);
    const text = validateString(emailText);

    if (to && subject && text) {
      // can send email
      const payload = querystring.stringify({
        from: config.mailgun.from,
        to,
        subject,
        text
      });

      const reqOptions = {
        protocol: "https:",
        method: "POST",
        hostname: "api.mailgun.net",
        path:
          "/v3/sandbox4eb2aa369f714ca3a918e02ae6d34ed2.mailgun.org/messages",
        auth: `api:${config.mailgun.key}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload)
        }
      };

      const req = https.request(reqOptions, res => {
        if (res.statusCode === 200) {
          res.on("data", data => {
            resolve({
              status: res.statusCode,
              data: parseJsonToObject(data.toString()),
              message: "Email has been sent."
            });
          });
        } else {
          reject({
            status: 500,
            message: "Could not sent confirmation email."
          });
        }
      });

      req.on("error", err => {
        reject({
          status: 500,
          message: "Could not sent confirmation email."
        });
      });

      req.write(payload);
      req.end();
    } else {
      reject({
        status: 400,
        message: "Missing required field(s)."
      });
    }
  });
};

module.exports = mailgun;
