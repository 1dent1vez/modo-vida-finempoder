import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const CRITERIOS = [
  {
    criterio: 'Objetivo',
    ahorro: 'Proteger y tener disponible',
    inversion: 'Hacer crecer por encima de la inflación',
    detalle: 'El ahorro es para no perder. La inversión es para ganar.',
  },
  {
    criterio: 'Riesgo',
    ahorro: 'Mínimo o nulo (con IPAB)',
    inversion: 'Variable: bajo (CETES) a alto (acciones)',
    detalle: 'Con el ahorro, tu dinero está casi siempre protegido. Con la inversión, asumes riesgo calculado.',
  },
  {
    criterio: 'Rendimiento',
    ahorro: '1-4% anual en México',
    inversion: 'Mayor, pero no garantizado',
    detalle: 'Rendimiento mayor implica mayor incertidumbre. No hay magia.',
  },
  {
    criterio: 'Plazo',
    ahorro: 'Corto a mediano plazo',
    inversion: 'Mediano a largo plazo',
    detalle: 'Regla de oro: si lo necesitas en menos de 1 año, ahorra. Si puedes esperar +1 año, considera invertir.',
  },
  {
    criterio: 'Liquidez',
    ahorro: 'Alta — accedes rápido',
    inversion: 'Variable según el instrumento',
    detalle: 'Un CETES de 28 días tiene alta liquidez. Un fondo a 5 años, menos.',
  },
];

const CASOS = [
  { texto: '"Quiero $5,000 para un viaje en 2 meses."', respuesta: 'ahorro', razon: 'Plazo muy corto (2 meses). No hay tiempo para riesgo. El ahorro es la respuesta.' },
  { texto: '"Quiero tener $50,000 en 3 años para mi primer negocio."', respuesta: 'inversion', razon: 'Plazo mediano (3 años) y meta ambiciosa. La inversión puede ayudarte a crecer más que la inflación.' },
  { texto: '"Necesito tener disponible mi fondo de emergencias."', respuesta: 'ahorro', razon: 'Un fondo de emergencias necesita alta liquidez. No puede estar en riesgo.' },
  { texto: '"Quiero que mi dinero crezca más que la inflación en 2 años."', respuesta: 'inversion', razon: 'Objetivo claro de superar la inflación con plazo mediano. CETES o fondo conservador.' },
  { texto: '"Voy a necesitar $3,000 en 6 meses para mi inscripción."', respuesta: 'ahorro', razon: 'Plazo corto y dinero comprometido. No tomes riesgo con dinero que necesitarás pronto.' },
  { texto: '"Tengo $500 que no necesito en al menos 1 año."', respuesta: 'inversion', razon: 'Plazo mínimo de 1 año y sin urgencia. CETES o fondo conservador son excelentes opciones.' },
];

const infoColor = 'var(--color-brand-info)';
const infoBg   = 'var(--color-brand-info-bg)';

