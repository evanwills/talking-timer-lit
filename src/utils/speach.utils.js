
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
