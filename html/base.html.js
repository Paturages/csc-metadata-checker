const htmlSong = require("./song.html");

module.exports = ({ app, songs }) => `<html lang="en-us">
<head>
  <title>CSC Metadata Checker - v${app.version}</title>
  <link rel="icon" href="https://customsongscentral.com/favicon.ico" />
  <style>
body {
  font-family: sans-serif;
}
.Song__spectrogram img {
  max-height: 500px;
}
.Yellow {
  color: #E65100;
  font-size: 1.25em;
}
.Red {
  color: #B71C1C;
  font-size: 1.25em;
}
.Song {
  margin: 2em 0;
}
.Song__title {
  font-size: 1.5em;
  font-weight: 500;
}
.Song__charter b {
  font-weight: 500;
}
.Song__warnings {
  margin: 1em 0;
}

  </style>
</head>
<body contenteditable="true" spellcheck="true">
  <h1>CSC Metadata Checker - v${app.version}</h1>
  <p>Click once somewhere on this page to enable spellcheck (for loading phrases)</p>
  ${songs.map(song => htmlSong(song)).join("\n")}
</body>
</html>`;