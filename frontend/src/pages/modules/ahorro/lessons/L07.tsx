import { useState, useMemo } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type IngresoType = 'fijo' | 'variable' | 'mixto' | null;
type Estrategia = 'porcentaje' | 'doble_fondo' | 'mes_base' | null;

const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';

const ESTRATEGIAS = [
  { id: 'porcentaje' as const, title: 'Estrategia 1 — Porcentaje fijo', desc: 'Ahorra siempre el mismo porcentaje de lo que ganes.', ejemplo: 'Si ganas $3,000 apartas 20% ($600). Si ganas $1,500, apartas 20% ($300). Siempre proporcionado.', emoji: '%' },
  { id: 'doble_fondo' as const, title: 'Estrategia 2 — Doble fondo', desc: 'Dos cuentas: una de ahorro fija (minimo garantizado) y una variable (lo extra de meses buenos).', ejemplo: 'Fondo A: $300/mes siempre. Fondo B: cualquier extra que llegue ese mes.', emoji: '🏦' },
  { id: 'mes_base' as const, title: 'Estrategia 3 — Mes base', desc: 'Calcula tu ingreso minimo de los ultimos 3 meses. Basa tu plan en ese numero.', ejemplo: 'Si en 3 meses ganaste $1,500, $2,200 y $1,800, tu base es $1,500. Lo extra, ahorra de inmediato.', emoji: '📊' },
];

const CASOS = [
  { nombre: 'Laura', tipo: 'Mesada fija de $2,000/mes', estrategia: 'Porcentaje fijo: aparta $400 (20%) el dia que llega la mesada.' },
  { nombre: 'Rodrigo', tipo: 'Tutorias: gana entre $800 y $3,500 segun el mes', estrategia: 'Mes base ($800) + porcentaje del excedente. Automatiza el minimo.' },
];

