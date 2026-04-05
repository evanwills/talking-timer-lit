

const playTone = (audio : AudioContext, ramp : number) =>
  (frequency : number, duration : number) =>
    (resolve : () => void, reject : () => void) => {
      const oscillator : OscillatorNode = audio.createOscillator();
      var gain : GainNode = audio.createGain();

      oscillator.connect(gain);
      oscillator.type = 'sine';

      gain.connect(audio.destination);
      gain.gain.exponentialRampToValueAtTime(
        ramp,
        audio.currentTime + duration
      );

      oscillator.frequency.value = frequency;
      oscillator.start(0);
    };

export const playEndChime = () : number => {
  /**
   * @member duration the length of time (in seconds) a
   *               sound makes
   */
  const durationTime : number = 0.75;

  /**
   * @member interval the number of seconds between sounds
   *               starting
   */
  const interval : number = 0.425;

  /**
   * @member ramp no idea what this is for. See MDN docs
   * https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime
   */
  const ramp : number = 0.00001;

  /**
   * @member {array} tones list of frequencies to be played
   */
  const tones : number[] = [
    440, 261.6, 830.6, 440, 261.6,
    830.6, 392, 440, 261.6, 830.6,
    440, 261.6, 830.6, 392, 440,
  ];

  /**
   * @member offset number of milliseconds from calling the sound is to start playing
   */
  let offset : number = 0;

  /**
   * @member delay number of milliseconds from calling the sound is to start playing
   */
  let delay : number = 0;

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
