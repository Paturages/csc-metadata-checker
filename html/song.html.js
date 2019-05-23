module.exports = song => `<div class="Song">
  <div class="Song__information">
    ${song.html}
  </div>
  <div class="Song__warnings">
    ${song.info}
  </div>
  <div class="Song__spectrogram">
    <img alt="" src="file://${song.spectrogram}" />
  </div>
</div>`;