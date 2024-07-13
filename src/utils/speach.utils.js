
export const saySomething = (text, voiceSynth, voiceName, rate = 1) => {
  const sayThis = new SpeechSynthesisUtterance(text);

  if (typeof text !== 'string' || text.trim() !== '') {
    sayThis.volume = 1;
    sayThis.rate = rate;
    sayThis.pitch = 1;
    sayThis.voice = voiceName;

    voiceSynth.speak(sayThis);
  }

  return sayThis;
};


export const getVoiceName = (options) => {
  const _options = options.split(',').map((item) => item.trim().toLowerCase());

  const available = speechSynthesis.getVoices().map(
    (item) => ({
      voice: item,
      name: item.name.trim().toLowerCase() }
    ));

    for (let a = 0; a < _options.length; a += 1) {
    const tmp = available.find((item) => item.name.includes(_options[a]));
    if (typeof tmp !== 'undefined') {
      return tmp.voice;
    }
  }

  return null;
};
