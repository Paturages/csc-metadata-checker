const formatTime = require("./format-time");
const red = txt => `<b class="Red">${txt}</b>`;

exports.artist = meta => meta.ini.artist || red("artist MISSING");
exports.name = meta => meta.ini.name || red("name MISSING");
exports.charter = meta => meta.ini.charter || meta.ini.frets || red("charter MISSING");
exports.genre = meta => meta.ini.genre || red("genre MISSING");
exports.album = meta => meta.ini.album || red("album MISSING");
exports.year = meta => {
  const casted = +meta.ini.year;
  if (casted === 0 || meta.ini.year == null) return red("year MISSING");
  if (Number.isNaN(casted)) return red(`${meta.ini.year} (years should be numbers)`);
  return casted;
}
exports.track = meta => +meta.ini.album_track || +meta.ini.track || red("MISSING");
exports.icon = meta => meta.ini.icon || red("icon MISSING");
exports.preview = meta => +meta.ini.preview_start_time || red("MISSING");
exports.diff = meta => {
  const casted = +meta.ini.diff_guitar;
  if (casted === -1 || meta.ini.diff_guitar == null) return red("difficulty MISSING");
  if (casted < -1 || casted > 6) return red(`${casted} (diffs should be between 0 and 6)`);
  return casted;
};
exports.loading = meta => {
  const txt = meta.ini.loading_phrase;
  if (!txt) return red("MISSING");
  return txt;
};
exports.audioFormat = meta => {
  const { format } = meta.audio;
  if (!format.match(/mp3|vorbis/)) return red(`${format} (should be mp3 or vorbis (ogg))`);
  return format;
};
exports.duration = meta => formatTime(meta.audio.duration);
exports.bitrate = meta => {
  const { bitrate } = meta.audio;
  if (bitrate < 200) return red(`${bitrate} kbps (should be 200 or higher)`);
  return `${bitrate} kbps`;
};

exports.render = (parts, meta, ...args) => {
  let result = "";
  parts[1] = parts[1].trimLeft();
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].replace(/\n +/, "\n")
    result += part;
    if (args[i-1] == null) break;
    if (!exports[args[i-1]]) throw new Error(`This string function doesn't exist: "${args[i]}"!`);
    result += exports[args[i-1]](meta);
  }
  return result;
};