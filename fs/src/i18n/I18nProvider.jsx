import { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n.js';
import en from './en.json';

const LocaleContext = createContext(null);

const optionKeys = {
  Private: 'customer.type.private',
  Governmental: 'customer.type.governmental',
  NGO: 'customer.type.ngo',
  Tractor: 'vehicle.tractor',
  JCB: 'vehicle.jcb',
  Tipper: 'vehicle.tipper',
  'Unallocated / General': 'vehicle.unallocated',
  None: 'option.none',
  none: 'option.none',
  Active: 'staff.active',
  Inactive: 'staff.inactive',
  'Tractor Driver': 'staff.tractorDriver',
  'JCB Operator': 'staff.jcbOperator',
  'Tipper Driver': 'staff.tipperDriver',
  Helper: 'staff.helper',
  Accountant: 'staff.accountant',
  Manager: 'staff.manager',
  Other: 'staff.other',
  'Partially Paid': 'purchase.status.partial',
  Paid: 'purchase.status.paid',
  Unpaid: 'purchase.status.unpaid',
  paid: 'purchase.status.paid',
  partial: 'purchase.status.partial',
  unpaid: 'purchase.status.unpaid',
  cultivation_rotavator: 'sales.cultivationRotavator',
  'Cultivation Rotavator': 'sales.cultivationRotavator',
  cultivation_cultivator: 'sales.cultivationCultivator',
  'Cultivation Cultivator': 'sales.cultivationCultivator',
  boulders: 'sales.boulders',
  Boulders: 'sales.boulders',
  gravel: 'sales.gravel',
  Gravel: 'sales.gravel',
  soil: 'sales.soil',
  Soil: 'sales.soil',
  sand: 'sales.sand',
  Sand: 'sales.sand',
  puddling: 'sales.puddling',
  Puddling: 'sales.puddling',
  excavation: 'sales.excavation',
  Excavation: 'sales.excavation',
  paral: 'sales.paral',
  Paral: 'sales.paral',
  dhan: 'sales.dhan',
  Dhan: 'sales.dhan',
  others: 'sales.others',
  Others: 'sales.others',
  cash: 'option.cash',
  'mobile banking': 'option.mobileBanking',
  cheque: 'option.cheque',
  'bank transfer': 'option.bankTransfer',
  tip: 'unit.trips',
  hours: 'unit.hours',
  cubemeter: 'unit.cubicMeter',
  'Cubic Meter': 'unit.cubicMeter',
  'Hours': 'unit.hours',
  'Kilograms (Kgs)': 'unit.kgs',
  'Trips': 'unit.trips',
  Monthly: 'option.monthly',
  Daily: 'option.daily',
  salary: 'option.salary',
  bhatta: 'option.bhatta',
  Fuel: 'purchase.title.fuel',
  'Mobil (oil)': 'purchase.title.mobil',
  Parts: 'purchase.title.parts',
  Citizenship: 'staff.idProof.citizenship',
  Passport: 'staff.idProof.passport',
  'Driving License': 'staff.idProof.drivingLicense',
  'National ID': 'staff.idProof.nationalId',
  operator: 'admin.operator',
  admin: 'admin.admin'
};

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('kds-language') === 'np' ? 'np' : 'en'));
  const { t: translate } = useTranslation();

  const value = useMemo(() => ({
    language,
    setLanguage: (next) => {
      const selected = next === 'np' ? 'np' : 'en';
      localStorage.setItem('kds-language', selected);
      document.documentElement.lang = selected;
      i18n.changeLanguage(selected);
      setLanguage(selected);
    },
    t: (key, options = {}) => {
      if (!key) return '';
      let result = translate(key, options);
      if (result === key || result === undefined) {
        if (en[key] !== undefined) {
          result = en[key];
        } else {
          if (import.meta.env?.DEV) {
            console.warn(`[i18n] Missing translation key: "${key}"`);
          }
          result = options.defaultValue || key.split('.').pop().replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
        }
      }
      return result;
    },
    option: (val) => {
      if (val == null) return '';
      const aliases = { private: 'Private', governmental: 'Governmental', ngo: 'NGO' };
      const key = optionKeys[val] || optionKeys[aliases[val]];
      return key ? translate(key, { defaultValue: val }) : val;
    }
  }), [language, translate]);

  document.documentElement.lang = language;
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext) || {
    language: 'en',
    setLanguage: () => {},
    t: (key, options) => en[key] || options?.defaultValue || key,
    option: (value) => value
  };
}
