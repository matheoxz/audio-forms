import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import TextQuestion from './components/TextQuestion';
import EvaluationQuestion from './components/EvaluationQuestion';

// API base URL comes from the environment variable REACT_APP_API_BASE
const API_BASE = process.env.REACT_APP_API_BASE || '';

const Q1 = 'O que é dito em cada um dos áudios?';
const Q2 = 'De 1 a 5, como você avalia a qualidade dos audios acima?';

function App() {
  const [audiosList, setAudiosList] = useState([]); // ["audio1.wav", ...]
  const [startLoading, setStartLoading] = useState(true);
  const [startError, setStartError] = useState('');

  const [index, setIndex] = useState(0);

  // audioData now holds original, poisoned100 and poisoned300
  const [audioData, setAudioData] = useState(null); // { original: base64, poisoned100: base64, poisoned300: base64 }
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  // textAnswer holds an object mapping for the three audios
  const [textAnswer, setTextAnswer] = useState({ 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' });

  // evaluationAnswer holds numeric selections '1'..'5' for each audio
  const [evaluationAnswer, setEvaluationAnswer] = useState({ 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [userId, setUserId] = useState('');
  // Theme: follow system preference (prefers-color-scheme), fallback to light
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Show intro popup the first time the user accesses the form
  const [showIntro, setShowIntro] = useState(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return true;
      return !window.localStorage.getItem('seen_intro');
    } catch (e) {
      return true;
    }
  });

  function closeIntro() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('seen_intro', '1');
      }
    } catch (e) {
      // ignore
    }
    setShowIntro(false);
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  const isDone = index >= audiosList.length && audiosList.length > 0;

  useEffect(() => {
    async function fetchStart() {
      setStartLoading(true);
      setStartError('');
      try {
        const res = await fetch(`${API_BASE}/start`);
        if (!res.ok) throw new Error(`Erro ao buscar início: ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.audios) ? data.audios : [];
        setAudiosList(list);
        // Generate a per-session user UUID after /start
        const id = (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function')
          ? window.crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              const v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
        setUserId(id);
      } catch (e) {
        setStartError(e.message || 'Erro inesperado ao iniciar');
      } finally {
        setStartLoading(false);
      }
    }
    fetchStart();
  }, []);

  const currentAudioName = audiosList[index] || '';

  useEffect(() => {
    if (!currentAudioName) {
      setAudioData(null);
      return;
    }
    async function fetchAudio() {
      setAudioLoading(true);
      setAudioError('');
      setAudioData(null);
      try {
        let audiopath = currentAudioName.split('/');
        const res = await fetch(`${API_BASE}/audios/${audiopath[0]}/${encodeURIComponent(audiopath[1])}`);
        if (!res.ok) throw new Error(`Erro ao buscar áudios: ${res.status}`);
        const data = await res.json();
        // expect original, poisoned100 and poisoned300
        if (!data?.original || !data?.poisoned100 || !data?.poisoned300) {
          throw new Error('Resposta inválida do servidor para os áudios');
        }
        setAudioData({ original: data.original, poisoned100: data.poisoned100, poisoned300: data.poisoned300 });
      } catch (e) {
        setAudioError(e.message || 'Erro ao carregar áudios');
      } finally {
        setAudioLoading(false);
      }
    }
    fetchAudio();
    // reset answers at each new screen (only Q1)
    setTextAnswer({ 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' });
    setEvaluationAnswer({ 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' });
    setSubmitError('');
  }, [currentAudioName]);

  // Randomly map which data is "Audio 1" vs "Audio 2" vs "Audio 3" whenever audioData changes
  const mapping = useMemo(() => {
    if (!audioData) return null;
    // create an array of source keys and shuffle
    const keys = ['original', 'poisoned100', 'poisoned300'];
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    // keys[0] -> Audio 1, keys[1] -> Audio 2, keys[2] -> Audio 3
    return {
      audio1Key: keys[0],
      audio2Key: keys[1],
      audio3Key: keys[2],
      // also expose which label corresponds to which source
      originalLabel: keys.indexOf('original') === 0 ? 'Audio 1' : (keys.indexOf('original') === 1 ? 'Audio 2' : 'Audio 3'),
      poisoned100Label: keys.indexOf('poisoned100') === 0 ? 'Audio 1' : (keys.indexOf('poisoned100') === 1 ? 'Audio 2' : 'Audio 3'),
      poisoned300Label: keys.indexOf('poisoned300') === 0 ? 'Audio 1' : (keys.indexOf('poisoned300') === 1 ? 'Audio 2' : 'Audio 3'),
    };
  }, [audioData]);

  const audio1Src = useMemo(() => {
    if (!audioData || !mapping) return '';
    const key = mapping.audio1Key;
    const srcBase64 = audioData[key];
    return `data:audio/wav;base64,${srcBase64}`;
  }, [audioData, mapping]);

  const audio2Src = useMemo(() => {
    if (!audioData || !mapping) return '';
    const key = mapping.audio2Key;
    const srcBase64 = audioData[key];
    return `data:audio/wav;base64,${srcBase64}`;
  }, [audioData, mapping]);

  const audio3Src = useMemo(() => {
    if (!audioData || !mapping) return '';
    const key = mapping.audio3Key;
    const srcBase64 = audioData[key];
    return `data:audio/wav;base64,${srcBase64}`;
  }, [audioData, mapping]);

  function isTextAnswerComplete(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return ['Audio 1', 'Audio 2', 'Audio 3'].every((k) => {
      const v = obj[k];
      return typeof v === 'string' && v.trim().length > 0;
    });
  }

  function isEvaluationComplete(obj) {
    if (!obj || typeof obj !== 'object') return false;
    return ['Audio 1', 'Audio 2', 'Audio 3'].every((k) => {
      const v = obj[k];
      return typeof v === 'string' && ['1','2','3','4','5'].includes(v);
    });
  }

  const canSubmitAll = !!(audioData && mapping && isTextAnswerComplete(textAnswer) && isEvaluationComplete(evaluationAnswer));

  async function handleSubmit() {
    if (!canSubmitAll || !mapping) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        user: userId,
        audioName: currentAudioName,
        // mapping fields
        original: mapping.originalLabel,
        poisoned100: mapping.poisoned100Label,
        poisoned300: mapping.poisoned300Label,
        responses: {
          [Q1]: textAnswer,
          [Q2]: evaluationAnswer,
        },
      };

      const res = await fetch(`${API_BASE}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Falha ao enviar resposta: ${res.status} ${text}`);
      }

      // advance
      setIndex((i) => i + 1);
    } catch (e) {
      setSubmitError(e.message || 'Erro ao enviar respostas');
    } finally {
      setSubmitting(false);
    }
  }

  // UI
  return (
    <div className={`app-root ${theme === 'dark' ? 'dark' : ''}`} style={{ maxWidth: 800, margin: '0 auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>

      {/* Intro modal shown only the first time */}
      {showIntro && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content">
            <h2>Aviso sobre o estudo</h2>
            <p>
              Este estudo tem como objetivo desenvolver um ataque passivo contra modelos generativos de fala. Elaboramos este questionário para coletarmos dados qualitativos a respeito da eficácia do ataque.
            </p>
            <p>
              Para responder este questionário, é necessário que você consiga entender áudios em inglês, uma vez que o estudo utiliza uma base de dados em língua inglesa.
            </p>
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button onClick={closeIntro}>Entendi</button>
            </div>
          </div>
        </div>
      )}

      <h1>Pesquisa de Áudio</h1>

      {startLoading && <p>Carregando lista de áudios...</p>}
      {startError && (
        <div className="error">
          <p>Erro: {startError}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      )}

      {!startLoading && !startError && audiosList.length === 0 && (
        <p>Nenhum áudio disponível no momento.</p>
      )}

      {!isDone && !startLoading && !startError && currentAudioName && (
        <div>
          <p className="muted">
            Formulário {index + 1} de {audiosList.length}
          </p>

          {audioLoading && <p>Carregando áudios...</p>}
          {audioError && <p className="error">Erro ao carregar áudios: {audioError}</p>}

          {audioData && mapping && (
            <div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ flex: '1 1 220px' }}>
                  <h3>Audio 1</h3>
                  <audio controls src={audio1Src} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: '1 1 220px' }}>
                  <h3>Audio 2</h3>
                  <audio controls src={audio2Src} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: '1 1 220px' }}>
                  <h3>Audio 3</h3>
                  <audio controls src={audio3Src} style={{ width: '100%' }} />
                </div>
              </div>

              <TextQuestion
                question={Q1}
                value={textAnswer}
                onChange={(v) => setTextAnswer(v)}
                placeholder="Escreva o que é dito em cada áudio"
              />

              <EvaluationQuestion
                question={Q2}
                value={evaluationAnswer}
                onChange={(v) => setEvaluationAnswer(v)}
              />

              {submitError && <p className="error">{submitError}</p>}

              <button onClick={handleSubmit} disabled={!canSubmitAll || submitting}>
                {submitting ? 'Enviando...' : 'Enviar e próximo'}
              </button>
            </div>
          )}
        </div>
      )}

      {isDone && (
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <h2>Muito Obrigado</h2>
          <p>Sua participação é muito importante.</p>
        </div>
      )}
    </div>
  );
}

export default App;
