import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { client } from '@/api/client';
import { newsletterApi as api, errorMessage, dateLabel } from './api';
import type { Edition, Membership } from './api';
import './newsletter.css';

const empty = {
  title: '',
  summary: '',
  category: 'Antes de contratar',
  author: '',
  body: '',
  is_sample: false,
};
const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  approved: 'Aprobada',
  scheduled: 'Programada',
  sending: 'Enviando',
  published: 'Publicada',
  failed: 'Requiere revisión',
};
type Member = {
  user_id: string;
  email: string;
  status: string;
  paid_until: string | null;
  pilot_until: string | null;
};

export default function NewsletterAdmin() {
  const id = useAuth((s) => s.user?.id ?? 'local');
  return <Editor key={id} />;
}
function Editor() {
  const token = useAuth((s) => s.token);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [current, setCurrent] = useState<Edition | null>(null);
  const [form, setForm] = useState(empty);
  const [sources, setSources] = useState('');
  const [dirty, setDirty] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [at, setAt] = useState('');
  const [pilotUser, setPilotUser] = useState('');
  const [pilotUntil, setPilotUntil] = useState('');
  const [pilotConsent, setPilotConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<Membership>('/me', controller.signal)
      .then(async (me) => {
        if (!me.isEditor) return;
        const [rows, users] = await Promise.all([
          api.get<Edition[]>('/admin/editions', controller.signal),
          api.get<Member[]>('/admin/members', controller.signal),
        ]);
        if (!controller.signal.aborted) {
          setAllowed(true);
          setEditions(rows);
          setMembers(users);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, reload]);
  async function refresh() {
    const [rows, users] = await Promise.all([
      api.get<Edition[]>('/admin/editions'),
      api.get<Member[]>('/admin/members'),
    ]);
    setEditions(rows);
    setMembers(users);
    if (current) setCurrent(rows.find((row) => row.id === current.id) ?? current);
  }
  async function action(task: () => Promise<void>, success: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
      await refresh();
      setNotice(success);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function select(row: Edition | null) {
    setCurrent(row);
    setForm(
      row
        ? {
            title: row.title,
            summary: row.summary,
            category: row.category,
            author: row.author,
            body: row.body ?? '',
            is_sample: row.is_sample,
          }
        : empty,
    );
    setSources(row?.sources?.map((s) => `${s.title} | ${s.url}`).join('\n') ?? '');
    setDirty(false);
    setReviewed(false);
    setNotice('');
    setEmailPreview('');
  }
  const locked = !!current && ['sending', 'published', 'failed'].includes(current.status ?? '');
  const touch = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    setDirty(true);
    setReviewed(false);
    setEmailPreview('');
  };
  async function save() {
    const parsed = sources
      .split('\n')
      .filter((s) => s.trim())
      .map((line) => {
        const index = line.indexOf('|');
        return {
          title: index > 0 ? line.slice(0, index).trim() : '',
          url: index > 0 ? line.slice(index + 1).trim() : '',
        };
      });
    const data = { ...form, sources: parsed, version: current?.version };
    const row = current
      ? (await client.put<Edition>(`/newsletter/admin/editions/${current.id}`, data)).data
      : await api.post<Edition>('/admin/editions', data);
    setCurrent(row);
    setDirty(false);
    setReviewed(false);
  }
  if (loading)
    return (
      <p className="nl-container" role="status">
        Comprobando acceso editorial…
      </p>
    );
  if (!allowed)
    return (
      <div className="nl-container">
        <h1>Panel editorial</h1>
        <p>{error || 'Necesitas una cuenta autorizada como responsable editorial.'}</p>
        <button className="nl-text-link" onClick={() => setReload((n) => n + 1)}>
          Volver a comprobar
        </button>
        <br />
        <Link to="/app/newsletter">Volver al newsletter</Link>
      </div>
    );
  return (
    <div className="newsletter-page">
      <PageHeader
        title="Panel editorial"
        rightSlot={
          <Link className="nl-text-link" to="/app/newsletter">
            Ver newsletter
          </Link>
        }
      />
      <div className="nl-container nl-admin">
        {error && (
          <p className="nl-message" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="nl-message" role="status">
            {notice}
          </p>
        )}
        <section>
          <h2>Publicaciones</h2>
          <p className="nl-muted">
            Guarda el borrador, revisa sus fuentes y aprueba la versión antes de programarla.
          </p>
          <div className="nl-admin-actions">
            <Button variant="outline" disabled={dirty || busy} onClick={() => select(null)}>
              Nueva edición
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await api.post('/admin/reconcile-delivery');
                }, 'Estado de los envíos actualizado.')
              }
            >
              Actualizar envíos
            </Button>
          </div>
          {editions.length ? (
            <div className="nl-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Edición</th>
                    <th>Estado</th>
                    <th>Envío</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {editions.map((row) => (
                    <tr key={row.id}>
                      <td>{row.title}</td>
                      <td>{statusLabels[row.status ?? 'draft']}</td>
                      <td>{row.delivery_error ?? row.delivery_status ?? 'Sin envío'}</td>
                      <td>
                        <button
                          className="nl-text-link"
                          disabled={dirty || busy}
                          onClick={() => select(row)}
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay borradores todavía. Prepara tu primera edición abajo.</p>
          )}
        </section>
        <section>
          <h2>{current ? 'Revisar edición' : 'Preparar una edición'}</h2>
          <form
            className="nl-admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              void action(save, 'Borrador guardado. Revisa esta versión antes de aprobar.');
            }}
          >
            <label>
              Título
              <input
                required
                minLength={5}
                maxLength={140}
                disabled={locked || busy}
                value={form.title}
                onChange={(e) => touch({ title: e.target.value })}
              />
            </label>
            <label>
              Resumen
              <textarea
                required
                minLength={20}
                maxLength={600}
                disabled={locked || busy}
                value={form.summary}
                onChange={(e) => touch({ summary: e.target.value })}
              />
            </label>
            <label>
              Tema
              <select
                value={form.category}
                disabled={locked || busy}
                onChange={(e) => touch({ category: e.target.value })}
              >
                {['Antes de contratar', 'Fugas de dinero', 'La letra chiquita'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Responsable editorial
              <input
                required
                minLength={3}
                maxLength={120}
                disabled={locked || busy}
                value={form.author}
                onChange={(e) => touch({ author: e.target.value })}
              />
            </label>
            <label>
              Contenido completo
              <textarea
                name="body"
                required
                minLength={100}
                maxLength={40000}
                disabled={locked || busy}
                value={form.body}
                onChange={(e) => touch({ body: e.target.value })}
              />
              <span className="nl-muted">
                Texto plano; separa los párrafos con una línea vacía.
              </span>
            </label>
            <label>
              Fuentes
              <textarea
                required
                disabled={locked || busy}
                placeholder="Título de la fuente | https://..."
                value={sources}
                onChange={(e) => {
                  setSources(e.target.value);
                  setDirty(true);
                  setReviewed(false);
                }}
              />
              <span className="nl-muted">Una por línea: título, separador | y URL HTTPS.</span>
            </label>
            <label className="nl-check">
              <span>
                <input
                  type="checkbox"
                  disabled={locked || busy}
                  checked={form.is_sample}
                  onChange={(e) => touch({ is_sample: e.target.checked })}
                />{' '}
                Ofrecer esta edición como muestra gratuita completa.
              </span>
            </label>
            {!locked && (
              <div className="nl-admin-actions">
                <Button type="submit" disabled={busy}>
                  Guardar borrador
                </Button>
                {dirty && (
                  <button type="button" className="nl-text-link" onClick={() => select(current)}>
                    Descartar cambios sin guardar
                  </button>
                )}
              </div>
            )}
          </form>
          {current && (
            <>
              <div className="nl-admin-actions">
                <Button
                  disabled={dirty || busy}
                  variant="outline"
                  onClick={() =>
                    action(async () => {
                      setEmailPreview(
                        (await api.get<{ html: string }>(`/admin/editions/${current.id}/preview`))
                          .html,
                      );
                    }, 'Vista previa del correo lista.')
                  }
                >
                  Previsualizar correo
                </Button>
                <Button
                  disabled={dirty || busy}
                  variant="outline"
                  onClick={() =>
                    action(async () => {
                      await api.post(`/admin/editions/${current.id}/test`);
                    }, 'Correo de prueba enviado a tu cuenta editorial.')
                  }
                >
                  Enviarme una prueba
                </Button>
              </div>
              {current.status === 'draft' && (
                <>
                  <label className="nl-check">
                    <input
                      type="checkbox"
                      disabled={dirty || busy}
                      checked={reviewed}
                      onChange={(e) => setReviewed(e.target.checked)}
                    />
                    Revisé fuentes, cálculos, condiciones de los productos y contenido de esta
                    versión.
                  </label>
                  <Button
                    disabled={dirty || !reviewed || busy}
                    onClick={() =>
                      action(async () => {
                        await api.post(`/admin/editions/${current.id}/approve`, {
                          reviewed,
                          version: current.version,
                        });
                      }, 'Versión aprobada. Ya puedes programarla.')
                    }
                  >
                    Aprobar versión
                  </Button>
                </>
              )}
              {current.status === 'approved' && (
                <div className="nl-admin-form">
                  <label>
                    Fecha y hora de publicación (hora de tu dispositivo)
                    <input
                      type="datetime-local"
                      value={at}
                      onChange={(e) => setAt(e.target.value)}
                    />
                  </label>
                  <Button
                    disabled={!at || dirty || busy}
                    onClick={() =>
                      action(async () => {
                        await api.post(`/admin/editions/${current.id}/schedule`, {
                          at: new Date(at).toISOString(),
                          version: current.version,
                        });
                      }, 'Publicación programada.')
                    }
                  >
                    Programar publicación
                  </Button>
                </div>
              )}
              {current.scheduled_at && (
                <p className="nl-muted">
                  Programada para {new Date(current.scheduled_at).toLocaleString('es-MX')}.
                </p>
              )}
              {emailPreview && (
                <iframe
                  title="Vista previa del correo"
                  sandbox=""
                  srcDoc={emailPreview}
                  style={{
                    width: '100%',
                    height: 600,
                    border: '1px solid var(--color-border)',
                    marginTop: 24,
                  }}
                />
              )}
              <details className="nl-article">
                <summary className="nl-text-link">Vista previa de lectura</summary>
                <h2>{form.title}</h2>
                <p>{form.summary}</p>
                <p>Por {form.author}</p>
                <div className="nl-article-body">
                  {form.body.split(/\n\s*\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            </>
          )}
        </section>
        <section>
          <h2>Participantes del piloto</h2>
          <p className="nl-muted">
            Agrega únicamente a participantes que hayan aceptado la invitación. No se les pedirá
            tarjeta ni se les cobrará al terminar.
          </p>
          <form
            className="nl-admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                await api.post('/admin/pilot', {
                  userId: pilotUser,
                  until: new Date(pilotUntil).toISOString(),
                  emailConsent: pilotConsent,
                });
                setPilotUser('');
              }, 'Acceso al piloto registrado.');
            }}
          >
            <label>
              Identificador de la cuenta (UUID)
              <input required value={pilotUser} onChange={(e) => setPilotUser(e.target.value)} />
            </label>
            <label>
              Fin del piloto (máximo 32 días)
              <input
                required
                type="datetime-local"
                value={pilotUntil}
                onChange={(e) => setPilotUntil(e.target.value)}
              />
            </label>
            <label className="nl-check">
              <span>
                <input
                  type="checkbox"
                  checked={pilotConsent}
                  onChange={(e) => setPilotConsent(e.target.checked)}
                />{' '}
                El participante aceptó recibir las ediciones por correo.
              </span>
            </label>
            <Button type="submit" disabled={busy}>
              Dar acceso al piloto
            </Button>
          </form>
        </section>
        <section>
          <h2>Suscriptores y participantes</h2>
          <div className="nl-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Estado de cobro</th>
                  <th>Periodo pagado hasta</th>
                  <th>Piloto hasta</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id}>
                    <td>{m.email}</td>
                    <td>{m.status === 'none' ? 'Sin suscripción de pago' : m.status}</td>
                    <td>{dateLabel(m.paid_until) || '—'}</td>
                    <td>{dateLabel(m.pilot_until) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
