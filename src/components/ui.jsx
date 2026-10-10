import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { IDIOMAS } from '../lib/paises';

export function Cargando() {
  const { t } = useI18n();
  return (
    <div className="centro" role="status">
      <div className="spinner" aria-hidden="true" />
      <p className="suave">{t('common.loading')}</p>
    </div>
  );
}

export function Aviso({ tipo = 'ok', children }) {
  if (!children) return null;
  return (
    <p className={`aviso ${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

export function Campo({ etiqueta, ayuda, children }) {
  return (
    <label className="campo">
      <span className="etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  );
}

// Cambia el idioma de la pantalla y, si hay sesión, lo guarda en el perfil.
export function SelectorIdioma() {
  const { lang, setLang, t } = useI18n();
  const { perfil } = useAuth();

  const cambiar = async (e) => {
    const nuevo = e.target.value;
    setLang(nuevo);
    if (perfil?.id) {
      try {
        await updateDoc(doc(db, 'usuarios', perfil.id), { idioma: nuevo });
      } catch {
        /* si falla, igual queda en este dispositivo */
      }
    }
  };

  return (
    <select className="idioma" value={lang} onChange={cambiar} aria-label="Idioma / Language">
      {IDIOMAS.map((l) => (
        <option key={l} value={l}>
          {t(`lang.${l}`)}
        </option>
      ))}
    </select>
  );
}

// Reemplaza {terminos} y {privacidad} de un texto por enlaces.
function conEnlaces(texto, enlaces) {
  return texto.split(/(\{terminos\}|\{privacidad\})/).map((parte, i) => {
    if (parte === '{terminos}') return <span key={i}>{enlaces.terminos}</span>;
    if (parte === '{privacidad}') return <span key={i}>{enlaces.privacidad}</span>;
    return parte;
  });
}

const enlacesLegales = (t) => ({
  terminos: (
    <a href="/terminos" target="_blank" rel="noreferrer">
      {t('legal.terms')}
    </a>
  ),
  privacidad: (
    <a href="/privacidad" target="_blank" rel="noreferrer">
      {t('legal.privacy')}
    </a>
  ),
});

// Casilla obligatoria de aceptación.
export function CasillaTerminos({ valor, onChange }) {
  const { t } = useI18n();
  return (
    <label className="fila casilla">
      <input type="checkbox" checked={valor} onChange={(e) => onChange(e.target.checked)} required />
      <span>{conEnlaces(t('legal.accept'), enlacesLegales(t))}</span>
    </label>
  );
}

// Aviso de aceptación implícita (pantalla de registro).
export function AvisoTerminos() {
  const { t } = useI18n();
  return <p className="suave aviso-legal">{conEnlaces(t('legal.signupNotice'), enlacesLegales(t))}</p>;
}

export function PieLegal() {
  const { t } = useI18n();
  return (
    <p className="suave pie-legal">
      <a href="/terminos" target="_blank" rel="noreferrer">
        {t('legal.terms')}
      </a>
      {' · '}
      <a href="/privacidad" target="_blank" rel="noreferrer">
        {t('legal.privacy')}
      </a>
    </p>
  );
}

export function useCopiar() {
  const { t } = useI18n();
  const [copiado, setCopiado] = useState('');
  const copiar = async (clave, texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(''), 1800);
    } catch {
      window.prompt(t('common.copy'), texto);
    }
  };
  return { copiado, copiar };
}
