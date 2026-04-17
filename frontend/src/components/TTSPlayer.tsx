import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  text: string;           // todo el guion o transcripción
  rate?: number;          // 0.5–2
  pitch?: number;         // 0–2
  lang?: string;          // ej. "es-MX" | "es-ES"
};
export default function TTSPlayer({ text, rate = 1, pitch = 1, lang = 'es-MX' }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState<number>(-1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // cargar voces
  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(lang.slice(0,2))));
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, [lang]);

  const voice = useMemo(() => (voiceIndex >= 0 ? voices[voiceIndex] : voices[0]), [voiceIndex, voices]);

  const play = () => {
    if (!('speechSynthesis' in window)) return;
    stop(); // limpiar previo
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || lang;
    u.voice = voice || null;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => setPlaying(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
  };
  const pause = () => { window.speechSynthesis.pause(); setPlaying(false); };
  const resume = () => { window.speechSynthesis.resume(); setPlaying(true); };
  const stop = () => { window.speechSynthesis.cancel(); setPlaying(false); };

  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <button onClick={playing ? pause : play}>{playing ? 'Pausar' : 'Reproducir'}</button>
      <button onClick={resume} disabled={playing}>Continuar</button>
      <button onClick={stop}>Detener</button>
      <select value={voiceIndex} onChange={(e)=>setVoiceIndex(Number(e.target.value))}>
        <option value={-1}>Auto</option>
        {voices.map((v,i)=><option key={v.name} value={i}>{v.name} ({v.lang})</option>)}
      </select>
    </div>
  );
}
