// AI-To: Web Speech API ile sesli geri bildirim sistemi

let speechEnabled = false;

export function initSpeech() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('ai-to-speech');
  speechEnabled = saved === 'true';
}

export function isSpeechEnabled() {
  return speechEnabled;
}

export function toggleSpeech() {
  speechEnabled = !speechEnabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ai-to-speech', String(speechEnabled));
  }
  return speechEnabled;
}

export function speak(message, lang = 'tr') {
  if (!speechEnabled) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Önceki konuşmayı durdur
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  // Uygun ses bul
  const voices = window.speechSynthesis.getVoices();
  const targetLang = lang === 'tr' ? 'tr' : 'en';
  const voice = voices.find(v => v.lang.startsWith(targetLang));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}
