import { ModuleOverview } from '../../../module-kit/components/ModuleOverview';
import { BUDGET_MODULE_CONFIG } from './lessonFlow';

export default function PresupuestoOverview() {
  return (
    <ModuleOverview
      config={BUDGET_MODULE_CONFIG}
      moduleColor="warning"
      moduleTitle="Presupuestación"
    />
  );
}