export default function L07() {
  const [step, setStep] = useState(0);
  const [ingresoType, setIngresoType] = useState<IngresoType>(null);
  const [ingreso1, setIngreso1] = useState('');
  const [ingreso2, setIngreso2] = useState('');
  const [ingreso3, setIngreso3] = useState('');
  const [estrategia, setEstrategia] = useState<Estrategia>(null);
  const [confirmed, setConfirmed] = useState(false);

  const nums = [ingreso1, ingreso2, ingreso3].map((v) => parseFloat(v) || 0);
  const ingresoBase = nums.length === 3 ? Math.min(...nums) : 0;
  const ingresoPromedio = nums.length === 3 ? nums.reduce((a, b) => a + b, 0) / 3 : 0;
  const ahorroPorcentaje = useMemo(() => ingresoBase * 0.2, [ingresoBase]);
  const ahorroPorcentajeProm = useMemo(() => ingresoPromedio * 0.2, [ingresoPromedio]);
  const calcHasData = nums.every((n) => n > 0);
  const canComplete = estrategia !== null && confirmed;

  const handleConfirm = async () => {
    await lessonDataRepository.save('ahorro', 'l7_estrategia', { ingresoType, estrategia, ingresoBase: calcHasData ? ingresoBase : null, savedAt: new Date().toISOString() });
    setConfirmed(true);
    setStep(4);
  };

  const progress = step === 0 ? 0 : step === 1 ? 20 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <LessonShell id="L07" title="Cuando tu ingreso es impredecible" completion={{ ready: canComplete }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: successColor }} />
        </div>

        {/* Pantalla 0 — Apertura */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Bienvenido al club de ingresos variables" message="¿Haces freelance, tutorias, ventas o cualquier trabajo donde no sabes exactamente cuanto recibiras este mes? Hay formas de ahorrar igual." />
            <div className="space-y-3">
              {ESTRATEGIAS.map((e) => (
                <FECard key={e.id} variant="flat" className="border border-[var(--color-neutral-200)]">
                  <p className="font-bold text-sm">{e.emoji} {e.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">{e.desc}</p>
                  <p className="text-xs mt-1" style={{ color: '#059669' }}>Ejemplo: {e.ejemplo}</p>
                </FECard>
              ))}
            </div>
            <FinniMessage variant="coach" title="La clave es la automatizacion" message="El ahorro manual depende de la fuerza de voluntad. El automatico, no." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(1)}>
              ¿Cual es mi perfil? →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Identificacion */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="font-bold">¿Como es tu ingreso este semestre?</p>
            <div className="space-y-2">
              {[
                { key: 'fijo' as const, label: 'Fijo (mesada, beca constante)', desc: 'Sabes exactamente cuanto recibiras cada mes' },
                { key: 'variable' as const, label: 'Variable (freelance, ventas, tutorias)', desc: 'El monto cambia cada mes' },
                { key: 'mixto' as const, label: 'Mixto (algo fijo + algo variable)', desc: 'Una base fija mas ingresos extras' },
              ].map((o) => (
                <button
                  key={o.key}
                  onClick={() => setIngresoType(o.key)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-colors"
                  style={{ borderColor: successColor, backgroundColor: ingresoType === o.key ? successColor : 'transparent', color: ingresoType === o.key ? 'white' : 'inherit' }}
                >
                  <p className="font-bold text-sm">{o.label}</p>
                  <p className="text-xs opacity-80">{o.desc}</p>
                </button>
              ))}
            </div>
            {ingresoType && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(2)}>
                Ver casos de estudio →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 2 — Casos + calculadora */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="font-bold">Casos de estudio:</p>
            {CASOS.map((c) => (
              <FECard key={c.nombre} variant="flat" className="border border-[var(--color-neutral-200)]">
                <p className="font-bold text-sm">{c.nombre}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{c.tipo}</p>
                <p className="text-sm mt-1" style={{ color: '#059669' }}>→ {c.estrategia}</p>
              </FECard>
            ))}

            <FECard variant="flat" className="border" style={{ borderColor: successColor }}>
              <p className="font-bold text-sm mb-3">Calculadora — ingresa tus ultimos 3 ingresos:</p>
              <div className="space-y-2">
                {[['Mes 1', ingreso1, setIngreso1], ['Mes 2', ingreso2, setIngreso2], ['Mes 3', ingreso3, setIngreso3]].map(([label, val, setter]) => (
                  <input
                    key={label as string}
                    type="number"
                    placeholder={label as string}
                    min={0}
                    value={val as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    className="w-full border border-[var(--color-neutral-200)] rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-success)]"
                  />
                ))}
              </div>
              {calcHasData && (
                <div className="space-y-1 mt-3">
                  <p className="text-sm">Ingreso base (minimo): <b>${ingresoBase.toLocaleString()}</b></p>
                  <p className="text-sm">Promedio: <b>${ingresoPromedio.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</b></p>
                  <p className="text-sm" style={{ color: '#059669' }}>Ahorro recomendado (20% del base): <b>${ahorroPorcentaje.toFixed(0)}/mes</b></p>
                  <p className="text-sm" style={{ color: '#059669' }}>Ahorro del promedio (20%): <b>${ahorroPorcentajeProm.toFixed(0)}/mes</b></p>
                </div>
              )}
            </FECard>

            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => setStep(3)}>
              Elegir mi estrategia →
            </button>
          </div>
        )}

        {/* Pantalla 3 — Compromiso */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="font-bold">¿Cual estrategia vas a usar este mes?</p>
            <div className="space-y-2">
              {ESTRATEGIAS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEstrategia(e.id)}
                  className="w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors"
                  style={{ borderColor: successColor, backgroundColor: estrategia === e.id ? successColor : 'transparent', color: estrategia === e.id ? 'white' : 'inherit' }}
                >
                  {e.emoji} {e.title.replace(/Estrategia \d — /, '')}
                </button>
              ))}
            </div>
            {estrategia && (
              <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: successColor }} onClick={() => void handleConfirm()}>
                Confirmar mi estrategia →
              </button>
            )}
          </div>
        )}

        {/* Pantalla 4 — Confirmacion */}
        {step === 4 && (
          <div className="space-y-6">
            <FECard variant="flat" className="text-center py-4 border-2" style={{ backgroundColor: successBg, borderColor: successColor }}>
              <p className="text-2xl font-bold">✅ Estrategia elegida</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: successColor }}>
                {ESTRATEGIAS.find((e) => e.id === estrategia)?.title ?? ''}
              </span>
            </FECard>
            <FinniMessage variant="success" title="Sin importar tu ingreso, puedes ahorrar" message="La clave no es cuanto ganas, sino que el ahorro sea lo primero que apartras." />
          </div>
        )}
      </div>
    </LessonShell>
  );
}
