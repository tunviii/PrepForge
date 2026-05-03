import { useRef, useState, useCallback } from 'react';

export function useSpeechRecognition({ currentQuestion, totalQuestions, interviewEnded }) {
  const recognitionRef       = useRef(null);
  const currentTranscriptRef = useRef('');
  const answerTranscriptsRef = useRef([]);
  const [isListening, setIsListening] = useState(false);

  // Store latest values in refs so onend/onresult closures are never stale
  const stateRef = useRef({ currentQuestion, totalQuestions, interviewEnded });
  stateRef.current = { currentQuestion, totalQuestions, interviewEnded };

  const init = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported. Use Chrome.');
      return;
    }

    const r = new SpeechRecognition();
    r.continuous     = true;
    r.interimResults = true;
    r.lang           = 'en-US';

    r.onresult = (event) => {
      
      let chunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        chunk += event.results[i][0].transcript;
      }
      currentTranscriptRef.current += chunk + ' ';
    };

    r.onerror = (e) => {
      if (e.error === 'network' || e.error === 'no-speech') {
        try { r.start(); } catch (_) {}
      }
    };

    r.onend = () => {
      
      const { currentQuestion: cq, totalQuestions: tq, interviewEnded: ended } = stateRef.current;
      if (cq < tq && !ended) {
        setTimeout(() => { try { r.start(); } catch (_) {} }, 300);
      }
    };

    recognitionRef.current = r;
  }, []); 

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