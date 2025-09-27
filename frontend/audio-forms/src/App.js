import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

// You can set REACT_APP_API_BASE to override the proxy/base URL in production
const API_BASE = process.env.REACT_APP_API_BASE || '';

const Q1 = 'O que dizem os audios?';
const Q2 = 'Há diferença notável na qualidade de um dos audios?';
const Q3 = 'Qual audio tem a pior qualidade'; // note: no question mark per spec

function App() {
  const [audiosList, setAudiosList] = useState([]); // ["audio1.wav", ...]
  const [startLoading, setStartLoading] = useState(true);
  const [startError, setStartError] = useState('');

  const [index, setIndex] = useState(0);

  const [audioData, setAudioData] = useState(null); // { original: base64, poisoned: base64 }
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState('');

  const [textAnswer, setTextAnswer] = useState('');
  const [diffAnswer, setDiffAnswer] = useState(''); // 'Sim' | 'Não'
  const [worstAnswer, setWorstAnswer] = useState(''); // 'Audio 1' | 'Audio 2' | 'Nenhum'

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [userId, setUserId] = useState('');

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
        const res = await fetch(`${API_BASE}/audios/${encodeURIComponent(currentAudioName)}`);
        if (!res.ok) throw new Error(`Erro ao buscar áudios: ${res.status}`);
        const data = await res.json();
        if (!data?.original || !data?.poisoned) {
          throw new Error('Resposta inválida do servidor para os áudios');
        }
        setAudioData({ original: data.original, poisoned: data.poisoned });
      } catch (e) {
        setAudioError(e.message || 'Erro ao carregar áudios');
      } finally {
        setAudioLoading(false);
      }
    }
    fetchAudio();
    // reset answers at each new screen
    setTextAnswer('');
    setDiffAnswer('');
    setWorstAnswer('');
    setSubmitError('');
  }, [currentAudioName]);

  // Randomly map which data is "Audio 1" vs "Audio 2" whenever audioData changes
  const mapping = useMemo(() => {
    if (!audioData) return null;
    const originalIsOne = Math.random() < 0.5;
    return {
      originalLabel: originalIsOne ? 'Audio 1' : 'Audio 2',
      poisonedLabel: originalIsOne ? 'Audio 2' : 'Audio 1',
    };
  }, [audioData]);

  const audio1Src = useMemo(() => {
    if (!audioData || !mapping) return '';
    const srcBase64 = mapping.originalLabel === 'Audio 1' ? audioData.original : audioData.poisoned;
    return `data:audio/wav;base64,${srcBase64}`;
  }, [audioData, mapping]);

  const audio2Src = useMemo(() => {
    if (!audioData || !mapping) return '';
    const srcBase64 = mapping.originalLabel === 'Audio 2' ? audioData.original : audioData.poisoned;
    return `data:audio/wav;base64,${srcBase64}`;
  }, [audioData, mapping]);

  const canSubmit = !!(
    audioData && mapping && textAnswer.trim() && diffAnswer && worstAnswer
  );

  async function handleSubmit() {
    if (!canSubmit || !mapping) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        user: userId,
        audioName: currentAudioName,
        original: mapping.originalLabel,
        poisoned: mapping.poisonedLabel,
        responses: {
          [Q1]: textAnswer.trim(),
          [Q2]: diffAnswer, // 'Sim' | 'Não'
          [Q3]: worstAnswer, // 'Audio 1' | 'Audio 2' | 'Nenhum'
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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
      <h1>Pesquisa de Áudio</h1>

      {startLoading && <p>Carregando lista de áudios...</p>}
      {startError && (
        <div style={{ color: 'red' }}>
          <p>Erro: {startError}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      )}

      {!startLoading && !startError && audiosList.length === 0 && (
        <p>Nenhum áudio disponível no momento.</p>
      )}

      {!isDone && !startLoading && !startError && currentAudioName && (
        <div>
          <p style={{ color: '#555' }}>
            Formulário {index + 1} de {audiosList.length}
          </p>

          {audioLoading && <p>Carregando áudios...</p>}
          {audioError && <p style={{ color: 'red' }}>Erro ao carregar áudios: {audioError}</p>}

          {audioData && mapping && (
            <div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3>Audio 1</h3>
                  <audio controls src={audio1Src} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: '1 1 300px' }}>
                  <h3>Audio 2</h3>
                  <audio controls src={audio2Src} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label htmlFor="q1" style={{ fontWeight: 600 }}>{Q1}</label>
                <br />
                <textarea
                  id="q1"
                  rows={4}
                  style={{ width: '100%', marginTop: 8 }}
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Escreva aqui sua resposta"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{Q2}</div>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="q2"
                    value="Sim"
                    checked={diffAnswer === 'Sim'}
                    onChange={(e) => setDiffAnswer(e.target.value)}
                  />{' '}
                  Sim
                </label>
                <label>
                  <input
                    type="radio"
                    name="q2"
                    value="Não"
                    checked={diffAnswer === 'Não'}
                    onChange={(e) => setDiffAnswer(e.target.value)}
                  />{' '}
                  Não
                </label>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{Q3}</div>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="q3"
                    value="Audio 1"
                    checked={worstAnswer === 'Audio 1'}
                    onChange={(e) => setWorstAnswer(e.target.value)}
                  />{' '}
                  Audio 1
                </label>
                <label style={{ marginRight: 16 }}>
                  <input
                    type="radio"
                    name="q3"
                    value="Audio 2"
                    checked={worstAnswer === 'Audio 2'}
                    onChange={(e) => setWorstAnswer(e.target.value)}
                  />{' '}
                  Audio 2
                </label>
                <label>
                  <input
                    type="radio"
                    name="q3"
                    value="Nenhum"
                    checked={worstAnswer === 'Nenhum'}
                    onChange={(e) => setWorstAnswer(e.target.value)}
                  />{' '}
                  Nenhum
                </label>
              </div>

              {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

              <button onClick={handleSubmit} disabled={!canSubmit || submitting}>
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
