import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ActivityFrame, {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { daysAgoLocalKey, localDayKey } from '../../../../lib/localDate';
import '../../../../module-kit/activities/classification.css';
import '../../../../module-kit/activities/savings-progress.css';

const MAX_DAYS = 3;
type RetoPayload = {
  days?: string[];
  dayAmounts?: number[];
  totalAcumulado?: number;
  completedAt?: string;
};
type RetoMigrado = { days: string[]; dayAmounts: number[]; completadoViaLegacy: boolean };
function migrarPayload(p: RetoPayload | null): RetoMigrado {
  const dayAmounts = p?.dayAmounts ?? [];
  if (!p) return { days: [], dayAmounts, completadoViaLegacy: false };
  if (p.days?.length) return { days: p.days, dayAmounts, completadoViaLegacy: false };
  if (p.completedAt || dayAmounts.length >= MAX_DAYS)
    return { days: [], dayAmounts, completadoViaLegacy: true };
  return {
    days: dayAmounts.map((_, index) => daysAgoLocalKey(index + 1)),
    dayAmounts,
    completadoViaLegacy: false,
  };
}
function formatDate(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

export default function L11() {
  const [accepted, setAccepted] = useState(false);
  const [days, setDays] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<number[]>([]);
  const [legacy, setLegacy] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load<RetoPayload>('ahorro', 'l11_reto')
      .then((raw) => {
        if (!mounted.current) return;
        const migrated = migrarPayload(raw);
        setDays(migrated.days);
        setAmounts(migrated.dayAmounts);
        setLegacy(migrated.completadoViaLegacy);
        setAccepted(false);
        setLoading(false);
      })
      .catch(() => {
        if (mounted.current) {
          setLoading(false);
          setLoadError(true);
        }
      });
    return () => {
      mounted.current = false;
    };
  }, [attempt]);
  const count = legacy ? MAX_DAYS : days.length;
  const done = legacy || count >= MAX_DAYS;
  const today = localDayKey(new Date());
  const todayDone = days.includes(today);
  const total = amounts.reduce((sum, value) => sum + value, 0);
  const completeDay = async () => {
    const parsed = Number(amount);
    if (parsed <= 0 || todayDone || done) return;
    setBusy(true);
    setError(null);
    const nextDays = [...days, today];
    const nextAmounts = [...amounts, parsed];
    const payload: RetoPayload = {
      days: nextDays,
      dayAmounts: nextAmounts,
      totalAcumulado: nextAmounts.reduce((sum, value) => sum + value, 0),
      ...(nextDays.length >= MAX_DAYS ? { completedAt: new Date().toISOString() } : {}),
    };
    try {
      await lessonDataRepository.save('ahorro', 'l11_reto', payload);
      if (mounted.current) {
        setDays(nextDays);
        setAmounts(nextAmounts);
        setAmount('');
        setCue(`Día ${nextDays.length} registrado`);
      }
    } catch {
      if (mounted.current) setError('No pudimos guardar tu ahorro. Intenta de nuevo.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  if (loading)
    return (
      <LessonShell id="L11" title="Micro-reto: ahorra en 3 días" completion={{ ready: false }}>
        <ActivityLoading message="Cargando tu reto…" />
      </LessonShell>
    );
  if (loadError)
    return (
      <LessonShell id="L11" title="Micro-reto: ahorra en 3 días" completion={{ ready: false }}>
        <ActivityLoadError
          message="No pudimos recuperar tu reto."
          onRetry={() => setAttempt((value) => value + 1)}
        />
      </LessonShell>
    );
  return (
    <LessonShell
      id="L11"
      title="Micro-reto: ahorra en 3 días"
      showGreeting={false}
      completion={{ ready: done, score: 100 }}
    >
      <ActivityFrame
        label="Micro-reto de constancia"
        className="savings-progress"
        busy={busy}
        title={
          done
            ? 'Completaste tres acciones reales.'
            : accepted
              ? 'Registra una acción real por día.'
              : 'Haz visible un hábito pequeño.'
        }
        description="Aparta el monto que puedas en tres días distintos y registra aquí cada acción."
        progressLabel="Días registrados"
        progressValue={count}
        progressMax={MAX_DAYS}
        stepLabel={
          done
            ? 'Reto completado · 3 de 3'
            : accepted
              ? `Reto activo · ${count} de 3`
              : 'Antes de empezar'
        }
        focusKey={`${accepted}-${count}`}
        advice={{
          title: done
            ? 'Tres registros reales'
            : todayDone
              ? 'El siguiente registro es otro día'
              : count
                ? 'La repetición importa más que el monto'
                : 'Tú eliges el monto',
          text: done
            ? 'Ya tienes evidencia de tres acciones. Usa esa información para decidir qué hábito quieres continuar.'
            : todayDone
              ? `Día ${count}/3 completado. Vuelve mañana para el día ${count + 1}; el reto conserva días distintos.`
              : 'No hay monto mínimo. Registra solo dinero que realmente apartaste.',
          tone: done ? 'success' : todayDone ? 'review' : 'info',
        }}
        adviceCue={cue}
        error={error}
        status={
          busy
            ? 'Guardando…'
            : done
              ? 'Reto guardado.'
              : todayDone
                ? 'Registro de hoy guardado.'
                : 'Tus registros quedan guardados en este dispositivo.'
        }
        actions={
          <div className="spg-actions">
            {!accepted && !done && (
              <button className="ca-primary" onClick={() => setAccepted(true)}>
                Acepto el reto
              </button>
            )}
            {accepted && !done && !todayDone && (
              <button
                className="ca-primary"
                disabled={Number(amount) <= 0 || busy}
                onClick={() => void completeDay()}
              >
                Completar día {count + 1}
              </button>
            )}
          </div>
        }
      >
        {!accepted && !done && (
          <section className="spg-concept">
            <article>
              <span>Acción</span>
              <strong>Aparta algo que puedas</strong>
              <p>Puede ser en una cuenta, alcancía o sobre.</p>
            </article>
            <article>
              <span>Evidencia</span>
              <strong>Un registro por día</strong>
              <p>Los días no necesitan ser consecutivos.</p>
            </article>
            <p>
              El reto mide acciones registradas, no el tamaño del monto ni tu valor como persona.
            </p>
          </section>
        )}
        {accepted && !done && (
          <section className="spg-challenge">
            <div className="spg-days">
              {[0, 1, 2].map((index) => (
                <article
                  key={index}
                  className={index < count ? 'is-done' : index === count ? 'is-current' : ''}
                >
                  <span>Día {index + 1}</span>
                  <strong>
                    {index < count
                      ? `Día ${index + 1}/3 completado`
                      : index === count
                        ? 'Siguiente registro'
                        : 'Pendiente'}
                  </strong>
                  {index < days.length && (
                    <small>
                      Apartado el {formatDate(days[index])} ·{' '}
                      {(amounts[index] ?? 0).toLocaleString('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      })}
                    </small>
                  )}
                </article>
              ))}
            </div>
            {todayDone ? (
              <p className="spg-wait">Vuelve mañana para el día {count + 1}.</p>
            ) : (
              <label className="spg-amount">
                Monto que apartaste hoy
                <input
                  type="number"
                  min="1"
                  placeholder="$0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
            )}
            {count > 0 && (
              <p className="spg-total">Total acumulado: ${total.toLocaleString('es-MX')}</p>
            )}
          </section>
        )}
        {done && (
          <section className="spg-review">
            <span>Reto completado</span>
            <h3>Constancia de 3</h3>
            <p>3 días de ahorro registrados.</p>
            <strong>Total ahorrado: ${total.toLocaleString('es-MX')}</strong>
            {legacy && (
              <small>
                Conservamos el reto completado de la versión anterior sin inventar fechas.
              </small>
            )}
          </section>
        )}
      </ActivityFrame>
    </LessonShell>
  );
}
