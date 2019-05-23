const childProcess = require("child_process");
const crypto = require("crypto");
const path = require("path");
const rimraf = require("rimraf");

// Empty dist directory upon launch
rimraf(path.resolve(__dirname, ".sox", "*"), () => {});

const BINARY = "sox";

const md5 = txt => {
  const hash = crypto.createHash("md5");
  hash.update(txt);
  return hash.digest("hex");
};

const sox = (...args) => new Promise((resolve, reject) =>
  childProcess.execFile(BINARY, args, (err, stdout, stderr) => {
    if (err) {
      console.error(`"sox ${args.join(" ")}" failed!`);
      err.stdout = stdout;
      err.stderr = stderr;
      err.args = args;
      reject(err);
    } else {
      resolve(stdout.trim());
    }
  })
);

exports.info = async target => {
  // Format: mp3/ogg
  const format = await sox("--info", "-t", target);
  // Duration in seconds
  const duration = Number(await sox("--info", "-D", target));
  // Bitrate (format: /\d+k/) in kbps
  const bitrate = Number((await sox("--info", "-B", target)).slice(0, -1));
  return { format, duration, bitrate };
};

exports.spectrogram = async target => {
  const imagePath = path.resolve(__dirname, ".sox", `${md5(target)}.png`);
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
    // send to dist folder (created on script execution)
    "-o", imagePath
  );
  return imagePath;
};