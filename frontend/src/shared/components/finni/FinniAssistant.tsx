import { useEffect, useRef, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import finni from '../../../assets/onb1.png';
import './finni-assistant.css';

export type FinniAdvice = { title: string; text: string; tone?: 'info' | 'success' | 'review' };
/** Cue identifies a meaningful event, not a render. Dismissed advice stays dismissed until the next event. */
export default function FinniAssistant({
  advice,
  cue,
}: {
  advice: FinniAdvice;
  cue: string | null;
}) {
  const [open, setOpen] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (cue !== null) setOpen(true);
  }, [cue]);
  const close = () => {
    setOpen(false);
    launcher.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        launcher.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <aside className={`finni-assistant ${open ? 'is-open' : ''}`} aria-label="Tu acompañante Finni">
      {open && (
        <div key={cue} className={`finni-speech ${advice.tone ?? 'info'}`}>
          <div className="finni-speech-top">
            <span>Finni está contigo</span>
            <button type="button" aria-label="Cerrar consejo de Finni" onClick={close}>
              <X size={19} aria-hidden="true" />
            </button>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true">
            <strong>Finni · {advice.title}</strong>
            <p>{advice.text}</p>
          </div>
        </div>
      )}
      <button
        ref={launcher}
        type="button"
        className="finni-launcher"
        aria-label={open ? 'Ocultar consejo de Finni' : 'Pedir una pista a Finni'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <img src={finni} alt="" draggable={false} />
        <span>
          <MessageCircle size={15} aria-hidden="true" />
          {open ? 'Aquí estoy' : '¿Una pista?'}
        </span>
      </button>
    </aside>
  );
}
