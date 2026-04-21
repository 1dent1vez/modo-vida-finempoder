import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import LessonShell from '../LessonShell';
import FECard from '../../../../components/FECard';
import FinniMessage from '../../../../components/FinniMessage';
import { lessonDataRepository } from '../../../../db/lessonData.repository';

type LineItem = { id: string; label: string; amount: string };

const uid = () => Math.random().toString(36).slice(2, 9);

const makeItem = (label = '', amount = ''): LineItem => ({ id: uid(), label, amount });

type L5Data = { income?: number; necesidades?: number; deseos?: number; ahorro?: number } | null;
type L9Data = { queQuieres?: string; monto?: number; plazoMeses?: number } | null;

export default function L12() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const [ingresos, setIngresos] = useState<LineItem[]>([makeItem('Ingreso principal', '')]);
  const [gastosFijos, setGastosFijos] = useState<LineItem[]>([makeItem('Transporte', ''), makeItem('Materiales', '')]);
  const [gastosVariables, setGastosVariables] = useState<LineItem[]>([makeItem('Alimentación', ''), makeItem('Entretenimiento', '')]);
  const [ahorroMeta, setAhorroMeta] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const l5 = await lessonDataRepository.load<L5Data>('presupuesto', 'l5_distribution');
      const l9 = await lessonDataRepository.load<L9Data>('presupuesto', 'l9_smart_goal');

      if (l5?.income) {
        setIngresos([makeItem('Ingreso mensual (L5)', String(l5.income))]);
      }
      if (l9?.monto && l9?.queQuieres) {
        setAhorroMeta(String(l9.monto / (l9.plazoMeses ?? 6)));
      }
      setLoading(false);
    };
    void load();
  }, []);

  const totalIngresos = ingresos.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalFijos = gastosFijos.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalVariables = gastosVariables.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const ahorroNum = parseFloat(ahorroMeta) || 0;
  const balance = totalIngresos - totalFijos - totalVariables - ahorroNum;

  const pctFijos = totalIngresos > 0 ? Math.round((totalFijos / totalIngresos) * 100) : 0;
  const pctVariables = totalIngresos > 0 ? Math.round((totalVariables / totalIngresos) * 100) : 0;
  const pctAhorro = totalIngresos > 0 ? Math.round((ahorroNum / totalIngresos) * 100) : 0;

  const variablesHigh = pctVariables > 35;

  const realIngresos = ingresos.filter((i) => i.label.trim() && parseFloat(i.amount) > 0);
  const realGastos = [...gastosFijos, ...gastosVariables].filter((g) => g.label.trim() && parseFloat(g.amount) > 0);
  const canComplete = realIngresos.length >= 1 && realGastos.length >= 3;

  const addItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>) => {
    setter((prev) => [...prev, makeItem()]);
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string) => {
    setter((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<LineItem[]>>, id: string, field: 'label' | 'amount', value: string) => {
    setter((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleConfirm = async () => {
    await lessonDataRepository.save('presupuesto', 'l12_budget', {
      ingresos: ingresos.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      gastosFijos: gastosFijos.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      gastosVariables: gastosVariables.map((i) => ({ label: i.label, amount: parseFloat(i.amount) || 0 })),
      ahorro: ahorroNum,
      totalIngresos,
      totalGastos: totalFijos + totalVariables,
      balance,
      pctFijos,
      pctVariables,
      pctAhorro,
    });
    setConfirmed(true);
    setStep(2);
  };

  const renderSection = (
    title: string,
    items: LineItem[],
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    borderClass: string,
  ) => (
    <FECard variant="flat" className={cn('border', borderClass)}>
      <p className="font-bold mb-3">{title}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="flex flex-col gap-1 flex-[2]">
              <label className="text-xs text-[var(--color-text-secondary)]">Descripción</label>
              <input
                value={item.label}
                onChange={(e) => updateItem(setter, item.id, 'label', e.target.value)}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-[var(--color-text-secondary)]">$</label>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateItem(setter, item.id, 'amount', e.target.value)}
                min={0}
                className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => removeItem(setter, item.id)}
              aria-label="Eliminar"
              className="mt-4 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-error)]"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addItem(setter)}
        className="mt-2 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]"
      >
        <Plus size={16} /> Agregar
      </button>
    </FECard>
  );

  if (loading) {
    return (
      <LessonShell id="L12" title="Construye tu propio presupuesto en vivo" completion={{ ready: false }}>
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando tus datos previos...</p>
      </LessonShell>
    );
  }

  const progressValue = step === 0 ? 0 : step === 1 ? 40 : 100;

  return (
    <LessonShell
      id="L12"
      title="Construye tu propio presupuesto en vivo"
      completion={{ ready: canComplete && confirmed }}
    >
      <div className="p-1">
        <div className="w-full bg-[var(--color-neutral-100)] rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-[var(--color-brand-warning)] transition-all" style={{ width: `${progressValue}%` }} />
        </div>

        {step === 0 && (
          <div className="space-y-3">
            <FinniMessage
              variant="coach"
              title="¡El momento que estuvimos construyendo desde L1!"
              message="Hoy no es teoría: vas a hacer tu presupuesto real de este mes. Tus datos, tus números, tu plan."
            />
            <FECard variant="flat" className="border border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10">
              <p className="font-bold mb-2">4 secciones del presupuesto:</p>
              {['1. Ingresos del mes', '2. Gastos fijos', '3. Gastos variables', '4. Meta de ahorro'].map((s) => (
                <p key={s} className="text-sm">✓ {s}</p>
              ))}
            </FECard>
            <FinniMessage
              variant="coach"
              title="Finni recuerda"
              message="Si no recuerdas algún dato exacto, pon tu mejor estimado. Un presupuesto imperfecto es infinitamente mejor que ninguno."
            />
            <button
              className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
              onClick={() => setStep(1)}
            >
              ¡Construir mi presupuesto! →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {renderSection('💰 Sección 1: Ingresos del mes', ingresos, setIngresos, 'border-[var(--color-brand-success)]')}
            {renderSection('📌 Sección 2: Gastos fijos', gastosFijos, setGastosFijos, 'border-[var(--color-brand-warning)]')}

            <FECard variant="flat" className={cn('border', variablesHigh ? 'border-[var(--color-brand-error)]' : 'border-[var(--color-brand-info)]')}>
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold">🔄 Sección 3: Gastos variables</p>
                {variablesHigh && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[var(--color-brand-error)]/10 text-[var(--color-brand-error)] font-semibold">
                    {pctVariables}% ⚠️
                  </span>
                )}
              </div>
              {variablesHigh && (
                <p className="text-xs text-[var(--color-brand-error)] mb-2">
                  Finni avisa: tus variables superan el 30% recomendado.
                </p>
              )}
              <div className="space-y-2">
                {gastosVariables.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex flex-col gap-1 flex-[2]">
                      <label className="text-xs text-[var(--color-text-secondary)]">Descripción</label>
                      <input value={item.label} onChange={(e) => updateItem(setGastosVariables, item.id, 'label', e.target.value)} className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-[var(--color-text-secondary)]">$</label>
                      <input type="number" value={item.amount} onChange={(e) => updateItem(setGastosVariables, item.id, 'amount', e.target.value)} min={0} className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm" />
                    </div>
                    <button onClick={() => removeItem(setGastosVariables, item.id)} aria-label="Eliminar" className="mt-4 p-1 text-[var(--color-text-secondary)]">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addItem(setGastosVariables)} className="mt-2 flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
                <Plus size={16} /> Agregar
              </button>
            </FECard>

            <FECard variant="flat" className="border border-[var(--color-brand-success)]">
              <p className="font-bold mb-2">🌱 Sección 4: Ahorro mensual</p>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--color-text-secondary)]">¿Cuánto destinarás al ahorro este mes? ($)</label>
                <input
                  type="number"
                  value={ahorroMeta}
                  onChange={(e) => setAhorroMeta(e.target.value)}
                  min={0}
                  className="w-full rounded-xl border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                />
              </div>
              {totalIngresos > 0 && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Disponible después de gastos: ${Math.max(0, balance + ahorroNum).toLocaleString()}
                </p>
              )}
            </FECard>

            {totalIngresos > 0 && (
              <FECard
                variant="flat"
                className={cn(
                  'border-2',
                  balance >= 0
                    ? 'bg-[var(--color-brand-success)]/10 border-[var(--color-brand-success)]'
                    : 'bg-[var(--color-brand-error)]/10 border-[var(--color-brand-error)]'
                )}
              >
                <p className="font-bold mb-2">Resumen</p>
                <div className="space-y-1">
                  <div className="flex justify-between"><p className="text-sm">Ingresos</p><p className="font-bold text-sm text-[var(--color-brand-success)]">+${totalIngresos.toLocaleString()}</p></div>
                  <div className="flex justify-between"><p className="text-sm">Gastos fijos</p><p className="font-bold text-sm text-[var(--color-brand-warning)]">-${totalFijos.toLocaleString()} ({pctFijos}%)</p></div>
                  <div className="flex justify-between"><p className="text-sm">Gastos variables</p><p className="font-bold text-sm text-[var(--color-brand-warning)]">-${totalVariables.toLocaleString()} ({pctVariables}%)</p></div>
                  <div className="flex justify-between"><p className="text-sm">Ahorro</p><p className="font-bold text-sm text-[var(--color-brand-info)]">-${ahorroNum.toLocaleString()} ({pctAhorro}%)</p></div>
                  <div className="flex justify-between pt-2 border-t border-[var(--color-neutral-200)]">
                    <p className="font-bold">Balance</p>
                    <p className={cn('font-bold', balance >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-error)]')}>
                      {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </FECard>
            )}

            {canComplete && (
              <button
                className="w-full min-h-11 bg-[var(--color-brand-warning)] text-white rounded-xl font-semibold text-sm"
                onClick={() => void handleConfirm()}
              >
                Guardar mi presupuesto →
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FinniMessage
              variant="success"
              title="¡Tu presupuesto está listo!"
              message="Guardado en tu perfil. En la Lección 13, Finni lo analizará y te dará su veredicto."
            />
            <FECard variant="flat" className="border-2 border-[var(--color-brand-warning)] bg-[var(--color-brand-warning)]/10">
              <p className="font-bold text-base mb-3">Resumen de tu presupuesto</p>
              {[
                { label: 'Ingresos', value: `$${totalIngresos.toLocaleString()}`, colorClass: 'text-[var(--color-brand-success)]' },
                { label: `Fijos (${pctFijos}%)`, value: `$${totalFijos.toLocaleString()}`, colorClass: 'text-[var(--color-brand-warning)]' },
                { label: `Variables (${pctVariables}%)`, value: `$${totalVariables.toLocaleString()}`, colorClass: 'text-[var(--color-brand-warning)]' },
                { label: `Ahorro (${pctAhorro}%)`, value: `$${ahorroNum.toLocaleString()}`, colorClass: 'text-[var(--color-brand-info)]' },
                { label: 'Balance', value: `${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}`, colorClass: balance >= 0 ? 'text-[var(--color-brand-success)]' : 'text-[var(--color-brand-error)]' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between py-1">
                  <p className="text-sm">{r.label}</p>
                  <p className={cn('font-bold text-sm', r.colorClass)}>{r.value}</p>
                </div>
              ))}
            </FECard>
          </div>
        )}
      </div>
    </LessonShell>
  );
}
