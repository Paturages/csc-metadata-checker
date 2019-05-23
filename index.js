const getMetaFromChart = require("./scanners/chart");
const getMetaFromMidi = require("./scanners/midi");
const getMetaFromIni = require("./scanners/ini");

const app = require("./package.json");
const { render: renderConsole } = require("./utils/console");
const { render: renderHtml } = require("./utils/html");
const { ls, stat, read, write, mkdir, execDir } = require("./utils/fs");
const { prompt, cleanPrompt } = require("./utils/prompt");
const formatTime = require("./utils/format-time");
const sox = require("./utils/sox");
const html = require("./html/base.html");
const path = require("path");
const rimraf = require("rimraf");
const rm = require("util").promisify(rimraf);

const yellow = txt => `\x1b[33m${txt}\x1b[0m`;
const red = txt => `\x1b[31m${txt}\x1b[0m`;

const ORIGIN = process.argv[2] ? path.resolve(process.argv[2]) : execDir;
const songs = [];

const crawl = async root => {
  const files = await ls(root);
  const meta = { info: "" };
  const info = txt => {
    console.log(txt);
    meta.info += txt
      .replace(/..33m([^[]+)..0m/g, `<b class="Yellow">$1</b>`)
      .replace(/..31m([^[]+)..0m/g, `<b class="Red">$1</b>`);
    meta.info += "<br />";
  }
  for (let file of files) {
    const stats = await stat(file);
    const [name] = file.split(path.sep).slice(-1);
    if (stats.isDirectory()) {
      await crawl(file);
    } else if (file.match(/\.mid$/)) {
      if (name !== "notes.mid") {
        info(`[${red("FOUND")}] "${file}" needs to be renamed to "notes.mid" (case-sensitive)`);
      }
      const buffer = await read(file, { encoding: null });
      try {
        meta.chart = getMetaFromMidi(buffer);
      } catch (e) {
        info(`[${yellow("WARN")}] This .mid file could not be scanned, but it might work anyway`);
        info(`[${yellow("WARN")}] ${e.message}`);
      }
    } else if (file.match(/\.chart$/)) {
      if (name !== "notes.chart") {
        info(`[${red("FOUND")}] "${file}" needs to be renamed to "notes.chart" (case-sensitive)`);
      }
      const buffer = await read(file, { encoding: null });
      meta.chart = getMetaFromChart(buffer);
    } else if (name === "song.ini") {
      const buffer = await read(file, { encoding: null });
      meta.ini = getMetaFromIni(buffer);
    } else if (file.match(/\.(mp3|ogg)$/)) {
      if (!name.match(/^(guitar|bass|rhythm|drums_?.|vocals|keys|song)\.(ogg|mp3)$/i)) {
        info(`[${red("FOUND")}] "${file}" probably doesn't belong in a CH song folder`);
      }
      meta.audio = await sox.info(file);
      meta.spectrogram = await sox.spectrogram(file);
    } else if (!file.match(/\.(png|jpg|mp4|webm)/)) {
      // TODO: Check album art (#4)
      info(`[${red("FOUND")}] "${file}" probably doesn't belong in a CH song folder`);
    }
  }
  if (!meta.chart || !meta.ini) return;
  // Log and check for missing/invalid fields
  // s.log takes in a template for console.logging, with
  // parameters that interface on the ./strings.js functions.
  // The very first parameter is the meta itself, which the
  // ./strings.js functions need.
  // (you probably shouldn't do that in your own code, it's for my own usage lmao)
  renderConsole`${meta}
  ${"artist"} - ${"name"} [${"charter"}]
  ${"genre"} | ${"album"} (${"year"}; track ${"track"})
  ${"icon"} | preview_start_time = ${"preview"} | diff_guitar = ${"diff"}
  audio = ${"audioFormat"} | length = ${"duration"} | bitrate = ${"bitrate"}
  loading_phrase = ${"loading"}`;
  // Same for the HTML
  meta.html = renderHtml`${meta}
  <div class="Song__title">${"artist"} - ${"name"}</div>
  <div class="Song__charter">charted by <b>${"charter"}</b></div>
  <div class="Song__meta">
    genre = ${"genre"} | album = ${"album"} (${"year"}; track ${"track"})<br />
    ${"icon"} | preview_start_time = ${"preview"} | diff_guitar = ${"diff"}<br />
    audio = ${"audioFormat"} | length = ${"duration"} | bitrate = ${"bitrate"}<br />
    loading_phrase = ${"loading"}
  </div>`;

  if (+meta.ini.delay)
    info(`[${red("FOUND")}] This chart includes delay in song.ini`);
  if (meta.chart.brokenNotes && meta.chart.brokenNotes.length) {
    info(`[${red("FOUND")}] Broken notes have been found!`);
    for (let note of meta.chart.brokenNotes) {
      note.time = formatTime(note.time);
      meta.info += JSON.stringify(note);
      meta.info += "<br />";
    }
    console.log(meta.chart.brokenNotes);
  }
  if (meta.chart.chartMeta && +meta.chart.chartMeta.length > meta.audio.duration) {
    info(`[${red("FOUND")}] Either song_length is faulty, or there might be notes in the chart after the song!`);
    info(`  song_length  = ${formatTime(meta.audio.duration)}`);
    info(`  vs.`);
    info(`  chart_length = ${formatTime(meta.chart.chartMeta.length)}`);
  }
  console.log("---");
  songs.push(meta);
};

(async () => {
  // Remove all previous spectrograms from dist directory upon launch
  await rm(path.join(execDir, "spectrograms/*"));
  // Create spectrogram directory if it doesn't exist
  await mkdir(path.join(execDir, "spectrograms")).catch(() => {});

  console.log(`CSC Metadata Checker - v${app.version}`);
  console.log("---");
  await crawl(ORIGIN);
  // Generate HTML
  const htmlPath = path.join(execDir, "output.html");
  await write(htmlPath, html({ app, songs }));
  console.log(`Done! You can open

  file://${htmlPath}

in a browser to browse the results with their spectrograms.`);
  await prompt("Press Enter to exit...");
  cleanPrompt();
})();
