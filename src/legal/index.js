import es from './es.js';
import pt from './pt.js';
import en from './en.js';

// Versión de los textos legales. Si cambian de forma relevante, se sube este valor
// y a todas las personas se les pide aceptar de nuevo al entrar.
export const TERMINOS_VERSION = '2026-10-14';

// Datos que aparecen en los textos. Se pueden cambiar acá sin tocar el resto.
export const LEGAL = {
  titular: 'Carlos Fontans',
  jurisdiccion: {
    es: 'la República Oriental del Uruguay',
    pt: 'a República Oriental do Uruguai',
    en: 'the Oriental Republic of Uruguay',
  },
  foro: {
    es: 'la ciudad de Montevideo, Uruguay',
    pt: 'a cidade de Montevidéu, Uruguai',
    en: 'the city of Montevideo, Uruguay',
  },
};

const TEXTOS = { es, pt, en };

export function contenidoLegal(lang) {
  const idioma = TEXTOS[lang] ? lang : 'es';
  return TEXTOS[idioma]({
    version: TERMINOS_VERSION,
    titular: LEGAL.titular,
    jurisdiccion: LEGAL.jurisdiccion[idioma],
    foro: LEGAL.foro[idioma],
  });
}
