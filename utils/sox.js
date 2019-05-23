const childProcess = require("child_process");
const crypto = require("crypto");
const path = require("path");
const rimraf = require("rimraf");
const rm = require("util").promisify(rimraf);
const { copy, execDir, stat } = require("./fs");

const BINARY = process.platform == "win32" ?
  path.join(execDir, "./sox/sox.exe") :
  "sox";

const md5 = txt => {
  const hash = crypto.createHash("md5");
  hash.update(txt);
  return hash.digest("hex");
};

const sox = (...args) => new Promise((resolve, reject) =>
  childProcess.execFile(BINARY, args, (err, stdout, stderr) => {
    if (err) {
      err.stdout = stdout;
      err.stderr = stderr;
      err.args = args;
      reject(err);
    } else {
      resolve(stdout.trim());
    }
  })
);

exports.info = async (target, firstErr) => {
  // sox has trouble with Unicode path names,
  // so the workaround is to copy the audio file through node,
  // then try again.
  try {
    // Format: mp3/ogg
    const format = await sox("--info", "-t", target);
    // Duration in seconds
    const duration = Number(await sox("--info", "-D", target));
    // Bitrate (format: /\d+k/) in kbps
    const bitrate = Number((await sox("--info", "-B", target)).slice(0, -1));
    return { format, duration, bitrate };
  } catch (err) {
    if (firstErr) return console.error(firstErr) || {};
    const [ext] = target.split(".").slice(-1);
    const tmp = path.join(execDir, `tmp.${ext}`);
    await copy(target, tmp);
    const result = await exports.info(tmp, err);
    await rm(tmp);
    return result;
  }
};

exports.spectrogram = async (target, firstErr) => {
  const imagePath = path.join(execDir, `spectrograms/${md5(target)}.png`);
  try {
    // Generate spectrogram
    await sox(
      target, "-n",
      // only analyse from 1:20 to 1:40 (usually enough)
      "trim", "80", "100",
      "spectrogram",
      // only one color (way smaller png sizes, from 250kb'ish to 10kb'ish)
      // "-q", "1",
      // crop X axis to 20 seconds
      "-d", "0:20",
      // notify user that it's only a subset
      "-c", "analysis from 1:20 to 1:40",
      // send to dist folder (created on script execution)
      "-o", imagePath
    );
    return imagePath;
  } catch (err) {
    if (firstErr) return console.error(firstErr) || "";
    const [ext] = target.split(".").slice(-1);
    const tmp = path.join(execDir, `tmp.${ext}`);
    await copy(target, tmp);
    const result = await exports.spectrogram(tmp, err);
    await rm(tmp);
    return result;
  }
};