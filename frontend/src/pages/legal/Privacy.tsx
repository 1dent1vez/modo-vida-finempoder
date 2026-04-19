import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';

export default function Privacy() {
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
        <h1 className="mb-4 text-xl font-extrabold">Política de Privacidad</h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          La aplicación <b className="text-[var(--color-text-primary)]">FinEmpoder</b> respeta la privacidad de sus usuarios y protege los datos personales conforme a la legislación mexicana vigente.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">1. Recolección de datos:</b> Se recopilan únicamente los datos necesarios para crear la cuenta del usuario (nombre, correo, carrera, edad y número telefónico).
          <br /><br />
          <b className="text-[var(--color-text-primary)]">2. Uso de la información:</b> Los datos se emplean para personalizar la experiencia educativa y mejorar los contenidos financieros.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">3. Seguridad:</b> Los datos se almacenan de manera cifrada en servidores seguros.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">4. Derechos del usuario:</b> El usuario puede solicitar en cualquier momento la eliminación o modificación de sus datos.
          <br /><br />
          <b className="text-[var(--color-text-primary)]">5. Contacto:</b> Para ejercer estos derechos o resolver dudas, puede escribir a <b className="text-[var(--color-text-primary)]">soporte@finempoder.mx</b>.
          <br /><br />
          Al continuar utilizando FinEmpoder, el usuario reconoce haber leído y comprendido esta política de privacidad.
        </p>
      </div>

      <div className="px-4 pt-4">
        <button
          onClick={() => nav(-1)}
          className="w-full rounded-2xl py-3 font-extrabold text-white shadow-[0_12px_28px_rgba(243,156,18,.35)] bg-gradient-to-b from-[#F5B041] to-[#F39C12] hover:from-[#F0A030] hover:to-[#E08E0E] transition-all"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
