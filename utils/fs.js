const fs = require("fs");
const util = require("util");
const glob = require("glob");

exports.ls = (folder, pattern) =>
  new Promise((resolve, reject) =>
    glob(
      pattern,
      {
        absolute: true,
        realpath: true,
        cwd: folder
      },
      (err, res) => (err ? reject(err) : resolve(res))
    )
  );
exports.stat = path => util.promisify(fs.stat)(path);
exports.read = util.promisify(fs.readFile);
exports.write = util.promisify(fs.writeFile);