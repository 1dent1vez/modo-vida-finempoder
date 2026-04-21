import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

interface Indicador {
  nombre: string;
  estado: Semaforo;
  comentario: string;
  accion?: string;
}

const colorVars = {
  verde:   { bg: 'var(--color-brand-success-bg)', border: 'var(--color-brand-success)',  text: '#059669', emoji: '🟢' },
  amarillo:{ bg: 'var(--color-brand-warning-bg)', border: 'var(--color-brand-warning)',  text: '#D97706', emoji: '🟡' },
  rojo:    { bg: 'var(--color-brand-error-bg)',   border: 'var(--color-brand-error)',    text: '#DC2626', emoji: '🔴' },
};

function semIcon(estado: Semaforo) {
  return estado === 'verde' ? '✅' : estado === 'amarillo' ? '⚠️' : '❌';
}

function evalIndicadores(data: {
  fondoEmergencias: boolean;
  perfilCoherente: boolean;
  lecccionInstrumentoCompleta: boolean;
  plazoRealista: boolean;
  comisionesIdentificadas: boolean;
}): Indicador[] {
  return [
    { nombre: 'Fondo de emergencias activo', estado: data.fondoEmergencias ? 'verde' : 'rojo', comentario: data.fondoEmergencias ? 'Tu fondo de emergencias está cubierto. Excelente base.' : 'Sin fondo de emergencias, una crisis puede obligarte a retirar tu inversión en el peor momento.', accion: data.fondoEmergencias ? undefined : 'Completa el Módulo 2, Lección 8 — Fondo de Emergencias.' },
    { nombre: 'Perfil de riesgo coherente con el instrumento', estado: data.perfilCoherente ? 'verde' : 'amarillo', comentario: data.perfilCoherente ? 'El instrumento elegido es compatible con tu perfil de riesgo.' : 'El instrumento puede no ser ideal para tu perfil. Considera ajustarlo.', accion: data.perfilCoherente ? undefined : 'Revisa la Lección 8 y ajusta tu instrumento en L13.' },
    { nombre: 'Comprensión del instrumento elegido', estado: data.lecccionInstrumentoCompleta ? 'verde' : 'amarillo', comentario: data.lecccionInstrumentoCompleta ? 'Completaste las lecciones sobre el instrumento elegido. Sabes en qué inviertes.' : 'Asegúrate de haber visto las lecciones sobre tu instrumento (L6 para CETES, L7 para fondos/acciones).' },
    { nombre: 'Plazo realista para alcanzar el objetivo', estado: data.plazoRealista ? 'verde' : 'amarillo', comentario: data.plazoRealista ? 'El plazo de tu plan permite alcanzar tu objetivo con los montos definidos.' : 'El plazo puede ser muy corto para el monto objetivo. Considera aumentar la aportación o extender el plazo.' },
    { nombre: 'Comisiones e impuestos identificados', estado: data.comisionesIdentificadas ? 'verde' : 'amarillo', comentario: data.comisionesIdentificadas ? 'Ya sabes el impacto de comisiones e ISR. Tus cálculos son realistas.' : 'Revisa la Lección 11 para entender el impacto real de las comisiones en tu rendimiento.' },
  ];
}

const infoColor = 'var(--color-brand-info)';

