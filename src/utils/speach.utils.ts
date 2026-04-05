
export const saySomething = (
  text : string,
  voiceSynth : SpeechSynthesis,
  voiceName : SpeechSynthesisVoice,
  rate = 1,
) : SpeechSynthesisUtterance => {
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


export const getVoiceName = (options : string) : SpeechSynthesisVoice | null => {
  const _options = options.split(',').map((item) => item.trim().toLowerCase());

  const available = speechSynthesis.getVoices().map(
    (item) => ({
      voice: item,
      name: item.name.trim().toLowerCase() }
    ));

  for (const _option of _options) {
    const tmp = available.find((item) => item.name.includes(_option));
    if (typeof tmp !== 'undefined') {
      return tmp.voice;
    }
  }

  return null;
};