export default function L02() {
  const [step, setStep] = useState(0);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<(string | null)[]>(Array(6).fill(null));
  const [objetivoPersonal, setObjetivoPersonal] = useState('');
  const [guardado, setGuardado] = useState(false);

  const aciertos = respuestas.filter((r, i) => r === CASOS[i]!.respuesta).length;
  const casosCompletos = respuestas.every((r) => r !== null);
  const score = casosCompletos ? aciertos / 6 : 0;

  useEffect(() => {
    const load = async () => {
      const saved = await lessonDataRepository.load<{ objetivo: string }>('inversion', 'l02_objetivo');
      if (saved?.objetivo) setObjetivoPersonal(saved.objetivo);
    };
    void load();
  }, []);

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l02_objetivo', { objetivo: objetivoPersonal });
    setGuardado(true);
  };

  const responder = (idx: number, valor: string) => {
    setRespuestas((prev) => prev.map((r, i) => (i === idx ? valor : r)));
  };

  const progressPct = (step / 3) * 100;

  return (
    <LessonShell
      id="L02"
      title="¿Ahorro o inversión? No es lo mismo, aunque se parezcan"
      completion={{ ready: casosCompletos && guardado, score }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="¿El dinero en tu cuenta de ahorro está 'invertido'?"
              message="No exactamente. Hay una diferencia importante entre ahorrar e invertir, y confundirlos puede costarte. Hoy la aclaramos."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-4">Tabla comparativa: Ahorro vs Inversión</p>
              <div className="space-y-2">
                {CRITERIOS.map((c, i) => (
                  <div key={c.criterio} className="rounded-xl overflow-hidden border border-[var(--color-neutral-200)]">
                    <button
                      className={cn(
                        'w-full flex items-center justify-between p-3 text-left transition-colors',
                        expandido === i ? 'bg-[var(--color-brand-warning-bg)]' : 'bg-gray-50'
                      )}
                      onClick={() => setExpandido(expandido === i ? null : i)}
                    >
                      <span className="font-bold">{c.criterio}</span>
                      {expandido === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandido === i && (
                      <div className="p-3">
                        <div className="flex gap-3 mb-2">
                          <div className="flex-1 p-2 rounded-lg bg-[var(--color-brand-success-bg)]">
                            <span className="text-xs font-bold text-green-700 block">Ahorro</span>
                            <span className="text-sm">{c.ahorro}</span>
                          </div>
                          <div className="flex-1 p-2 rounded-lg bg-[var(--color-brand-warning-bg)]">
                            <span className="text-xs font-bold text-amber-700 block">Inversión</span>
                            <span className="text-sm">{c.inversion}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">{c.detalle}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </FECard>
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
              style={{ backgroundColor: infoColor }}
              onClick={() => setStep(1)}
            >
              Practicar con casos reales →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Casos de uso */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-lg font-bold">6 situaciones reales</p>
            <p className="text-sm text-[var(--color-text-secondary)]">¿Cada situación requiere ahorro o inversión?</p>
            <div className="space-y-4">
              {CASOS.map((caso, i) => {
                const respuesta = respuestas[i];
                const correcto = respuesta === caso.respuesta;
                const respondido = respuesta !== null;
                return (
                  <FECard
                    key={i}
                    variant="flat"
                    className={cn(
                      'border',
                      respondido
                        ? correcto
                          ? 'border-[var(--color-brand-success)]'
                          : 'border-[var(--color-brand-error)]'
                        : 'border-[var(--color-neutral-200)]'
                    )}
                  >
                    <p className="text-sm font-bold mb-2">{caso.texto}</p>
                    <div className="flex gap-2 mb-2">
                      <button
                        className={cn(
                          'px-3 py-1 rounded-lg text-sm font-semibold border transition-colors',
                          respuesta === 'ahorro'
                            ? 'bg-[var(--color-brand-success)] text-white border-[var(--color-brand-success)]'
                            : 'border-[var(--color-brand-success)] text-[var(--color-brand-success)]'
                        )}
                        onClick={() => responder(i, 'ahorro')}
                        disabled={respondido}
                      >
                        Ahorro
                      </button>
                      <button
                        className={cn(
                          'px-3 py-1 rounded-lg text-sm font-semibold border transition-colors',
                          respuesta === 'inversion'
                            ? 'text-white border-transparent'
                            : 'border-[var(--color-brand-info)]'
                        )}
                        style={respuesta === 'inversion' ? { backgroundColor: infoColor } : { color: infoColor }}
                        onClick={() => responder(i, 'inversion')}
                        disabled={respondido}
                      >
                        Inversión
                      </button>
                    </div>
                    {respondido && (
                      <div>
                        <span className={cn(
                          'inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-1',
                          correcto
                            ? 'bg-[var(--color-brand-success-bg)] text-green-700'
                            : 'bg-[var(--color-brand-error-bg)] text-red-700'
                        )}>
                          {correcto ? '✓ Correcto' : '✗ Incorrecto'}
                        </span>
                        <p className="text-xs text-[var(--color-text-secondary)]">{caso.razon}</p>
                      </div>
                    )}
                  </FECard>
                );
              })}
            </div>
            {casosCompletos && (
              <div className="space-y-4">
                <FECard
                  variant="flat"
                  className={cn(
                    'border',
                    aciertos >= 5
                      ? 'bg-[var(--color-brand-success-bg)] border-[var(--color-brand-success)]'
                      : 'border-[var(--color-brand-info)]'
                  )}
                  style={aciertos < 5 ? { backgroundColor: infoBg } : undefined}
                >
                  <p className="font-bold">Resultado: {aciertos}/6 correctas</p>
                  <p className="text-sm">
                    {aciertos >= 5
                      ? '¡Excelente! Tienes muy claro cuándo usar cada herramienta.'
                      : 'Revisa las incorrectas — el criterio clave es el plazo y la liquidez necesaria.'}
                  </p>
                </FECard>
                <button
                  className="w-full min-h-11 text-white rounded-xl font-semibold text-sm"
                  style={{ backgroundColor: infoColor }}
                  onClick={() => setStep(2)}
                >
                  Aplicar a mi situación →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pantalla 2 — Regla de oro + aplicación personal */}
        {step === 2 && (
          <div className="space-y-6">
            <FECard variant="flat" className="bg-[var(--color-brand-warning-bg)] border-2 border-[var(--color-brand-warning)]">
              <p className="font-extrabold">Regla de oro</p>
              <p className="text-sm mt-1">
                Si necesitas el dinero en menos de 1 año: <strong>ahorra</strong>.{' '}
                Si puedes esperar más de 1 año: <strong>considera invertir</strong>.
              </p>
            </FECard>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">¿Para qué podrías invertir TÚ?</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                ¿Tienes algún objetivo a más de 1 año? Escríbelo — lo usaremos en la Lección 13.
              </p>
              <textarea
                className="w-full border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-info)]"
                rows={3}
                placeholder="Ej: Ahorrar para mi primera laptop, para un viaje, para emprender..."
                value={objetivoPersonal}
                onChange={(e) => setObjetivoPersonal(e.target.value)}
              />
            </FECard>
            <FinniMessage
              variant="coach"
              title="Ahorro e inversión no se excluyen"
              message="El ahorro es la base. La inversión es el siguiente nivel. Primero construye el fondo de emergencias — luego viene la inversión."
            />
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: infoColor }}
              disabled={objetivoPersonal.trim().length < 5}
              onClick={() => void handleGuardar()}
            >
              {guardado ? '✅ Guardado — lección completada' : 'Guardar mi objetivo de inversión'}
            </button>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
