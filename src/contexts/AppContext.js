'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { getTranslation, t as translate, getLocalizedField } from '@/lib/i18n';

const AppContext = createContext(null);

const initialState = {
  language: 'en',
  selectedState: null,
  selectedService: null,
  user: null,
  isAuthenticated: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LANGUAGE':
      if (typeof window !== 'undefined') {
        localStorage.setItem('dlf_language', action.payload);
      }
      return { ...state, language: action.payload };
    case 'SET_STATE':
      if (typeof window !== 'undefined') {
        localStorage.setItem('dlf_selected_state', JSON.stringify(action.payload));
      }
      return { ...state, selectedState: action.payload };
    case 'SET_SERVICE':
      return { ...state, selectedService: action.payload };
    case 'SET_USER':
      if (typeof window !== 'undefined' && action.payload) {
        localStorage.setItem('dlf_user', JSON.stringify(action.payload));
      }
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'LOGOUT':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dlf_user');
      }
      return { ...state, user: null, isAuthenticated: false };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children, initialLang = 'en' }) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    language: initialLang || 'en',
  });

  // Synchronize document language and cookie from state in an effect
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = state.language;
      document.cookie = `dlf_lang=${state.language}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [state.language]);

  useEffect(() => {
    const savedLang = localStorage.getItem('dlf_language') || initialLang || 'en';
    const savedState = localStorage.getItem('dlf_selected_state');
    const savedUser = localStorage.getItem('dlf_user');

    dispatch({
      type: 'HYDRATE',
      payload: {
        language: savedLang,
        selectedState: savedState ? JSON.parse(savedState) : null,
        user: savedUser ? JSON.parse(savedUser) : null,
        isAuthenticated: !!savedUser,
      }
    });
  }, [initialLang]);

  const t = (path, params) => translate(state.language, path, params);
  const localize = (item, field) => getLocalizedField(item, field, state.language);

  return (
    <AppContext.Provider value={{ state, dispatch, t, localize }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
