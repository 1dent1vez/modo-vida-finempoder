import { useEffect, useState } from 'react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

const ORDEN = [
  { num: 1, titulo: 'Gastos básicos del mes cubiertos', color: 'var(--color-brand-error)' },
  { num: 2, titulo: 'Fondo de emergencias activo (1-3 meses de gastos básicos)', color: 'var(--color-brand-warning)' },
  { num: 3, titulo: 'Deudas de corto plazo bajo control', color: 'var(--color-brand-info)' },
  { num: 4, titulo: 'Solo el sobrante va a inversión', color: 'var(--color-brand-success)' },
];

const infoColor = 'var(--color-brand-info)';
const infoBg = 'var(--color-brand-info-bg)';
const successColor = 'var(--color-brand-success)';
const successBg = 'var(--color-brand-success-bg)';

export default function L04() {
  const [step, setStep] = useState(0);
  const [ingreso, setIngreso] = useState(3500);
  const [gastos, setGastos] = useState(2200);
  const [fondoEmergencias, setFondoEmergencias] = useState(0);
  const [ahorroMeta, setAhorroMeta] = useState(300);
  const [guardado, setGuardado] = useState(false);
  const [emergenciaM2, setEmergenciaM2] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await lessonDataRepository.load<{ montoMeta?: number }>('ahorro', 'l08_fondo_emergencias');
      if (data?.montoMeta) setEmergenciaM2(data.montoMeta);
      const saved = await lessonDataRepository.load<{ capital: number; ingreso: number; gastos: number }>('inversion', 'l04_capital');
      if (saved) { setIngreso(saved.ingreso); setGastos(saved.gastos); }
    };
    void load();
  }, []);

  const capitalInversion = Math.max(0, ingreso - gastos - fondoEmergencias - ahorroMeta);
  const fondoCubierto = emergenciaM2 !== null ? fondoEmergencias >= emergenciaM2 : fondoEmergencias > 0;

  const handleGuardar = async () => {
    await lessonDataRepository.save('inversion', 'l04_capital', { capital: capitalInversion, ingreso, gastos });
    setGuardado(true);
  };

  const finniMsg = () => {
    if (capitalInversion >= 100 && capitalInversion < 500) return { tipo: 'poco', msg: 'Con CETES puedes empezar desde $100. No hay mínimo imposible.' };
    if (capitalInversion >= 500) return { tipo: 'si', msg: `¡Tienes $${capitalInversion.toLocaleString()} disponibles para invertir! En la lección 13 construiremos tu plan.` };
    return { tipo: 'no', msg: 'Primero fortalezcamos tu fondo de emergencias. Ajusta tus gastos para liberar capital de inversión.' };
  };
  const fm = finniMsg();

  return (
    <LessonShell id="L04" title="Invierte solo lo que puedes 'no ver' un tiempo" completion={{ ready: guardado }}>
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%`, backgroundColor: infoColor }} />
        </div>

        {/* Pantalla 0 — El orden correcto */}
        {step === 0 && (
          <div className="space-y-6">
            <FinniMessage variant="coach" title="Antes de invertir un solo peso..." message="Hay que responder una pregunta honesta: ¿puedo no ver este dinero por X meses sin que afecte mi vida? Si la respuesta es no, ese dinero no debe invertirse." />
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              <p className="text-base font-bold mb-4">El orden correcto antes de invertir:</p>
              <div className="space-y-3">
                {ORDEN.map((o) => (
                  <div key={o.num} className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0" style={{ backgroundColor: o.color }}>
                      {o.num}
                    </div>
                    <p className="text-sm">{o.titulo}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-4 italic">"No existe inversión segura que valga la pena si para hacerla tienes que dejar de pagar tu transporte o tu comida."</p>
            </FECard>
            <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
              <p className="text-sm font-bold">¿Qué es el capital disponible para inversión?</p>
              <p className="text-sm mt-1">El dinero que, cuando lo apartas, no te genera angustia ni urgencia de recuperarlo pronto. No es el que sobra al final del mes (eso va a ahorro). Es un excedente real y consciente.</p>
            </FECard>
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(1)}>
              Ver simulación de flujo →
            </button>
          </div>
        )}

        {/* Pantalla 1 — Simulación de flujo */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Simulación: flujo de dinero</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Estudiante ficticio con $3,500/mes. Observa cómo se distribuye:</p>
            <FECard variant="flat" className="border border-[var(--color-neutral-200)]">
              {[
                { label: 'Ingreso mensual', valor: 3500, color: successColor },
                { label: '− Gastos fijos y variables', valor: -2200, color: 'var(--color-brand-error)' },
                { label: '− Fondo de emergencias', valor: -300, color: 'var(--color-brand-warning)' },
                { label: '− Ahorro meta', valor: -200, color: infoColor },
                { label: '= Capital de inversión', valor: 800, color: '#059669' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-2 border-b border-[var(--color-neutral-200)]">
                  <p className="text-sm">{row.label}</p>
                  <p className="text-sm font-bold" style={{ color: row.color }}>${Math.abs(row.valor).toLocaleString()}</p>
                </div>
              ))}
            </FECard>
            <FinniMessage variant="coach" title="La validación es clave" message="No puedes asignar a inversión sin antes cubrir los otros destinos. El orden importa." />
            <button className="w-full min-h-11 text-white rounded-xl font-semibold text-sm" style={{ backgroundColor: infoColor }} onClick={() => setStep(2)}>
              Calcular mi capital real →
            </button>
          </div>
        )}

        {/* Pantalla 2 — Cálculo personal */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-2xl font-bold">Tu cálculo personal</p>
            {emergenciaM2 !== null && (
              <FECard variant="flat" className="border" style={{ borderColor: infoColor, backgroundColor: infoBg }}>
                <p className="text-xs font-bold">Desde Módulo 2:</p>
                <p className="text-sm">Tu meta de fondo de emergencias: ${emergenciaM2.toLocaleString()}</p>
              </FECard>
            )}
            <div className="space-y-4">
              {[
                { label: 'Ingreso mensual ($)', value: ingreso, setValue: setIngreso, min: 0, step: 100, helper: undefined },
                { label: 'Gastos fijos y variables ($)', value: gastos, setValue: setGastos, min: 0, step: 100, helper: undefined },
                { label: 'Ahorro para fondo de emergencias ($)', value: fondoEmergencias, setValue: setFondoEmergencias, min: 0, step: 50, helper: emergenciaM2 ? `Meta: $${emergenciaM2.toLocaleString()}${fondoCubierto ? ' ✅' : ' (aún no cubierta)'}` : undefined },
                { label: 'Ahorro para meta específica ($)', value: ahorroMeta, setValue: setAhorroMeta, min: 0, step: 50, helper: undefined },
              ].map(({ label, value, setValue, min, step: s, helper }) => (
                <div key={label} className="space-y-1">
                  <label className="block text-sm font-medium text-[var(--color-text-primary)]">{label}</label>
                  <input type="number" value={value} min={min} step={s} onChange={(e) => setValue(Math.max(0, Number(e.target.value)))} className="w-full border border-[var(--color-neutral-200)] rounded-xl px-4 py-2.5 text-sm" />
                  {helper && <p className="text-xs text-[var(--color-text-secondary)]">{helper}</p>}
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border-2" style={{ backgroundColor: capitalInversion > 0 ? successBg : 'var(--color-neutral-100)', borderColor: capitalInversion > 0 ? successColor : 'var(--color-border)' }}>
              <p className="text-sm">Capital disponible para inversión:</p>
              <p className="text-3xl font-black" style={{ color: capitalInversion > 0 ? '#059669' : 'var(--color-text-secondary)' }}>${capitalInversion.toLocaleString()}</p>
            </div>
            <FinniMessage
              variant={fm.tipo === 'si' ? 'success' : 'coach'}
              title={fm.tipo === 'si' ? '¡Tienes capital para invertir!' : fm.tipo === 'poco' ? 'Pequeño pero real' : 'Aún no es momento'}
              message={fm.msg}
            />
            <button
              className="w-full min-h-11 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: infoColor }}
              onClick={() => void handleGuardar()}
              disabled={guardado}
            >
              {guardado ? `✅ Guardado — capital: $${capitalInversion.toLocaleString()}` : 'Guardar mi capital disponible'}
            </button>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
