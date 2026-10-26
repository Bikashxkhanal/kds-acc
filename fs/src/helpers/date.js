import { formatBS } from '../utils/bsDate.js';

const getCurrentTime = (language = 'en') => `${formatBS(new Date(), 'long', language)} · ${new Intl.DateTimeFormat(language === 'np' ? 'ne-NP' : 'en-NP', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())}`;

export {getCurrentTime}
