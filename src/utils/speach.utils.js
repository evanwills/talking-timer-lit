
export const saySomething = (voiceSynth, text) => {
  const sayThis = new SpeechSynthesisUtterance(text);
  const voiceName = 'English (Australia)';

  sayThis.volume = 2;
  sayThis.rate = 1;
  sayThis.pitch = 1;
  sayThis.voice = speechSynthesis.getVoices().find((voice) => (voice.name === voiceName));

  voiceSynth.speak(sayThis);
};