export default function L14() {
  const [step, setStep] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [indicadorExpandido, setIndicadorExpandido] = useState<number | null>(null);
  const [vistos, setVistos] = useState(false);

  useEffect(() => {
    const load = async () => {
      const perfil = await lessonDataRepository.load<{ perfil: string }>('inversion', 'l08_perfil_riesgo');
      const plan = await lessonDataRepository.load<{ instrumento?: string; plazoMeses?: number; capitalInicial?: number }>('inversion', 'l13_plan');
      const emergencias = await lessonDataRepository.load<{ montoMeta?: number; completado?: boolean }>('ahorro', 'l08_fondo_emergencias');

      const tieneFondo = !!(emergencias?.completado || emergencias?.montoMeta);
      const tienePerfil = !!(perfil?.perfil);
      const tieneInstrumento = !!(plan?.instrumento);
      const tienePlan = !!(plan?.plazoMeses);

      const instrumento = plan?.instrumento ?? '';
      const perfilUsuario = perfil?.perfil ?? '';
      const conservadoresInst = ['CETES', 'deuda', 'gubernamental'];
      const agresivosInst = ['Acciones', 'variable', 'ETF'];
      const isConservadorInst = conservadoresInst.some((k) => instrumento.toLowerCase().includes(k.toLowerCase()));
      const isAgresivosInst = agresivosInst.some((k) => instrumento.toLowerCase().includes(k.toLowerCase()));
      const coherente = !tienePerfil || !tieneInstrumento || (perfilUsuario === 'conservador' && isConservadorInst) || (perfilUsuario === 'agresivo' && isAgresivosInst) || perfilUsuario === 'moderado';
      const meses = plan?.plazoMeses ?? 12;
      const plazoRealista = meses >= 12 || (meses >= 6 && (plan?.capitalInicial ?? 0) > 500);

      setIndicadores(evalIndicadores({ fondoEmergencias: tieneFondo, perfilCoherente: coherente, lecccionInstrumentoCompleta: tienePlan, plazoRealista, comisionesIdentificadas: true }));
      setCargando(false);
    };
    void load();
  }, []);

  const verdes = indicadores.filter((i) => i.estado === 'verde').length;
  const resultado: Semaforo = verdes === 5 ? 'verde' : verdes >= 3 ? 'amarillo' : 'rojo';
  const cv = colorVars[resultado];

  const mensajeFinni = () => {
    if (resultado === 'verde') return { titulo: '¡Luz verde! Estás listo para invertir', mensaje: 'Todos los indicadores positivos. Tu primer paso concreto: abre tu cuenta en cetesdirecto.com o la plataforma elegida y haz tu primera compra.' };
    if (resultado === 'amarillo') return { titulo: 'Casi listo — unos ajustes finales', mensaje: 'Tienes buenas bases. Revisa los indicadores en amarillo y toma las acciones sugeridas. No tienes que ser perfecto para empezar.' };
    return { titulo: 'Aún no — pero el camino está claro', mensaje: 'No es "nunca", es "todavía no, y aquí está el camino". Trabaja en los indicadores rojos y regresa. El hecho de que estés aquí ya te pone adelante.' };
  };
  const fm = mensajeFinni();
  const progressPct = vistos ? 100 : cargando ? 30 : 70;

  return (
    <LessonShell
      id="L14"
      title="Finni evalúa tu plan: ¿estás listo para invertir?"
      completion={{ ready: vistos }}
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
              title="¡Tu plan de inversión está listo!"
              message="Ahora déjame revisarlo con honestidad. No para desanimarte — para asegurarme de que estás tomando una decisión informada."
            />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="font-bold mb-2">Voy a revisar 5 indicadores:</p>
              {[
                '1. ¿Tienes fondo de emergencias activo?',
                '2. ¿El instrumento es coherente con tu perfil?',
                '3. ¿Entiendes el instrumento que elegiste?',
                '4. ¿El plazo es realista para tu objetivo?',
                '5. ¿Conoces las comisiones e impuestos?',
              ].map((p) => (
                <p key={p} className="text-sm py-1">🔍 {p}</p>
              ))}
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Iniciar análisis →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Los 5 indicadores */}
        {step === 1 && (
          <div className="space-y-6">
            {cargando ? (
              <FECard variant="flat" className="text-center py-8">
                <p className="text-4xl">🔍</p>
                <p className="font-bold mt-2">Analizando tu plan...</p>
                <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mt-4">
                  <div className="h-2 rounded-full animate-pulse" style={{ width: '60%', backgroundColor: infoColor }} />
                </div>
              </FECard>
            ) : (
              <>
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
                    style={{ backgroundColor: cv.bg, color: cv.text, border: `1px solid ${cv.border}` }}
                  >
                    {verdes === 5 ? '✅' : '⚠️'} {verdes}/5 indicadores positivos
                  </span>
                </div>
                <div className="space-y-3">
                  {indicadores.map((ind, i) => {
                    const icv = colorVars[ind.estado];
                    const isOpen = indicadorExpandido === i;
                    return (
                      <div
                        key={ind.nombre}
                        className="p-4 rounded-2xl border-2 cursor-pointer transition-colors"
                        style={{ borderColor: icv.border, backgroundColor: isOpen ? icv.bg : 'white' }}
                        onClick={() => setIndicadorExpandido(isOpen ? null : i)}
                      >
                        <div className="flex items-center gap-3">
                          <span>{semIcon(ind.estado)}</span>
                          <p className="flex-1 text-sm font-bold">{ind.nombre}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: icv.bg, color: icv.text, border: `1px solid ${icv.border}` }}>
                            {ind.estado.toUpperCase()}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="mt-3">
                            <p className="text-sm">{ind.comentario}</p>
                            {ind.accion && (
                              <p className="text-xs text-[var(--color-text-secondary)] mt-1">👉 {ind.accion}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="p-4 rounded-2xl border-2" style={{ backgroundColor: cv.bg, borderColor: cv.border }}>
                  <p className="font-extrabold">{cv.emoji} {fm.titulo}</p>
                  <p className="text-sm mt-1">{fm.mensaje}</p>
                </div>
                <FinniMessage
                  variant="coach"
                  title="El hecho de que estés aquí ya te pone adelante"
                  message="El hecho de que hayas construido tu plan ya te pone adelante de la mayoría. El siguiente paso es tuyo."
                />
                {!vistos ? (
                  <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setVistos(true)}>
                    ✅ Completar lección — avanzar al reto final
                  </button>
                ) : (
                  <FECard variant="flat" className="text-center border-2" style={{ backgroundColor: 'var(--color-brand-success-bg)', borderColor: 'var(--color-brand-success)' }}>
                    <p className="text-4xl">🏁</p>
                    <p className="font-extrabold">¡Un paso más y completarás FinEmpoder!</p>
                    <p className="text-sm">La Lección 15 te espera — el reto final de todo el programa.</p>
                  </FECard>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </LessonShell>
  );
}
