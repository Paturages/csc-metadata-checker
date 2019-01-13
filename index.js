const getMetaFromChart = require('./scanners/chart');
const getMetaFromMidi = require('./scanners/midi');
const getMetaFromIni = require('./scanners/ini');

const package = require("./package.json");
const fs = require('fs');
const util = require('util');
const Glob = require('glob');
const path = require('path');
const readline = require('readline');
const yellow = txt => `\x1b[33m${txt}\x1b[0m`;
const red = txt => `\x1b[31m${txt}\x1b[0m`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = message => new Promise((resolve, reject) =>
  rl.question(message, answer => resolve(answer))
);

const ls = (folder, pattern) => new Promise((resolve, reject) =>
  Glob(pattern, {
    absolute: true,
    realpath: true,
    cwd: folder
  }, (err, res) => err ? reject(err) : resolve(res))
);
const stat = path => util.promisify(fs.stat)(path);

const read = util.promisify(fs.readFile);

const ORIGIN = process.argv[2] || __dirname;

const formatTime = time => {
  const ms = time % 1;
  time = time >> 0;
  const seconds = time % 60;
  time = time / 60 >> 0;
  const minutes = time % 60;
  time = time / 60 >> 0;
  return [
    time,
    minutes ? `0${minutes}`.slice(-2) : "00",
    seconds ? `0${seconds}`.slice(-2) : "00",
  ].filter(x => x).join(':') + ms.toFixed(3).slice(1);
}

const crawl = async root => {
  const files = await ls(root, "*");
  const meta = {};
  for (let file of files) {
    const stats = await stat(file);
    if (stats.isDirectory()) {
      await crawl(file);
    } else if (file.match(/\.mid$/)) {
      const buffer = await read(file, { encoding: null });
      try {
        meta.chart = getMetaFromMidi(buffer);
        meta.chart.brokenNotes && meta.chart.brokenNotes.forEach(note => {
          note.time = formatTime(note.time / 1000);
        });
      } catch (e) {
        console.log(`[${yellow("WARN")}] This .mid file could not be scanned, but it might work anyway`)
        console.log(`[${yellow("WARN")}] ${e.message}`);
      }
    } else if (file.match(/\.chart$/)) {
      const buffer = await read(file, { encoding: null });
      meta.chart = getMetaFromChart(buffer);
      meta.chart.brokenNotes && meta.chart.brokenNotes.forEach(note => {
        note.time = formatTime(note.time);
      });
    } else if (file.match(/song\.ini$/)) {
      const buffer = await read(file, { encoding: null });
      meta.ini = getMetaFromIni(buffer);
      console.log(`${meta.ini.artist || red("artist MISSING")} - ${meta.ini.name || red("name MISSING")} [${meta.ini.charter || meta.ini.frets || red("charter MISSING")}]
${meta.ini.genre || red("genre MISSING")} | ${meta.ini.album || red("album MISSING")} (${meta.ini.year || red("year MISSING")}; track ${meta.ini.album_track || meta.ini.track || red("MISSING")})
${[
  "icon",
  "preview_start_time",
  "diff_guitar"
].map(x =>
  meta.ini[x] && meta.ini[x] != 0 ?
    `${x} = ${meta.ini[x]}` :
    red(`${x} MISSING`)
  ).join(" | ")}
loading_phrase = ${meta.ini.loading_phrase || red("MISSING")}`);
    }
  }
  if (!meta.chart || !meta.ini) return;
  if (+meta.ini.delay) console.log(`[${red("FOUND")}] This chart includes delay in song.ini`);
  if (meta.chart.brokenNotes && meta.chart.brokenNotes.length) {
    console.log(`[${red("FOUND")}] Broken notes have been found!`);
    console.log(meta.chart.brokenNotes);
  }
  if (meta.ini.song_length && +meta.chart.chartMeta.length > +meta.ini.song_length / 1000) {
    console.log(`[${red("FOUND")}] Either song_length is faulty, or there might be notes in the chart after the song!
  song_length  = ${formatTime(meta.ini.song_length / 1000)}
  vs.
  chart_length = ${formatTime(meta.chart.chartMeta.length)}`);
  }
  console.log("---");
}

(async () => {
  console.log(`CSC Metadata Checker - v${package.version}`);
  console.log("---");
  await crawl(ORIGIN);
  await prompt("Press Enter to exit...");
  rl.close();
})();
