

const playTone = (audio, ramp) => (frequency, duration) => (resolve, reject) => {
  const oscillator = audio.createOscillator();
  var gain = audio.createGain();

  oscillator.connect(gain);
  oscillator.type = 'sign';

  gain.connect(audio.destination);
  gain.gain.exponentialRampToValueAtTime(
    ramp,
    audio.currentTime + duration
  );

  oscillator.frequency.value = frequency;
  oscillator.start(0);
};

export const playEndChime = () => {
  /**
   * @var {number} duration the length of time (in seconds) a
   *               sound makes
   */
  const durationTime = 0.75;

  /**
   * @var {number} interval the number of seconds between sounds
   *               starting
   */
  const interval = 0.425;

  /**
   * @var {number} ramp no idea what this is for. See MDN docs
   * https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime
   */
  const ramp = 0.00001;

  /**
   * @var {array} tones list of frequencies to be played
   */
  const tones = [
    440, 261.6, 830.6, 440, 261.6,
    830.6, 392, 440, 261.6, 830.6,
    440, 261.6, 830.6, 392, 440,
  ];

  /**
   * @var {number} offset number of milliseconds from calling the
   *               sound is to start playing
   */
  let offset = 0;
  let delay = 0;

  const player = playTone(new AudioContext(), ramp);

  for (let a = 0; a < tones.length; a += 1) {
    new Promise((resolve, reject) => {
      const toneFunc = player(tones[a], durationTime)
      window.setTimeout(toneFunc, offset)
    })
    offset += (interval * 1000)
    delay += ((durationTime * 0.667) * 1000);
  }

  return delay;
};
