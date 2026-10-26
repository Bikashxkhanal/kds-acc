import { useState } from 'react';
import BSDateField from './components/common/BSDateField.jsx';
import SalesPurchaseChart from './features/dashboard/SalesPurchaseChart.jsx';

export default function DateDebug() {
  const [value, setValue] = useState('');
  return <main style={{ padding: 24 }}>
    <h1>Temporary date flow reproduction</h1>
    <p data-testid="received">Form state: <output>{value || '(empty)'}</output></p>
    <BSDateField label="Debug date" value={value} defaultToToday onChange={(next) => { console.log('[temporary-date-debug] parent onChange', { next, type: typeof next }); setValue(next); }} />
    <SalesPurchaseChart />
  </main>;
}
