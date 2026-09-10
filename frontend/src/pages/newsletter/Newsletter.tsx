import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, LockKeyhole, Mail } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/store/auth';
import { client } from '@/api/client';
import { newsletterApi as api, dateLabel, errorMessage } from './api';
import type { Catalog, Edition, Membership } from './api';
import './newsletter.css';

export default function Newsletter() {
  const userId = useAuth((s) => s.user?.id ?? 'local');
  return <NewsletterContent key={userId} />;
}

function NewsletterContent() {
  const user = useAuth((s) => s.user);
  const [params] = useSearchParams();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [selected, setSelected] = useState<Edition | null>(null);
  const [category, setCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [email, setEmail] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setSelected(null);
    Promise.all([
      api.get<Catalog>('/catalog', controller.signal),
      user ? api.get<Membership>('/me', controller.signal) : null,
    ])
      .then(([c, m]) => {
        if (!controller.signal.aborted) {
          setCatalog(c);
          setMembership(m);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user, retry]);

  // Clear the paid body when entitlement expires, even if the reader leaves the tab open.
  useEffect(() => {
    if (!membership?.accessUntil) return;
    const remaining = Date.parse(membership.accessUntil) - Date.now();
    if (remaining <= 0) return;
    const timer = window.setTimeout(
      () => {
        setSelected(null);
        setMembership(null);
        setRetry((n) => n + 1);
      },
      Math.min(remaining + 100, 2147483647),
    );
    return () => window.clearTimeout(timer);
  }, [membership?.accessUntil]);

  async function action(task: () => Promise<void>) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function redirect(url: string) {
    const target = new URL(url);
    if (
      target.protocol !== 'https:' ||
      !['checkout.stripe.com', 'billing.stripe.com'].includes(target.hostname)
    )
      throw new Error('Destino de pago inválido');
    window.location.assign(target.toString());
  }
  async function read(row: Edition) {
    await action(async () => {
      const full = await api.get<Edition>(`${row.is_sample ? '/sample' : '/editions'}/${row.id}`);
      setSelected(full);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  const categories = ['Todas', 'Antes de contratar', 'Fugas de dinero', 'La letra chiquita'];
  const editions =
    catalog?.editions.filter((row) => category === 'Todas' || row.category === category) ?? [];

  return (
    <div className="newsletter-page">
      <PageHeader
        title="Newsletter"
        rightSlot={
          membership?.isEditor ? (
            <Link className="nl-text-link" to="/app/newsletter/editor">
              Editar
            </Link>
          ) : null
        }
      />
      <div className="nl-container">
        {error && (
          <div className="nl-message" role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => setRetry((n) => n + 1)}>
              Volver a intentar
            </button>
          </div>
        )}
        {notice && (
          <p className="nl-message" role="status">
            {notice}
          </p>
        )}
        {params.get('payment') === 'processing' && !membership?.hasAccess && (
          <div className="nl-message" role="status">
            <p>
              Estamos esperando la confirmación de tu pago. Tu acceso se activará cuando lo confirme
              el proveedor.
            </p>
            <button type="button" onClick={() => setRetry((n) => n + 1)}>
              Comprobar mi acceso
            </button>
          </div>
        )}
        {params.get('payment') === 'cancelled' && (
          <p className="nl-muted">Saliste del proceso de pago. Puedes retomarlo cuando quieras.</p>
        )}
        {loading ? (
          <p className="nl-loading" role="status">
            Cargando tus ediciones…
          </p>
        ) : selected ? (
          <article className="nl-article">
            <button className="nl-text-link" type="button" onClick={() => setSelected(null)}>
              Volver a las ediciones
            </button>
            <h2>{selected.title}</h2>
            <p className="nl-lead">{selected.summary}</p>
            <p className="nl-muted">
              Por {selected.author} · {dateLabel(selected.published_at)}
            </p>
            <div className="nl-article-body">
              {selected.body?.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <h3>Fuentes</h3>
            <ul>
              {selected.sources?.map((source) => (
                <li key={source.url}>
                  <a href={source.url} rel="noopener noreferrer" target="_blank">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <>
            <section className="nl-intro">
              <div>
                <h2>Entiende la letra chiquita de tu dinero.</h2>
                <p className="nl-lead">
                  Tarjetas, productos bancarios y gastos que pasan desapercibidos. Una decisión a la
                  vez, con ejemplos de México.
                </p>
                <p className="nl-format">
                  <Mail size={18} aria-hidden="true" /> Tres ediciones al mes, en tu correo y aquí.
                </p>
              </div>
              <div className="nl-membership">
                {membership?.hasAccess ? (
                  <>
                    <h3>
                      {membership.isPilot
                        ? 'Tu acceso al piloto'
                        : membership.inGrace
                          ? 'Revisa tu pago'
                          : 'Tu suscripción'}
                    </h3>
                    <p>
                      {membership.isPilot
                        ? 'Prueba gratuita, sin renovación automática.'
                        : membership.cancelAtPeriodEnd
                          ? 'La renovación está cancelada.'
                          : 'Newsletter Finempoder · $49 MXN al mes.'}
                    </p>
                    <p className="nl-muted">Acceso hasta el {dateLabel(membership.accessUntil)}.</p>
                    {membership.inGrace && (
                      <p>
                        No se completó tu renovación. Actualiza tu método de pago antes de que
                        termine el periodo de gracia.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3>Tres lecturas para decidir mejor</h3>
                    <p className="nl-price">
                      $49 <span>MXN / mes</span>
                    </p>
                    <p>
                      Incluye las ediciones completas y el archivo. Cancela la renovación desde tu
                      cuenta.
                    </p>
                  </>
                )}
                {!membership?.hasAccess && (!membership?.canManage || membership.canSubscribe) && (
                  <>
                    {!catalog?.paymentsReady && !user && (
                      <p className="nl-availability">
                        La contratación abrirá con el lanzamiento. Por ahora, el piloto es por
                        invitación.
                      </p>
                    )}
                    {!user ? (
                      <Link className="nl-primary-link" to="/auth">
                        {catalog?.paymentsReady
                          ? 'Iniciar sesión para suscribirme'
                          : 'Iniciar sesión para el piloto'}{' '}
                        <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    ) : catalog?.paymentsReady ? (
                      <>
                        <label className="nl-check">
                          <input
                            type="checkbox"
                            checked={adult}
                            onChange={(e) => setAdult(e.target.checked)}
                          />
                          Tengo 18 años o más.
                        </label>
                        <label className="nl-check">
                          <input
                            type="checkbox"
                            checked={terms}
                            onChange={(e) => setTerms(e.target.checked)}
                          />
                          <span>
                            Acepto los <Link to="/terms">términos</Link>, la{' '}
                            <Link to="/privacy">privacidad</Link> y el cobro recurrente de $49 MXN
                            al mes.
                          </span>
                        </label>
                        <label className="nl-check">
                          <input
                            type="checkbox"
                            checked={email}
                            onChange={(e) => setEmail(e.target.checked)}
                          />
                          Quiero recibir las ediciones por correo.
                        </label>
                        <Button
                          disabled={!adult || !terms || busy}
                          onClick={() =>
                            action(async () =>
                              redirect(
                                (
                                  await api.post<{ url: string }>('/checkout', {
                                    adult,
                                    acceptsTerms: terms,
                                    emailEnabled: email,
                                  })
                                ).url,
                              ),
                            )
                          }
                        >
                          {busy ? 'Abriendo pago…' : 'Suscribirme por $49 al mes'}
                        </Button>
                        <p className="nl-small">El pago se completa de forma segura con Stripe.</p>
                      </>
                    ) : (
                      <p className="nl-availability">
                        La contratación abrirá con el lanzamiento. Por ahora, el piloto es por
                        invitación.
                      </p>
                    )}
                  </>
                )}
                {membership?.canManage && (
                  <div className="nl-actions">
                    <Button
                      disabled={busy}
                      variant="outline"
                      onClick={() =>
                        action(async () =>
                          redirect((await api.post<{ url: string }>('/portal')).url),
                        )
                      }
                    >
                      Administrar pagos
                    </Button>
                    {!membership.cancelAtPeriodEnd &&
                      membership.status !== 'canceled' &&
                      !confirmCancel && (
                        <button
                          className="nl-text-link"
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmCancel(true)}
                        >
                          Cancelar renovación
                        </button>
                      )}
                    {confirmCancel && (
                      <div>
                        <p>Conservarás acceso hasta terminar el periodo pagado.</p>
                        <Button
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              await api.post('/cancel');
                              setConfirmCancel(false);
                              setNotice(
                                'Renovación cancelada. Tu acceso continúa hasta terminar el periodo pagado.',
                              );
                              setRetry((n) => n + 1);
                            })
                          }
                        >
                          Confirmar cancelación
                        </Button>
                        <button
                          className="nl-text-link"
                          type="button"
                          onClick={() => setConfirmCancel(false)}
                        >
                          Conservar renovación
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {membership && (membership.hasAccess || membership.canManage) && (
                  <label className="nl-check">
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={membership.emailEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        void action(async () => {
                          await client.patch('/newsletter/preferences', { emailEnabled: enabled });
                          setMembership({ ...membership, emailEnabled: enabled });
                          setNotice(
                            'Preferencia de correo actualizada. Tu suscripción de pago no cambia.',
                          );
                        });
                      }}
                    />
                    Recibir ediciones por correo
                  </label>
                )}
              </div>
            </section>
            <section className="nl-archive" aria-labelledby="editions-heading">
              <h2 id="editions-heading">Ediciones</h2>
              <div className="nl-filters" aria-label="Filtrar por tema">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {!editions.length ? (
                <div className="nl-empty">
                  <BookOpen size={28} aria-hidden="true" />
                  <h3>
                    {catalog?.editions.length
                      ? 'Todavía no hay ediciones de este tema.'
                      : 'Estamos preparando las primeras ediciones.'}
                  </h3>
                  <p>
                    Encontrarás aquí las publicaciones revisadas y una muestra gratuita para conocer
                    el newsletter.
                  </p>
                </div>
              ) : (
                <div className="nl-editions">
                  {editions.map((row) => (
                    <article key={row.id} className="nl-edition">
                      <div>
                        <p className="nl-muted">
                          {row.category} · {dateLabel(row.published_at)}
                        </p>
                        <h3>{row.title}</h3>
                        <p>{row.summary}</p>
                      </div>
                      <div>
                        {row.is_sample || membership?.hasAccess ? (
                          <button
                            className="nl-text-link"
                            disabled={busy}
                            type="button"
                            onClick={() => read(row)}
                          >
                            {row.is_sample ? 'Leer muestra gratuita' : 'Leer edición'}{' '}
                            <ArrowRight size={17} aria-hidden="true" />
                          </button>
                        ) : (
                          <span className="nl-locked">
                            <LockKeyhole size={16} aria-hidden="true" />
                            Para suscriptores
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
            <footer className="nl-footer">
              <p>Finempoder sigue siendo gratis. La suscripción ayuda a sostener la aplicación.</p>
              {catalog?.supportEmail && (
                <a href={`mailto:${catalog.supportEmail}`}>Ayuda con tu suscripción</a>
              )}
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
