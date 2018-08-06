/**
 * Helpers lib
 */

const crypto = require("crypto");

const config = require("../config");
const { validateString, validateNumber } = require("./validation");

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

const helpers = {};

// Transform JSON string into Object
helpers.parseJsonToObject = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

// Hash a string
helpers.hash = str => {
  const stringToHash = validateString(str);

  if (stringToHash) {
    const hash = crypto
      .createHmac("sha256", config.secretKey)
      .update(stringToHash)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Generate a random string for a specific length
helpers.generateRandomString = (length = 10) => {
  const max = validateNumber(length);

  if (max) {
    let randomString = "";

    for (let i = 0; i < max; i++) {
      const randomNumber = Math.floor(Math.random() * ALPHABET.length);
      randomString += ALPHABET.charAt(randomNumber);
    }

    return randomString;
  } else {
    return false;
  }
};

// Format a date with the specified format
helpers.formatDate = (date, format = "YYYY/DD/MM at HH:mm") => {
  // Converting timestamp to date
  const rawDate = new Date(date);

  // Defining parser configuration
  const dateParserConfig = {
    YYYY: rawDate.getFullYear(),
    DD: rawDate.getDate(),
    MM: rawDate.getMonth(),
    HH: rawDate.getHours(),
    mm: rawDate.getMinutes()
  };

  // Parse date to get a formatted date
  const formattedDate = helpers.dateParser(format, dateParserConfig);

  return formattedDate;
};

// Parse a date and return a formatted date
helpers.dateParser = (str, parser) => {
  let string = str;
  for (let key in parser) {
    string = string.replace(new RegExp(key, "g"), parser[key]);
  }
  return string;
};

module.exports = helpers;
