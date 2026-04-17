import { ModuleOverview } from '../../../module-kit/components/ModuleOverview';
import { INVESTMENT_MODULE_CONFIG } from './lessonFlow';

export default function InvestmentOverview() {
  return (
    <ModuleOverview
      config={INVESTMENT_MODULE_CONFIG}
      moduleColor="info"
      moduleTitle="Inversión"
    />
  );
}
