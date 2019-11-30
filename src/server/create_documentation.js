"use strict";

const documentation = require("documentation");
const streamArray = require("stream-array");
const vfs = require("vinyl-fs");

const buildDocumentation = async () => {
  return documentation
    .build("src/**/*.js", { shallow: false })
    .then(documentation.formats.html)
    .then(output => {
      streamArray(output).pipe(vfs.dest("./src/js_docs"));
    });
};

module.exports = buildDocumentation;
