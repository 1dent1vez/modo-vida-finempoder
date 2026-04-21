/**
 * Lógica pura de la "Research Gate" — determina si el usuario debe completar
 * el pre-test o post-test antes de navegar libremente a la app.
 *
 * Reglas:
 *  - Si preDone=false → redirigir a /research/pretest
 *  - Si preDone=true && allModulesDone=true && postDone=false → redirigir a /research/posttest
 *  - En cualquier otro caso → null (sin redirección)
 */

export type ResearchStatus = {
  preDone: boolean;
  postDone: boolean;
  allModulesDone: boolean;
};

/**
 * Dadas la ruta de destino y el estado de investigación, devuelve:
 * - Una ruta de redirección (string) si el usuario debe completar algo primero
 * - null si puede seguir navegando libremente
 */
export function evaluateResearchGate(
  _to: string,
  status: ResearchStatus,
): string | null {
  if (!status.preDone) return '/research/pretest';
  if (status.preDone && status.allModulesDone && !status.postDone) {
    return '/research/posttest';
  }
  return null;
}

/**
 * Después de completar el pre o post test, ¿a dónde va el usuario?
 */
export function nextRouteFromStatus(status: ResearchStatus): string {
  if (status.preDone && status.allModulesDone && !status.postDone) {
    return '/research/posttest';
  }
  return '/app';
}
