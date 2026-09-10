import { useEffect, useRef, useState } from 'react';
import LessonShell from '../LessonShell';
import ClassificationActivity from '../../../../module-kit/activities/ClassificationActivity';
import {
  ActivityLoadError,
  ActivityLoading,
} from '../../../../module-kit/activities/ActivityFrame';
import {
  initialClassification,
  parseClassification,
} from '../../../../module-kit/activities/classificationModel';
import type {
  ClassificationItem,
  ClassificationState,
} from '../../../../module-kit/activities/classificationModel';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';

// eslint-disable-next-line react-refresh/only-export-components -- dataset exported for lesson contract tests
export const INCOME_ITEMS: ClassificationItem[] = [
  {
    id: 'pronabes',
    title: 'Beca mensual acordada',
    context: 'En este ejemplo recibes la misma cantidad cada mes durante el semestre.',
    category: 'fijo',
    explanation:
      'Su monto y frecuencia están definidos durante el semestre. Revisa cuándo termina ese apoyo.',
  },
  {
    id: 'mesada',
    title: 'Mesada semanal',
    context: 'Tu familia acordó darte la misma cantidad cada semana.',
    category: 'fijo',
    explanation:
      'El monto y la frecuencia del acuerdo son conocidos. Puedes usarlos para planear mientras se mantenga.',
  },
  {
    id: 'apuntes',
    title: 'Venta de cosas usadas',
    context: 'Vendiste unos libros. No sabes cuándo volverás a vender algo.',
    category: 'variable',
    explanation:
      'Es una entrada ocasional. Conviene no depender de ella para un gasto que regresa cada mes.',
  },
  {
    id: 'cafe',
    title: 'Trabajo en un café',
    context: 'Tienes un sueldo mensual definido y un horario establecido.',
    category: 'fijo',
    explanation:
      'En este caso el sueldo y su frecuencia están establecidos, por eso se considera fijo.',
  },
  {
    id: 'cumple',
    title: 'Regalo de cumpleaños',
    context: 'Recibiste dinero como regalo; el monto depende de quien te lo da.',
    category: 'variable',
    explanation:
      'Un regalo no es una cantidad confirmada con frecuencia regular. No lo des por hecho en tu presupuesto.',
  },
  {
    id: 'logo',
    title: 'Diseño de un logo',
    context: 'Te pagan por un proyecto. Los siguientes encargos aún no están confirmados.',
    category: 'variable',
    explanation: 'Los ingresos por proyecto cambian según los encargos que consigas.',
  },
  {
    id: 'propinas',
    title: 'Propinas del trabajo',
    context: 'Recibes propinas, pero la cantidad cambia cada día.',
    category: 'variable',
    explanation: 'Aunque las recibas seguido, el monto cambia: son variables.',
  },
  {
    id: 'apoyo',
    title: 'Apoyo familiar ocasional',
    context: 'Un familiar te dio un apoyo este mes. No hay un acuerdo de repetirlo.',
    category: 'variable',
    explanation: 'Es un apoyo ocasional, no un ingreso confirmado para los siguientes meses.',
  },
  {
    id: 'tutorias',
    title: 'Tutorías por sesión',
    context: 'Cobras por cada clase. La cantidad de sesiones cambia cada semana.',
    category: 'variable',
    explanation:
      'El total depende de las sesiones realizadas. El monto cambia aunque cobres lo mismo por clase.',
  },
];
const DRAFT_KEY = 'l2_classification:v1';
export default function L02() {
  const userId = useAuth((s) => s.user?.id ?? 'local');
  return <IncomeLessonSession key={userId} />;
}
function IncomeLessonSession() {
  const [state, setState] = useState(initialClassification);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  const mounted = useRef(true);
  const inFlight = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    void lessonDataRepository
      .load('presupuesto', DRAFT_KEY)
      .then((raw) => {
        if (!cancelled) {
          setState(parseClassification(raw, INCOME_ITEMS.length) ?? initialClassification());
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);
  const persist = async (next: ClassificationState) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      if (next.completed) {
        const correctCount = INCOME_ITEMS.filter(
          (it, i) => next.firstAnswers[i] === it.category,
        ).length;
        await lessonDataRepository.saveBatch('presupuesto', [
          {
            key: 'l2_incomes',
            data: {
              items: INCOME_ITEMS.map((it) => ({ id: it.id, label: it.title, type: it.category })),
              firstAnswers: next.firstAnswers,
              correctCount,
              score: Math.round((correctCount / INCOME_ITEMS.length) * 100),
            },
          },
          { key: DRAFT_KEY, data: next },
        ]);
      } else {
        await lessonDataRepository.save('presupuesto', DRAFT_KEY, next);
      }
      if (!mounted.current) return;
      if (mounted.current) setState(next);
    } catch {
      if (mounted.current) setError('No pudimos guardar este paso.');
    } finally {
      inFlight.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  const score = Math.round(
    (INCOME_ITEMS.filter((it, i) => state.firstAnswers[i] === it.category).length /
      INCOME_ITEMS.length) *
      100,
  );
  return (
    <LessonShell
      id="L02"
      showGreeting={false}
      title="Ingresos fijos y variables"
      completion={{ ready: !loading && !loadError && state.completed, score }}
    >
      {loading ? (
        <ActivityLoading message="Recuperando tu práctica…" />
      ) : loadError ? (
        <ActivityLoadError
          message="No pudimos recuperar tus respuestas."
          onRetry={() => setRetry((r) => r + 1)}
        />
      ) : (
        <ClassificationActivity
          items={INCOME_ITEMS}
          state={state}
          busy={saving}
          error={error}
          onChange={(next) => void persist(next)}
        />
      )}
    </LessonShell>
  );
}
