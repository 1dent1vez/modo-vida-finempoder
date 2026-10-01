import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import finni from '../../assets/onb1.png';
import './not-found.css';
export default function NotFound({
  homeHref = '/app',
  homeLabel = 'Volver a mi inicio',
}: {
  homeHref?: string;
  homeLabel?: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Página no encontrada · FinEmpoder';
    return () => {
      document.title = previousTitle;
    };
  }, []);
  return (
    <main className="fe-not-found">
      <a className="not-found-brand" href={homeHref}>
        FinEmpoder.
      </a>
      <div className="not-found-layout">
        <div className="not-found-scene" aria-hidden="true">
          <span>404</span>
          <img src={finni} alt="" />
          <div className="not-found-bubble">
            Por aquí no era.
            <br />
            Vamos a encontrar tu camino.
          </div>
        </div>
        <section>
          <p className="not-found-status">Página no encontrada · 404</p>
          <h1>
            Nos salimos
            <br />
            de la ruta.
          </h1>
          <p>
            Esta página no existe o cambió de lugar. Finni te acompaña de vuelta para que sigas
            aprendiendo.
          </p>
          <a className="not-found-primary" href={homeHref}>
            {homeLabel}
            <ArrowRight size={19} />
          </a>
          <button
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.assign(homeHref);
            }}
          >
            <ArrowLeft size={17} />
            Regresar a la página anterior
          </button>
        </section>
      </div>
      <footer>Un desvío no cambia lo que ya aprendiste.</footer>
    </main>
  );
}
