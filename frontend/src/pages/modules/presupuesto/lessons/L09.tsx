import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const SUGERENCIAS = ['Un viaje', 'Una laptop', 'Ropa nueva', 'Fondo de emergencias', 'Un regalo especial'];

const SMART_LETTERS = [
  { letter: 'S', name: 'Específica', desc: '¿Qué exactamente quieres lograr?' },
  { letter: 'M', name: 'Medible', desc: '¿Cómo sabrás que lo lograste? (cantidad, fecha)' },
  { letter: 'A', name: 'Alcanzable', desc: '¿Es realista con tu ingreso actual?' },
  { letter: 'R', name: 'Relevante', desc: '¿Por qué es importante para ti?' },
  { letter: 'T', name: 'Temporal', desc: '¿Cuándo lo lograrás?' },
];

export default function L09() {
  const [step, setStep] = useState(0);

  const [queQuieres, setQueQuieres] = useState('');
  const [monto, setMonto] = useState('');
  const [porQue, setPorQue] = useState('');
  const [plazoMeses, setPlazoMeses] = useState(6);

  const montoNum = parseFloat(monto) || 0;
  const aporteMensual = plazoMeses > 0 && montoNum > 0 ? Math.ceil(montoNum / plazoMeses) : 0;

  const step1Valid = queQuieres.trim().length >= 3;
  const step2Valid = montoNum > 0;
  const step4Valid = porQue.trim().length >= 5;
  const step5Valid = plazoMeses >= 1 && plazoMeses <= 24;

  const allValid = step1Valid && step2Valid && step4Valid && step5Valid;

  const metaText = allValid
    ? `Quiero ${queQuieres} ahorrando $${montoNum.toLocaleString()} en ${plazoMeses} meses apartando ~$${aporteMensual.toLocaleString()} al mes. Porque: ${porQue}.`
    : '';

  const isAlcanzable = useMemo(() => {
    return aporteMensual <= 2500 * 0.3;
  }, [aporteMensual]);

  useEffect(() => {
    if (allValid) {
      void lessonDataRepository.save('presupuesto', 'l9_smart_goal', {
        queQuieres,
        monto: montoNum,
        porQue,
        plazoMeses,
        aporteMensual,
        metaText,
      });
    }
  }, [allValid, queQuieres, montoNum, porQue, plazoMeses, aporteMensual, metaText]);

  const progressValue = step === 0 ? 0 : step === 1 ? 20 : step === 2 ? 50 : 100;

  return (
    <LessonShell
      id="L09"
      title="Metas financieras con método: el sistema SMART"
      completion={{ ready: allValid }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¿Qué es una meta SMART?"
              message={`"Quiero ahorrar" no es una meta. "Quiero ahorrar $3,000 para mi viaje de graduación en 6 meses apartando $500 al mes" — eso sí es una meta. ¿Notas la diferencia?`}
            />
            <div className="space-y-2">
              {SMART_LETTERS.map((s) => (
                <FECard key={s.letter} variant="flat" className="border border-[var(--color-brand-warning)]">
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold min-w-8 text-[var(--color-brand-warning)]">{s.letter}</p>
                    <div>
                      <p className="font-bold">{s.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{s.desc}</p>
                    </div>
                  </div>
                </FECard>
              ))}
            </div>
            <FinniMessage
              variant="coach"
              title="Una meta SMART"
              message="Es como un GPS financiero. Sin ella, solo estás manejando sin rumbo."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡Crear mi meta! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Formulario guiado (5 pasos)</p>

            <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
              <p className="font-bold text-sm mb-2">
                Paso 1/5 — ¿Qué quieres lograr? (S — Específica)
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-text-secondary)]">¿Qué quieres?</label>
                <input
                  value={queQuieres}
                  onChange={(e) => setQueQuieres(e.target.value)}
                  placeholder="Ej: comprar una laptop, hacer un viaje..."
                  className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQueQuieres(s)}
                    className="px-2 py-0.5 rounded-full text-xs border border-[var(--color-neutral-200)] text-[var(--color-text-secondary)] cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FECard>

            <FECard
              variant="flat"
              className={cn('border transition-opacity', step1Valid ? 'border-[var(--color-brand-warning)]' : 'border-[var(--color-neutral-200)] opacity-50')}
            >
              <p className="font-bold text-sm mb-2">
                Paso 2/5 — ¿Cuánto dinero necesitas? (M — Medible)
              </p>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-text-secondary)]">Monto en pesos</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  disabled={!step1Valid}
                  min={1}
                  className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
            </FECard>

            {step2Valid && (
              <FECard variant="flat" className="border border-[var(--color-brand-info)] bg-[var(--color-brand-info)]/10">
                <p className="font-bold text-sm mb-2">
                  Paso 3/5 — ¿Es alcanzable? (A — Alcanzable)
                </p>
                <p className="text-sm mb-2">
                  Plazo: <b>{plazoMeses} {plazoMeses === 1 ? 'mes' : 'meses'}</b>
                </p>
                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 6, 9, 12, 18, 24].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPlazoMeses(m)}
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors',
                        plazoMeses === m
                          ? 'bg-[var(--color-brand-warning)] text-white border-[var(--color-brand-warning)]'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-text-secondary)]'
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <FECard
                  variant="flat"
                  className={cn('mt-3', isAlcanzable ? 'bg-[var(--color-brand-success)]/10' : 'bg-[var(--color-brand-warning)]/10')}
                >
                  <p className="font-bold text-sm">
                    Deberías apartar: <b>${aporteMensual.toLocaleString()}/mes</b>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {isAlcanzable ? '✅ Es alcanzable para un universitario típico' : '⚠️ Es exigente. Considera aumentar el plazo.'}
                  </p>
                </FECard>
              </FECard>
            )}

            {step2Valid && (
              <FECard variant="flat" className="border border-[var(--color-brand-warning)]">
                <p className="font-bold text-sm mb-2">
                  Paso 4/5 — ¿Por qué es importante? (R — Relevante)
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[var(--color-text-secondary)]">¿Por qué esta meta importa para ti?</label>
                  <textarea
                    value={porQue}
                    onChange={(e) => setPorQue(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-[var(--color-neutral-200)] p-3 text-sm resize-none"
                  />
                </div>
              </FECard>
            )}

            {allValid && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => setStep(2)}
              >
                Ver mi tarjeta de compromiso →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-bold text-base">Tu meta SMART 🎯</p>
            <FECard variant="flat" className="border-[3px] border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10 p-4">
              <p className="text-xs text-[var(--color-text-secondary)] mb-2">TARJETA DE COMPROMISO</p>
              <p className="font-bold mb-4">{metaText}</p>
              <div className="space-y-1">
                {[
                  { label: 'Qué', value: queQuieres },
                  { label: 'Cuánto', value: `$${montoNum.toLocaleString()}` },
                  { label: 'Cuándo', value: `En ${plazoMeses} meses` },
                  { label: 'Cómo', value: `Apartando $${aporteMensual.toLocaleString()}/mes` },
                  { label: 'Por qué', value: porQue },
                ].map((r) => (
                  <div key={r.label} className="flex gap-2">
                    <p className="text-xs font-bold min-w-12">{r.label}:</p>
                    <p className="text-xs">{r.value}</p>
                  </div>
                ))}
              </div>
            </FECard>
            <FinniMessage
              variant="success"
              title="¡Tu meta está lista!"
              message="En el siguiente módulo vamos a construir el plan para cumplirla. Tu meta queda guardada para usar en la Lección 12."
            />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
