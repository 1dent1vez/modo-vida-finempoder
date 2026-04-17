import { ModuleOverview } from '../../../module-kit/components/ModuleOverview';
import { SAVINGS_MODULE_CONFIG } from './lessonFlow';

export default function AhorroOverview() {
  return (
    <ModuleOverview
      config={SAVINGS_MODULE_CONFIG}
      moduleColor="success"
      moduleTitle="Ahorro"
    />
  );
}
