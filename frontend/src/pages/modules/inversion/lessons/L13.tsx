import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const INSTRUMENTOS_POR_PERFIL: Record<string, string[]> = {
  conservador: ['CETES 28 días', 'CETES 91 días', 'Fondo de deuda gubernamental'],
  moderado: ['Fondo balanceado', 'CETES 91 días + fondo mixto', 'FIBRAs'],
  agresivo: ['Acciones BMV (GBM+)', 'Fondo de renta variable', 'ETFs internacionales (plataforma CNBV)'],
  default: ['CETES 28 días', 'Fondo balanceado', 'Fondo de deuda gubernamental'],
};

const TASA_POR_INSTRUMENTO: Record<string, number> = {
  'CETES 28 días': 0.10,
  'CETES 91 días': 0.102,
  'CETES 91 días + fondo mixto': 0.095,
  'Fondo de deuda gubernamental': 0.09,
  'Fondo balanceado': 0.11,
  'FIBRAs': 0.10,
  'Acciones BMV (GBM+)': 0.13,
  'Fondo de renta variable': 0.125,
  'ETFs internacionales (plataforma CNBV)': 0.12,
};

const CATEGORIAS_OBJETIVO = ['Educación', 'Emprendimiento', 'Tecnología', 'Viaje', 'Emergencias', 'Otro'];
const PLAZOS_MESES = [6, 12, 18, 24, 36, 48, 60];

function calcProyeccion(capital: number, aportacion: number, tasa: number, meses: number): number {
  const tasaMensual = tasa / 12;
  let total = capital;
  for (let i = 0; i < meses; i++) {
    total = total * (1 + tasaMensual) + aportacion;
  }
  return total;
}

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';
const warnColor = 'var(--color-brand-warning)';
const warnBg = 'var(--color-brand-warning-bg)';

