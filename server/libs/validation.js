/**
 * Validation lib
 */

// Email validation regex
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validation = {};

// Validate an email value
validation.validateEmail = email =>
  typeof email == "string" && email.length && EMAIL_REGEX.test(email.trim())
    ? email.trim()
    : false;

// Validate a string value
// @TODO Add length param to restrict string validation
validation.validateString = str =>
  typeof str == "string" && str.length ? str.trim() : false;

// Validate a number value
validation.validateNumber = nb => (typeof nb == "number" ? nb : false);

module.exports = validation;
