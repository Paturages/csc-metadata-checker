const fs = require("fs");
const util = require("util");
const path = require("path");

exports.ls = (folder, pattern) =>
  new Promise((resolve, reject) =>
    fs.readdir(folder, (err, res) =>
      (err ? reject(err) : resolve(res.map(x => path.join(folder, x))))
    )
  );
exports.stat = path => util.promisify(fs.stat)(path);
exports.read = (target, ...args) => util.promisify(fs.readFile)(path.resolve(target), ...args);
exports.write = util.promisify(fs.writeFile);
exports.copy = util.promisify(fs.copyFile);
exports.mkdir = util.promisify(fs.mkdir);
exports.execDir = path.dirname(process.execPath);