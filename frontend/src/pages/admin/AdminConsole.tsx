import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, FileText, Mail, RefreshCw, Users } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { useAuth } from '@/store/auth';
import { client } from '@/api/client';
import { newsletterEnabled } from '@/lib/newsletterFeature';
import './admin-console.css';

type Tab = 'overview' | 'newsletter' | 'users' | 'operations';
type Edition = {
  id: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  delivery_status: string | null;
  delivery_error: string | null;
  created_at: string;
};
type Overview = {
  metrics: {
    accounts: number;
    completedLessons: number;
    newsletterMembers: number;
    draft: number;
    approved: number;
    scheduled: number;
    sending: number;
    failed: number;
  };
  editions: Edition[];
  modules: { id: string; lessons: number }[];
  services: {
    api: boolean;
    newsletter: boolean;
    payments: boolean;
    email: boolean;
    editorialAi: boolean;
    publicationJob: boolean;
  };
};
type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
};
type UserPage = { page: number; perPage: number; total: number; users: AdminUser[] };

const statusName: Record<string, string> = {
  draft: 'Borrador', approved: 'Aprobada', scheduled: 'Programada',
  sending: 'Enviando', published: 'Publicada', failed: 'Requiere revisión',
};
const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Resumen' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'users', label: 'Usuarios' },
  { id: 'operations', label: 'Operación' },
];
const date = (value: string | null) => value
  ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—';

