import { Navigate } from 'react-router-dom';

// Entrada del módulo de inversión: redirige al overview siguiendo el patrón de módulos anteriores.
export default function InversionIndex() {
  return <Navigate to="/app/inversion/overview" replace />;
}
