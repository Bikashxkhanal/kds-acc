import { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n.js';

const LocaleContext = createContext(null);
const optionKeys = { Private: 'customer.type.private', Governmental: 'customer.type.governmental', NGO: 'customer.type.ngo', Tractor: 'vehicle.tractor', JCB: 'vehicle.jcb', Tipper: 'vehicle.tipper', None: 'vehicle.none', Active: 'staff.active', Inactive: 'staff.inactive', 'Tractor Driver': 'staff.tractorDriver', 'JCB Operator': 'staff.jcbOperator', 'Tipper Driver': 'staff.tipperDriver', Helper: 'staff.helper', Accountant: 'staff.accountant', Manager: 'staff.manager', Other: 'staff.other', 'Partially Paid': 'purchase.status.partial', Paid: 'purchase.status.paid', Unpaid: 'purchase.status.unpaid', paid: 'purchase.status.paid', partial: 'purchase.status.partial', unpaid: 'purchase.status.unpaid', cultivation_rotavator: 'sales.cultivationRotavator', 'Cultivation Rotavator': 'sales.cultivationRotavator', cultivation_cultivator: 'sales.cultivationCultivator', 'Cultivation Cultivator': 'sales.cultivationCultivator', boulders: 'sales.boulders', Boulders: 'sales.boulders', gravel: 'sales.gravel', Gravel: 'sales.gravel', soil: 'sales.soil', Soil: 'sales.soil', sand: 'sales.sand', Sand: 'sales.sand', puddling: 'sales.puddling', Puddling: 'sales.puddling', excavation: 'sales.excavation', Excavation: 'sales.excavation', paral: 'sales.paral', Paral: 'sales.paral', dhan: 'sales.dhan', Dhan: 'sales.dhan', others: 'sales.others', Others: 'sales.others', cash: 'option.cash', 'mobile banking': 'option.mobileBanking', cheque: 'option.cheque', tip: 'option.tip', hours: 'option.hours', cubemeter: 'option.cubemeter', Monthly: 'option.monthly', Daily: 'option.daily', salary: 'option.salary', bhatta: 'option.bhatta' };
export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('kds-language') === 'np' ? 'np' : 'en');
  const { t: translate } = useTranslation();
  const value = useMemo(() => ({
    language,
    setLanguage: (next) => { const selected = next === 'np' ? 'np' : 'en'; localStorage.setItem('kds-language', selected); document.documentElement.lang = selected; i18n.changeLanguage(selected); setLanguage(selected); },
    t: (key, options = {}) => translate(key, { defaultValue: key, ...options }),
    option: (value) => { const aliases = { private: 'Private', governmental: 'Governmental', ngo: 'NGO' }; const key = optionKeys[value] || optionKeys[aliases[value]]; return key ? translate(key, { defaultValue: value }) : value; }
  }), [language, translate]);
  document.documentElement.lang = language;
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useI18n() { return useContext(LocaleContext) || { language: 'en', setLanguage: () => {}, t: (key) => key, option: (value) => value }; }
