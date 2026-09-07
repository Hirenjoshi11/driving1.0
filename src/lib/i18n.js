import en from './translations/en.json';
import hi from './translations/hi.json';
import gu from './translations/gu.json';

const translations = { en, hi, gu };

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
];

export function getTranslation(lang = 'en') {
  return translations[lang] || translations.en;
}

export function t(lang, path, params = {}) {
  const trans = getTranslation(lang);
  const keys = path.split('.');
  let result = trans;
  let found = true;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      found = false;
      break;
    }
  }

  if (!found || typeof result !== 'string') {
    // Fallback to English
    let fallback = translations.en;
    let fallbackFound = true;
    for (const k of keys) {
      if (fallback && typeof fallback === 'object' && k in fallback) {
        fallback = fallback[k];
      } else {
        fallbackFound = false;
        break;
      }
    }
    result = fallbackFound && typeof fallback === 'string' ? fallback : path;
  }

  if (typeof result === 'string' && params && typeof params === 'object') {
    return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
      return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }, result);
  }

  return result;
}

export function getLocalizedField(item, field, lang) {
  if (!item) return '';
  if (lang === 'hi' && item[`${field}_hi`]) return item[`${field}_hi`];
  if (lang === 'gu' && item[`${field}_gu`]) return item[`${field}_gu`];
  return item[field] || '';
}
