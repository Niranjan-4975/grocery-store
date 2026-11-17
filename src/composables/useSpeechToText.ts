import { ref } from "vue";
import { useNotify } from "./useNotify";
import { useI18n } from "vue-i18n";

export function useSpeechToText() {
  const { notify } = useNotify();
  const isListening = ref(false);
  const { locale } = useI18n();

  //Play sound on mic click
  const playMicSound = (type: 'start' | 'success') => {
    const audio = new Audio(type === 'start' ? "sounds/mic-click.mp3" : "sounds/mic-success.mp3");
    audio.play().catch(() => {}); // Ignore play errors
  }
  
  const startListening = (onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        notify.error("Your browser does not support Voice Search.");
        return;
    }
    const recognition = new SpeechRecognition();
    // Language Setup: mr-MR for Marathi, hin-HI for Hindi, en-IN for Indian English
    // ✅ Mapping UI language to Speech Locale
    const langMap: any = {
      en: 'en-IN',
      mr: 'mr-IN',
      hi: 'hi-IN'
    };
    recognition.lang = langMap[locale.value] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening.value = true;
        playMicSound('start');
        notify.success("Listening... Speak now. 🎙️");
    };
    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');

        if (event.results[event.results.length - 1].isFinal) {
            playMicSound('success');
            onResult(transcript);
            recognition.stop();
        }
    };
    recognition.onerror = (_event: any) => {
        isListening.value = false;
        notify.error("Could not recognize speech.");
    };
    recognition.onend = () => {
        isListening.value = false;
    };
    recognition.start();
  };
  return { isListening, startListening };
}