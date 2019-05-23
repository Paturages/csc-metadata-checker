module.exports = time => {
  const ms = time % 1;
  time = time >> 0;
  const seconds = time % 60;
  time = (time / 60) >> 0;
  const minutes = time % 60;
  time = (time / 60) >> 0;
  return (
    [
      time,
      minutes ? `0${minutes}`.slice(-2) : "00",
      seconds ? `0${seconds}`.slice(-2) : "00"
    ]
      .filter(x => x)
      .join(":") + ms.toFixed(3).slice(1)
  );
};