import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Pilot from './Pilot';
import NotFound from '../../pages/errors/NotFound';
import '../../styles/tokens.css';
import './pilot.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(window.location.search).get('preview') === '404' ||
    !['/', '/piloto.html'].includes(window.location.pathname) ? (
      <NotFound homeHref="/piloto.html" homeLabel="Volver al piloto" />
    ) : (
      <Pilot />
    )}
  </StrictMode>,
);
