
export const saySomething = (text, voiceSynth, voiceName) => {
  const sayThis = new SpeechSynthesisUtterance(text);
  // const voiceName = 'English (Australia)';

  sayThis.volume = 1;
  sayThis.rate = 1;
  sayThis.pitch = 1;
  sayThis.voice = voiceName;

  voiceSynth.speak(sayThis);
  return sayThis;
};
