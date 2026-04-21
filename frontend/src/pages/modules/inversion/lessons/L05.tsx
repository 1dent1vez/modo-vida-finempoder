import { useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';

const INSTRUMENTOS = [
  { emoji: '🔵', nombre: 'Instrumentos de Deuda (Renta Fija)', desc: 'Prestas dinero al gobierno o empresa y te pagan interés. Monto y plazo conocidos.', ejemplos: 'CETES, Bondes, depósitos a plazo', minimo: '$100', riesgo: 2, rendimiento: '8-11% anual', tipo: 'deuda', liquidez: 'Alta', paraQuien: 'Ideal para principiantes y perfil conservador.' },
  { emoji: '🔴', nombre: 'Renta Variable (Acciones)', desc: 'Compras parte de una empresa. Mayor riesgo y mayor potencial de rendimiento.', ejemplos: 'Acciones en la BMV (Cemex, Bimbo, América Móvil)', minimo: '~$200', riesgo: 4, rendimiento: 'Variable (puede ser negativo)', tipo: 'variable', liquidez: 'Media', paraQuien: 'Para perfiles moderados a agresivos con horizonte largo.' },
  { emoji: '🟡', nombre: 'Fondos de Inversión', desc: 'Grupo de personas que juntan su dinero e invierten colectivamente. Un gestor decide dónde.', ejemplos: 'Fondos de deuda, balanceados o de acciones regulados por CNBV', minimo: '$100-$5,000', riesgo: 3, rendimiento: 'Varía según el fondo', tipo: 'deuda', liquidez: 'Media-Alta', paraQuien: 'Accesibles con montos pequeños. Riesgo variable según el fondo.' },
  { emoji: '🟢', nombre: 'Bienes Raíces Digitales (FIBRAs)', desc: 'Inversión en bienes inmuebles a través de la bolsa. Desde montos pequeños.', ejemplos: 'FIBRA Uno, FIBRA Danhos en la BMV', minimo: '~$500', riesgo: 3, rendimiento: '7-10% anual', tipo: 'variable', liquidez: 'Media', paraQuien: 'Para quienes quieren bienes raíces sin comprar un inmueble.' },
];

const QUIZ_ITEMS = [
  { nombre: 'CETES', tipo: 'deuda' },
  { nombre: 'Acción de Cemex en BMV', tipo: 'variable' },
  { nombre: 'Depósito a plazo en banco', tipo: 'deuda' },
  { nombre: 'FIBRA Danhos', tipo: 'variable' },
  { nombre: 'Fondo de deuda gubernamental', tipo: 'deuda' },
];

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const errorColor = 'var(--color-brand-error)';

export default function L05() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [comparar, setComparar] = useState<number[]>([]);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<(string | null)[]>(Array(5).fill(null));

  const aciertos = respuestas.filter((r, i) => r === QUIZ_ITEMS[i]!.tipo).length;
  const quizCompleto = respuestas.every((r) => r !== null);
  const score = quizCompleto ? aciertos / 5 : 0;

  const toggleComparar = (i: number) => {
    setComparar((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 2) return [prev[1]!, i];
      return [...prev, i];
    });
  };

  const filtrados = filtro
    ? INSTRUMENTOS.filter((inst) => {
        if (filtro === 'conservador') return inst.riesgo <= 2;
        if (filtro === 'equilibrio') return inst.riesgo === 3;
        return inst.riesgo >= 4;
      })
    : INSTRUMENTOS;

  return (
    <LessonShell id="L05" title="El menú de inversiones: ¿qué opciones existen en México?" completion={{ ready: quizCompleto, score }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Menú */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="El menú de inversiones" message="Así como en un restaurante hay opciones de distintos precios y estilos, en el mundo de las inversiones hay un menú. Hoy lo vas a conocer para elegir con criterio." />
            <div className="space-y-4">
              {INSTRUMENTOS.map((inst, i) => (
                <div
                  key={inst.nombre}
                  className="rounded-2xl overflow-hidden border-2 transition-all"
                  style={{ borderColor: expandido === i ? warnColor : 'var(--color-border)' }}
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    style={{ backgroundColor: expandido === i ? warnBg : 'var(--color-neutral-50)' }}
                    onClick={() => setExpandido(expandido === i ? null : i)}
                  >
                    <p className="text-2xl">{inst.emoji}</p>
                    <div className="flex-1">
                      <p className="text-sm font-extrabold">{inst.nombre}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-[var(--color-neutral-300)] text-[var(--color-text-secondary)]">Desde {inst.minimo}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold border border-[var(--color-neutral-300)] text-[var(--color-text-secondary)]">Riesgo {'⭐'.repeat(inst.riesgo)}{'☆'.repeat(5 - inst.riesgo)}</span>
                      </div>
                    </div>
                  </div>
                  {expandido === i && (
                    <div className="p-4 bg-white">
                      <p className="text-sm mb-2">{inst.desc}</p>
                      <p className="text-sm"><b>Ejemplos:</b> {inst.ejemplos}</p>
                      <p className="text-sm"><b>Rendimiento típico:</b> {inst.rendimiento}</p>
                      <p className="text-sm"><b>Liquidez:</b> {inst.liquidez}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2">💡 {inst.paraQuien}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <FinniMessage variant="coach" title="Para estudiantes que empiezan" message="Las opciones más accesibles son CETES, fondos de inversión de bajo riesgo y plataformas de micro-inversión reguladas." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Comparar instrumentos →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Comparador + filtro */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Compara 2 instrumentos</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Selecciona 2 para compararlos lado a lado:</p>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTOS.map((inst, i) => (
                <button
                  key={inst.nombre}
                  onClick={() => toggleComparar(i)}
                  className="px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-colors"
                  style={{
                    borderColor: warnColor,
                    backgroundColor: comparar.includes(i) ? warnColor : 'transparent',
                    color: comparar.includes(i) ? 'white' : 'inherit',
                  }}
                >
                  {inst.emoji} {inst.nombre.split(' ')[0]}
                </button>
              ))}
            </div>
            {comparar.length === 2 && (
              <div className="flex gap-4">
                {comparar.map((idx) => {
                  const inst = INSTRUMENTOS[idx]!;
                  return (
                    <FECard key={idx} variant="flat" className="flex-1 border" style={{ borderColor: warnColor }}>
                      <p className="font-bold">{inst.emoji} {inst.nombre.split('(')[0]}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs"><b>Mínimo:</b> {inst.minimo}</p>
                        <p className="text-xs"><b>Riesgo:</b> {'⭐'.repeat(inst.riesgo)}</p>
                        <p className="text-xs"><b>Rendimiento:</b> {inst.rendimiento}</p>
                        <p className="text-xs"><b>Liquidez:</b> {inst.liquidez}</p>
                      </div>
                    </FECard>
                  );
                })}
              </div>
            )}

            <p className="text-xl font-bold mt-2">Filtrar por perfil:</p>
            <div className="flex flex-wrap gap-2">
              {['conservador', 'equilibrio', 'crecimiento'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(filtro === f ? null : f)}
                  className="px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-colors"
                  style={{
                    borderColor: warnColor,
                    backgroundColor: filtro === f ? warnColor : 'transparent',
                    color: filtro === f ? 'white' : 'inherit',
                  }}
                >
                  {f === 'conservador' ? 'Seguridad (bajo riesgo)' : f === 'equilibrio' ? 'Equilibrio' : 'Crecimiento (mayor riesgo)'}
                </button>
              ))}
            </div>
            {filtro && (
              <div className="space-y-2">
                {filtrados.map((inst) => (
                  <div key={inst.nombre} className="p-3 rounded-xl" style={{ backgroundColor: warnBg }}>
                    <p className="text-sm font-bold">{inst.emoji} {inst.nombre}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{inst.ejemplos}</p>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(2)}>
              Quiz de reconocimiento →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Quiz */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Quiz: ¿deuda o variable?</p>
            <div className="space-y-4">
              {QUIZ_ITEMS.map((item, i) => {
                const resp = respuestas[i];
                const respondido = resp !== null;
                const correcto = resp === item.tipo;
                return (
                  <FECard key={item.nombre} variant="flat" className="border" style={{ borderColor: respondido ? (correcto ? successColor : errorColor) : 'var(--color-border)' }}>
                    <p className="text-sm font-bold mb-2">{item.nombre}</p>
                    <div className="flex gap-2">
                      {(['deuda', 'variable'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { if (!respondido) setRespuestas((prev) => prev.map((r, idx) => idx === i ? opt : r)); }}
                          disabled={respondido}
                          className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors disabled:cursor-default"
                          style={{
                            borderColor: resp === opt ? (item.tipo === opt ? successColor : errorColor) : (respondido ? 'var(--color-neutral-200)' : warnColor),
                            backgroundColor: resp === opt ? (item.tipo === opt ? successBg : 'var(--color-brand-error-bg)') : 'transparent',
                          }}
                        >
                          {opt === 'deuda' ? 'Deuda' : 'Variable'}
                        </button>
                      ))}
                    </div>
                    {respondido && (
                      <p className="text-xs mt-1.5" style={{ color: correcto ? successColor : errorColor }}>
                        {correcto ? '✓ Correcto' : `✗ Es ${item.tipo === 'deuda' ? 'Deuda' : 'Renta Variable'}`}
                      </p>
                    )}
                  </FECard>
                );
              })}
            </div>
            {quizCompleto && (
              <div className="space-y-4">
                <FECard variant="flat" className="border-2 text-center" style={{ borderColor: aciertos >= 4 ? successColor : infoColor, backgroundColor: aciertos >= 4 ? successBg : infoBg }}>
                  <p className="text-3xl">{aciertos >= 4 ? '🎯' : '📚'}</p>
                  <p className="font-extrabold">{aciertos}/5 correctas</p>
                </FECard>
                <FinniMessage variant="coach" title="¡Ya conoces el menú!" message="En las próximas lecciones vamos a profundizar en los instrumentos más relevantes para ti: CETES, fondos y bolsa." />
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
