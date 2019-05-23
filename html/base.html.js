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
  </style>
</head>
<body contenteditable="true" spellcheck="true">
  <h1>CSC Metadata Checker - v${app.version}</h1>
  <p>Click once somewhere on this page to enable spellcheck (for loading phrases)</p>
  ${songs.map(song => htmlSong(song)).join("\n")}
</body>
</html>`;