// DataURI
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();
const path = require("path");

/**
 * @description This function converts the buffer to data url
 * @param {Object} req containing the field object
 * @returns {String} The data url from the string buffer
 */
const dataUri = (req) => {
  // for getting the string from the file buffer
  const file = parser.format(
    path.extname(req.file.originalname).toString(),
    req.file.buffer
  ).content;

  return file;
};

module.exports = { dataUri };
