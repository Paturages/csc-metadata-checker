module.exports = song => `<div class="Song">
  <div class="Song__information">
    ${song.info}
  </div>
  <div class="Song__spectrogram">
    <img alt="" src="file://${song.spectrogram}" />
  </div>
</div>`;