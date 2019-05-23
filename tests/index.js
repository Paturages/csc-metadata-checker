const getMetaFromMidi = require('../scanners/midi');

const fs = require('fs');
const util = require('util');
const path = require('path');
const read = util.promisify(fs.readFile);

(async () => {
  const buffer = await read(path.resolve(__dirname, "assets", "super_hey_ya.mid"), { encoding: null });
  // const buffer = await read(path.resolve(__dirname, "assets", "fots.mid"), { encoding: null });
  // const buffer = await read(path.resolve(__dirname, "assets", "awywi.mid"), { encoding: null });
  console.log(getMetaFromMidi(buffer));
})();