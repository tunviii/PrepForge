import { useRef, useState, useCallback } from 'react';

export function useSpeechRecognition({ currentQuestion, totalQuestions, interviewEnded }) {
  const recognitionRef        = useRef(null);
  const currentTranscriptRef  = useRef('');
  const answerTranscriptsRef  = useRef([]);
  const [isListening, setIsListening] = useState(false);

  const init = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported. Use Chrome for best results.');
      return;
    }

    const r = new SpeechRecognition();
    r.continuous      = true;
    r.interimResults  = true;
    r.lang            = 'en-US';

    r.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscriptRef.current += event.results[i][0].transcript + ' ';
        }
      }
    };

    r.onerror = (e) => {
      if (e.error === 'network' || e.error === 'no-speech') {
        try { r.start(); } catch (_) {}
      }
    };

    r.onend = () => {
      if (currentQuestion < totalQuestions && !interviewEnded) {
        try { r.start(); } catch (_) {}
      }
    };

    recognitionRef.current = r;
  }, [currentQuestion, totalQuestions, interviewEnded]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) init();
    if (!recognitionRef.current) return;
    currentTranscriptRef.current = '';
    setIsListening(true);
    try { recognitionRef.current.start(); } catch (_) {}
  }, [init]);

  const stopListening = useCallback((questionIndex) => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    try { recognitionRef.current.stop(); } catch (_) {}
    const saved = currentTranscriptRef.current.trim() || '(no speech detected)';
    answerTranscriptsRef.current[questionIndex] = saved;
    currentTranscriptRef.current = '';
  }, []);

  const getTranscripts = useCallback(() => answerTranscriptsRef.current, []);

  return { isListening, startListening, stopListening, getTranscripts };
}