export default function L13() {
  const [step, setStep] = useState(0);
  const [objetivo, setObjetivo] = useState('');
  const [categoriaObjetivo, setCategoriaObjetivo] = useState('');
  const [capitalInicial, setCapitalInicial] = useState(0);
  const [aportacionMensual, setAportacionMensual] = useState(200);
  const [plazoMeses, setPlazoMeses] = useState(12);
  const [instrumento, setInstrumento] = useState('');
  const [perfilGuardado, setPerfilGuardado] = useState<string>('default');
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const load = async () => {
      const objetivo2 = await lessonDataRepository.load<{ objetivo: string }>('inversion', 'l02_objetivo');
      if (objetivo2?.objetivo) setObjetivo(objetivo2.objetivo);

      const capital4 = await lessonDataRepository.load<{ capital: number }>('inversion', 'l04_capital');
      if (capital4?.capital) setCapitalInicial(capital4.capital);

      const perfil8 = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      const perfil = perfil8?.perfil ?? 'default';
      setPerfilGuardado(perfil);
      const instsDispo = INSTRUMENTOS_POR_PERFIL[perfil] ?? INSTRUMENTOS_POR_PERFIL.default!;
      setInstrumento(instsDispo[0]!);
    };
    void load();
  }, []);

  const instrumentosDisponibles = INSTRUMENTOS_POR_PERFIL[perfilGuardado] ?? INSTRUMENTOS_POR_PERFIL.default!;
  const tasaAnual = TASA_POR_INSTRUMENTO[instrumento] ?? 0.09;
  const proyeccion = calcProyeccion(capitalInicial, aportacionMensual, tasaAnual, plazoMeses);
  const totalAportado = capitalInicial + aportacionMensual * plazoMeses;
  const ganancia = proyeccion - totalAportado;
  const inflacion = 0.0466;
  const supera = tasaAnual > inflacion;

  const seccion1Lista = objetivo.trim().length >= 3 && categoriaObjetivo;
  const seccion2Lista = capitalInicial >= 0 && aportacionMensual >= 0;
  const seccion3Lista = plazoMeses >= 1;
  const seccion4Lista = instrumento;
  const planCompleto = !!(seccion1Lista && seccion2Lista && seccion3Lista && seccion4Lista);

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l13_plan', {
      objetivo,
      categoriaObjetivo,
      capitalInicial,
      aportacionMensual,
      plazoMeses,
      instrumento,
      tasaAnual,
      proyeccion,
      perfil: perfilGuardado,
      guardadoEn: new Date().toISOString(),
    });
    setGuardado(true);
  };

  const progressValue = planCompleto
    ? 100
    : ((Number(!!seccion1Lista) + Number(!!seccion2Lista) + Number(!!seccion3Lista) + Number(!!seccion4Lista)) / 4) * 80;

  return (
    <LessonShell
      id="L13"
      title="Tu plan de inversión personal: metas, montos y plazos"
      completion={{ ready: planCompleto && guardado }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progressValue}%`, backgroundColor: infoColor }} />
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage
              variant="coach"
              title="¡Es momento de juntar todo lo que aprendiste!"
              message="Hoy vas a construir tu plan personal de inversión. No el de un experto con millones — el tuyo, con tu situación real, como estudiante mexicano."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Un plan de inversión básico tiene 4 componentes:</p>
              {[
                '1. Tu objetivo: ¿para qué quieres que crezca tu dinero?',
                '2. Tu monto: ¿cuánto puedes invertir hoy y de forma recurrente?',
                '3. Tu plazo: ¿cuándo quieres ver el resultado?',
                '4. Tu instrumento: ¿cuál es el más adecuado para tu perfil?',
              ].map((p) => (
                <p key={p} className="text-sm py-1">✓ {p}</p>
              ))}
              <p className="text-sm mt-2 italic text-[var(--color-text-secondary)]">
                "Un plan aproximado hoy es mejor que el plan perfecto nunca."
              </p>
            </FECard>
            {perfilGuardado !== 'default' && (
              <FECard variant="flat" className="border" style={{ backgroundColor: infoBg, borderColor: infoColor }}>
                <p className="text-xs font-bold">Recuperado desde lecciones anteriores:</p>
                <p className="text-xs">Perfil de riesgo: <b>{perfilGuardado}</b></p>
                {capitalInicial > 0 && (
                  <p className="text-xs">Capital disponible (L4): <b>${capitalInicial.toLocaleString()}</b></p>
                )}
              </FECard>
            )}
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Construir mi plan →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Mi plan de inversión</p>

            {/* Sección 1 — Objetivo */}
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: seccion1Lista ? successColor : warnColor }}>
              <div className="flex justify-between items-center mb-3">
                <p className="font-black">1. Objetivo</p>
                {seccion1Lista && <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: successColor }}>✓</span>}
              </div>
              <textarea
                rows={2}
                placeholder="Ej: Comprar mi primera laptop, estudios de posgrado, emprender..."
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm resize-none mb-3"
              />
              <select
                value={categoriaObjetivo}
                onChange={(e) => setCategoriaObjetivo(e.target.value)}
                className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                <option value="">Categoría...</option>
                {CATEGORIAS_OBJETIVO.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>

            {/* Sección 2 — Montos */}
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: warnColor }}>
              <p className="font-black mb-3">2. Montos</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Capital inicial ($)</label>
                  <input
                    type="number"
                    value={capitalInicial}
                    onChange={(e) => setCapitalInicial(Math.max(0, Number(e.target.value)))}
                    min={0}
                    step={100}
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">Desde L4 — puedes ajustarlo</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aportación mensual ($)</label>
                  <input
                    type="number"
                    value={aportacionMensual}
                    onChange={(e) => setAportacionMensual(Math.max(0, Number(e.target.value)))}
                    min={0}
                    step={50}
                    className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3 — Plazo */}
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: warnColor }}>
              <p className="font-black mb-3">3. Plazo</p>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(Number(e.target.value))}
                className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {PLAZOS_MESES.map((m) => (
                  <option key={m} value={m}>{m} meses ({(m / 12).toFixed(1)} años)</option>
                ))}
              </select>
            </div>

            {/* Sección 4 — Instrumento */}
            <div className="p-4 rounded-2xl border-2" style={{ borderColor: instrumento ? successColor : warnColor }}>
              <div className="flex justify-between items-center mb-3">
                <p className="font-black">4. Instrumento</p>
                {perfilGuardado !== 'default' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold border" style={{ borderColor: infoColor, color: infoColor }}>Perfil: {perfilGuardado}</span>
                )}
              </div>
              <select
                value={instrumento}
                onChange={(e) => setInstrumento(e.target.value)}
                className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {instrumentosDisponibles.map((inst) => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>

            {/* Proyección dinámica */}
            {planCompleto && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border-2" style={{ borderColor: supera ? successColor : warnColor, backgroundColor: supera ? successBg : warnBg }}>
                  <p className="text-sm font-bold">Proyección a {plazoMeses} meses:</p>
                  <p className="text-3xl font-black">${proyeccion.toFixed(0)}</p>
                  <div className="flex gap-6 mt-2">
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">Total aportado</p>
                      <p className="text-sm font-bold">${totalAportado.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">Ganancia estimada</p>
                      <p className="text-sm font-bold" style={{ color: successColor }}>+${ganancia.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">Tasa anual</p>
                      <p className="text-sm font-bold">{(tasaAnual * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: supera ? successColor : warnColor }}>
                    {supera ? `✅ Supera la inflación (${(inflacion * 100).toFixed(1)}%)` : `⚠️ No supera la inflación (${(inflacion * 100).toFixed(1)}%)`}
                  </span>
                </div>
                <button
                  className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
                  style={{ backgroundColor: infoColor }}
                  onClick={() => void handleGuardar()}
                  disabled={guardado}
                >
                  {guardado ? '✅ Plan guardado — lección completada' : 'Guardar mi plan de inversión'}
                </button>
                {guardado && (
                  <FinniMessage
                    variant="success"
                    title="¡Plan de inversión guardado!"
                    message="Tu plan se usará en la Lección 14 (evaluación) y en el reto final de la Lección 15."
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