export default function AdminConsole() {
  const token = useAuth(state => state.token);
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied' | 'error'>('checking');
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UserPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!token) { setAccess('denied'); return; }
    const controller = new AbortController();
    setAccess('checking');
    client.get('/admin/me', { signal: controller.signal })
      .then(() => { if (!controller.signal.aborted) setAccess('allowed'); })
      .catch((reason: { response?: { status?: number } }) => {
        if (!controller.signal.aborted) setAccess(reason.response?.status === 403 ? 'denied' : 'error');
      });
    return () => controller.abort();
  }, [token, refresh]);

  useEffect(() => {
    if (access !== 'allowed') return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const request = tab === 'users'
      ? client.get<UserPage>('/admin/users', { params: { page }, signal: controller.signal })
      : client.get<Overview>('/admin/overview', { signal: controller.signal });
    request.then(response => {
      if (controller.signal.aborted) return;
      if (tab === 'users') setUsers(response.data as UserPage);
      else setOverview(response.data as Overview);
    }).catch(() => {
      if (!controller.signal.aborted) setError('No se pudieron cargar los datos. Intenta de nuevo.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [access, tab, page, refresh]);

  if (access !== 'allowed') return (
    <div className="admin-console">
      <PageHeader title="Administración" />
      <main className="admin-shell admin-access" role={access === 'checking' ? 'status' : undefined}>
        <h1>{access === 'checking' ? 'Comprobando acceso…' : 'Acceso administrativo'}</h1>
        {access === 'denied' && <p>{token ? 'Esta cuenta no tiene el rol de administración.' : 'Inicia sesión con una cuenta administradora para continuar.'}</p>}
        {access === 'error' && <p>No pudimos comprobar el acceso en este momento.</p>}
        {access !== 'checking' && token && <button type="button" className="admin-button" onClick={() => setRefresh(value => value + 1)}>Volver a comprobar</button>}
        <Link to={token ? '/app/settings' : '/auth'}>{token ? 'Volver a ajustes' : 'Iniciar sesión'}</Link>
      </main>
    </div>
  );

  const metrics = overview?.metrics;
  return (
    <div className="admin-console">
      <PageHeader title="Administración" rightSlot={<button type="button" className="admin-icon-button" aria-label="Actualizar datos" title="Actualizar datos" onClick={() => setRefresh(value => value + 1)}><RefreshCw size={18} /></button>} />
      <main className="admin-shell">
        <div className="admin-heading"><div><p className="admin-eyebrow">FINEMPODER</p><h1>Centro de control</h1></div><span className="admin-role">Administrador</span></div>
        <div className="admin-tabs" role="tablist" aria-label="Secciones de administración">
          {tabs.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}
        </div>
        {loading && <p className="admin-feedback" role="status">Cargando datos…</p>}
        {error && <p className="admin-feedback admin-error" role="alert">{error}</p>}
        {!loading && !error && tab === 'overview' && overview && <>
          <section className="admin-section" aria-labelledby="admin-activity"><h2 id="admin-activity">Actividad</h2>
            <div className="admin-metrics">
              <Metric icon={<Users size={18} />} label="Cuentas" value={metrics?.accounts ?? 0} />
              <Metric icon={<BookOpen size={18} />} label="Lecciones completadas" value={metrics?.completedLessons ?? 0} />
              <Metric icon={<Mail size={18} />} label="Registros del newsletter" value={metrics?.newsletterMembers ?? 0} />
            </div>
          </section>
          <section className="admin-section" aria-labelledby="admin-queue"><div className="admin-section-heading"><h2 id="admin-queue">Cola editorial</h2>{newsletterEnabled() && overview.services.newsletter ? <Link to="/app/admin/newsletter">Abrir editorial <ArrowRight size={16} /></Link> : <span className="admin-readonly">Newsletter desactivado</span>}</div>
            <div className="admin-queue">
              <QueueStat label="Borradores" value={metrics?.draft ?? 0} />
              <QueueStat label="Aprobadas" value={metrics?.approved ?? 0} />
              <QueueStat label="Programadas" value={metrics?.scheduled ?? 0} />
              <QueueStat label="Requieren revisión" value={metrics?.failed ?? 0} critical />
            </div>
          </section>
          <section className="admin-section" aria-labelledby="admin-recent"><div className="admin-section-heading"><h2 id="admin-recent">Ediciones recientes</h2><button type="button" onClick={() => setTab('newsletter')}>Ver cola</button></div><EditionTable editions={overview.editions} /></section>
        </>}
        {!loading && !error && tab === 'newsletter' && overview && <>
          <section className="admin-section" aria-labelledby="admin-newsletter"><div className="admin-section-heading"><div><h2 id="admin-newsletter">Billete Bajo Control</h2><p>Producción, revisión y publicación</p></div>{newsletterEnabled() && overview.services.newsletter ? <Link className="admin-primary-link" to="/app/admin/newsletter">Abrir editorial <ArrowRight size={16} /></Link> : <span className="admin-readonly">Newsletter desactivado</span>}</div>
            <div className="admin-queue">
              <QueueStat label="Borradores" value={metrics?.draft ?? 0} />
              <QueueStat label="Aprobadas" value={metrics?.approved ?? 0} />
              <QueueStat label="Programadas" value={metrics?.scheduled ?? 0} />
              <QueueStat label="Enviando" value={metrics?.sending ?? 0} />
              <QueueStat label="Requieren revisión" value={metrics?.failed ?? 0} critical />
            </div>
            <h3 className="admin-subheading">Ediciones recientes</h3><EditionTable editions={overview.editions} />
          </section>
          {newsletterEnabled() && <section className="admin-section admin-links"><Link to="/app/newsletter">Ver publicación para lectores <ArrowRight size={16} /></Link></section>}
        </>}
        {!loading && !error && tab === 'users' && users && <section className="admin-section" aria-labelledby="admin-users"><div className="admin-section-heading"><div><h2 id="admin-users">Usuarios</h2><p>{users.total.toLocaleString('es-MX')} cuentas</p></div><span className="admin-readonly">Solo consulta</span></div>
          <div className="admin-table-wrap"><table><thead><tr><th>Cuenta</th><th>Rol</th><th>Alta</th><th>Último acceso</th></tr></thead><tbody>{users.users.map(user => <tr key={user.id}><td><strong>{user.name || 'Sin nombre'}</strong><span>{user.email || 'Sin correo'}{!user.emailConfirmed ? ' · Sin confirmar' : ''}</span></td><td>{user.role === 'admin' ? 'Administrador' : 'Estudiante'}</td><td>{date(user.createdAt)}</td><td>{date(user.lastSignInAt)}</td></tr>)}</tbody></table></div>
          {users.users.length === 0 && <p className="admin-empty">No hay cuentas en esta página.</p>}
          <div className="admin-pagination"><button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page}</span><button type="button" disabled={page * users.perPage >= users.total} onClick={() => setPage(value => value + 1)}>Siguiente</button></div>
        </section>}
        {!loading && !error && tab === 'operations' && overview && <>
          <section className="admin-section" aria-labelledby="admin-services"><div className="admin-section-heading"><div><h2 id="admin-services">Configuración operativa</h2><p>Disponibilidad configurada, no verificación del proveedor</p></div></div>
            <div className="admin-service-list">
              <Service label="API" enabled={overview.services.api} />
              <Service label="Newsletter" enabled={overview.services.newsletter} />
              <Service label="Pagos" enabled={overview.services.payments} />
              <Service label="Envío de correo" enabled={overview.services.email} />
              <Service label="IA editorial" enabled={overview.services.editorialAi} />
              <Service label="Trabajo de publicación" enabled={overview.services.publicationJob} />
            </div>
          </section>
          <section className="admin-section" aria-labelledby="admin-content"><h2 id="admin-content">Contenido educativo</h2><div className="admin-module-list">{overview.modules.map(module => <div key={module.id}><FileText size={18} /><strong>{module.id}</strong><span>{module.lessons} lecciones</span></div>)}</div></section>
        </>}
      </main>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="admin-metric">{icon}<span>{label}</span><strong>{value.toLocaleString('es-MX')}</strong></div>;
}
function QueueStat({ label, value, critical = false }: { label: string; value: number; critical?: boolean }) {
  return <div className="admin-queue-stat"><span>{critical ? <Clock3 size={15} /> : <CheckCircle2 size={15} />}{label}</span><strong className={critical && value ? 'critical' : ''}>{value}</strong></div>;
}
function Service({ label, enabled }: { label: string; enabled: boolean }) {
  return <div><span className={enabled ? 'admin-dot enabled' : 'admin-dot'} /><strong>{label}</strong><span>{enabled ? 'Configurado' : 'No configurado'}</span></div>;
}
function EditionTable({ editions }: { editions: Edition[] }) {
  if (!editions.length) return <p className="admin-empty">Aún no hay ediciones.</p>;
  return <div className="admin-table-wrap"><table><thead><tr><th>Edición</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{editions.map(edition => <tr key={edition.id}><td><strong>{edition.title}</strong>{edition.delivery_error && <span className="admin-row-error">{edition.delivery_error}</span>}</td><td><span className={`admin-status admin-status-${edition.status}`}>{statusName[edition.status] ?? edition.status}</span></td><td>{date(edition.scheduled_at || edition.created_at)}</td></tr>)}</tbody></table></div>;
}
