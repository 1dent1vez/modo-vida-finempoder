import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';

export default function Terms() {
  const nav = useNavigate();

  return (
    <div className="flex min-h-svh flex-col bg-white pt-[calc(12px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 pb-3">
        <div className="flex items-center gap-2">
          <img src={logo} alt="FinEmpoder" className="h-7 w-7 rounded-full object-cover" />
          <span className="font-bold">FinEmpoder</span>
        </div>
        <button
          onClick={() => nav(-1)}
          className="text-sm font-semibold text-[var(--color-brand-warning)] hover:opacity-80 transition-opacity"
        >
          Volver
        </button>
      </header>

      <div className="flex-1 px-4 pt-6">
        <h1 className="mb-4 text-xl font-extrabold">Términos y Condiciones</h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Estos Términos y Condiciones regulan el uso de la aplicación <b className="text-[var(--color-text-primary)]">FinEmpoder</b>, propiedad del Instituto Tecnológico de Toluca.
          <br /><br />
          Al crear una cuenta o utilizar la aplicación, el usuario acepta cumplir con las siguientes disposiciones:
          <br /><br />
          <b className="text-[var(--color-text-primary)]">1. Uso responsable:</b> El usuario se compromete a proporcionar información veraz y a utilizar las herramientas de educación financiera con fines personales y educativos.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">2. Protección de datos:</b> FinEmpoder no comparte datos personales con terceros sin autorización expresa del usuario.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">3. Modificaciones:</b> La aplicación podrá actualizar sus funciones o políticas sin previo aviso, manteniendo siempre el acceso transparente a los usuarios.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">4. Limitación de responsabilidad:</b> FinEmpoder no se responsabiliza por decisiones financieras tomadas con base en el contenido educativo de la aplicación.
          <br /><br />
          Al continuar utilizando FinEmpoder, el usuario acepta íntegramente estos términos.
        </p>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={() => nav(-1)}
          className="w-full rounded-2xl py-3 font-extrabold text-white shadow-[0_12px_28px_rgba(243,156,18,.35)] bg-gradient-to-b from-[#F5B041] to-[#F39C12] hover:from-[#F0A030] hover:to-[#E08E0E] transition-all"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
