/**
 * Files I/O lib
 */

const path = require("path");
const fs = require("fs");

const helpers = require("./helpers");

const rw = {};

// Base directory for app files
const baseDir = path.join(__dirname, "../.data");

// Create a file
// Required data: directory name, file name, file content
rw.create = (directory, fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.open(
      `${baseDir}/${directory}/${fileName}.json`,
      "wx",
      (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
          fs.writeFile(fileDescriptor, JSON.stringify(data), err => {
            if (!err) {
              fs.close(fileDescriptor, e => {
                if (!e) {
                  resolve({ message: "File created." });
                } else {
                  reject({
                    message: "Error: Could not close the file.",
                    error: e
                  });
                }
              });
            } else {
              reject({
                message: "Error: Could not write to the file.",
                error: err
              });
            }
          });
        } else {
          reject({
            message: "Error: This file may already exists. File not created.",
            error
          });
        }
      }
    );
  });
};

// Read file content
// Required data: directory name, file name
rw.read = (directory, fileName) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${baseDir}/${directory}/${fileName}.json`,
      "utf-8",
      (err, data) => {
        if (!err && data) {
          resolve(helpers.parseJsonToObject(data));
        } else {
          reject({
            message: "Error: File could not be found.",
            error: err
          });
        }
      }
    );
  });
};

// Update file content
// Required data: directory name, file name, file content to update
rw.update = (directory, fileName, data) => {
  return new Promise((resolve, reject) => {
    fs.open(
      `${baseDir}/${directory}/${fileName}.json`,
      "r+",
      (error, fileDescriptor) => {
        if (!error && fileDescriptor) {
          fs.truncate(fileDescriptor, err => {
            if (!err) {
              fs.writeFile(fileDescriptor, JSON.stringify(data), err => {
                if (!err) {
                  fs.close(fileDescriptor, err => {
                    if (!err) {
                      resolve("File updated");
                    } else {
                      reject({
                        message: "Error: File could not be closed",
                        error: err
                      });
                    }
                  });
                } else {
                  reject({
                    message: "Error: Could not write the file.",
                    error: err
                  });
                }
              });
            } else {
              reject({
                message: "Error: Could not be truncated",
                error: err
              });
            }
          });
        } else {
          reject({
            message: "Error: This file may already exists. File not created.",
            error
          });
        }
      }
    );
  });
};

// Delete a file
// Required data: directory name, file name
rw.remove = (directory, fileName) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${baseDir}/${directory}/${fileName}.json`, err => {
      if (!err) {
        resolve({
          message: "File has been deleted."
        });
      } else {
        reject({
          message: "Error: File could not be deleted.",
          error: err
        });
      }
    });
  });
};

rw.listAll = directory => {
  return new Promise((resolve, reject) => {
    fs.readdir(`${baseDir}/${directory}`, (err, files) => {
      if (!err && files && files.length) {
        const filesList = [];
        files.map(file => filesList.push(file.replace(".json", "")));
        resolve(filesList);
      } else {
        reject({
          message: "Could not find any items file.",
          error: err
        });
      }
    });
  });
};

module.exports = rw;
