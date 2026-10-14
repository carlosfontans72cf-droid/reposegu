import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import es from './es';
import pt from './pt';
import en from './en';
import pastelEs from './pastel.es';
import pastelPt from './pastel.pt';
import pastelEn from './pastel.en';
import accEs from './acceso.es';
import accPt from './acceso.pt';
import accEn from './acceso.en';
import segEs from './seg.es';
import segPt from './seg.pt';
import segEn from './seg.en';

const DICT = {
  es: { ...es, ...pastelEs, ...segEs, ...accEs },
  pt: { ...pt, ...pastelPt, ...segPt, ...accPt },
  en: { ...en, ...pastelEn, ...segEn, ...accEn },
};
const CLAVE = 'idioma';

function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado && DICT[guardado]) return guardado;
  } catch {
    /* sin almacenamiento local: se usa el del navegador */
  }
  const nav = (navigator.language || 'es').slice(0, 2);
  return DICT[nav] ? nav : 'es';
}

const Ctx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(idiomaInicial);

  const setLang = useCallback((l) => {
    if (!DICT[l]) return;
    setLangState(l);
    document.documentElement.lang = l;
    try {
      localStorage.setItem(CLAVE, l);
    } catch {
      /* ignorar */
    }
  }, []);

  const t = useCallback(
    (clave, vars) => {
      let s = DICT[lang][clave] ?? DICT.es[clave] ?? clave;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
      return s;
    },
    [lang],
  );

  const fecha = useCallback(
    (d) => (d ? new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(d) : '—'),
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, fecha }), [lang, setLang, t, fecha]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
