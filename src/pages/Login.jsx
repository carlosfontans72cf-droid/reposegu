import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import { useI18n } from '../i18n';
import { credencialesDeAcceso, esEmailAcceso, formatearCodigo } from '../lib/acceso.js';
import { Aviso, AvisoTerminos, Campo, PieLegal, SelectorIdioma } from '../components/ui';

export default function Login() {
  const { t, lang } = useI18n();
  // El enlace que se manda por WhatsApp abre directo "entrar con código" con el nombre cargado.
  const params = new URLSearchParams(window.location.search);
  const guardado = (() => {
    try {
      return localStorage.getItem('modoLogin');
    } catch {
      return null;
    }
  })();
  const [modo, setModo] = useState(params.get('acceso') || guardado === 'codigo' ? 'codigo' : 'login'); // login | codigo | signup | reset
  const [nombre, setNombre] = useState(params.get('n') || '');
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);

  const mensajeError = (e) => {
    const clave = `auth.err.${String(e?.code || '').replace('auth/', '')}`;
    const texto = t(clave);
    return texto === clave ? t('common.error') : texto;
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    setError('');
    setOk('');
    setEnviando(true);
    try {
      auth.languageCode = lang; // los emails de Firebase salen en el idioma elegido
      const correo = email.trim();
      if (modo === 'codigo') {
        const cred = credencialesDeAcceso(nombre, codigo);
        if (!cred) {
          setError(t('access.login.error'));
          return;
        }
        try {
          await signInWithEmailAndPassword(auth, cred.email, cred.clave);
          try {
            localStorage.setItem('modoLogin', 'codigo');
          } catch {
            /* sin almacenamiento: no se recuerda */
          }
        } catch (e) {
          const c = e?.code || '';
          setError(
            c === 'auth/invalid-credential' || c === 'auth/user-not-found' || c === 'auth/wrong-password'
              ? t('access.login.error')
              : mensajeError(e),
          );
        }
      } else if (modo === 'login') {
        await signInWithEmailAndPassword(auth, correo, clave);
        try {
          localStorage.setItem('modoLogin', 'login');
        } catch {
          /* sin almacenamiento: no se recuerda */
        }
      } else if (modo === 'signup') {
        if (esEmailAcceso(correo)) {
          setError(t('auth.err.invalid-email'));
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, correo, clave);
        await updateProfile(cred.user, { displayName: nombre.trim() });
        await sendEmailVerification(cred.user);
      } else {
        await sendPasswordResetEmail(auth, correo);
        setOk(t('auth.resetSent'));
      }
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const cambiar = (nuevo) => {
    setModo(nuevo);
    setError('');
    setOk('');
  };

  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <form className="tarjeta formulario" onSubmit={enviar}>
        <h1>{t('app.name')}</h1>
        {(modo === 'login' || modo === 'codigo') && (
          <div className="pestanas" role="tablist">
            <button type="button" role="tab" aria-selected={modo === 'login'} className={modo === 'login' ? 'activa' : ''} onClick={() => cambiar('login')}>
              {t('access.tab.email')}
            </button>
            <button type="button" role="tab" aria-selected={modo === 'codigo'} className={modo === 'codigo' ? 'activa' : ''} onClick={() => cambiar('codigo')}>
              {t('access.tab.code')}
            </button>
          </div>
        )}
        <h2>
          {modo === 'codigo' ? t('access.login.title') : modo === 'signup' ? t('auth.signup') : modo === 'reset' ? t('auth.forgot') : t('auth.login')}
        </h2>

        {modo === 'codigo' && (
          <>
            <p className="suave">{t('access.login.help')}</p>
            <Campo etiqueta={t('access.login.name')}>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="username" maxLength={80} />
            </Campo>
            <Campo etiqueta={t('access.login.code')}>
              <input
                value={codigo}
                onChange={(e) => setCodigo(formatearCodigo(e.target.value).slice(0, 11))}
                required
                autoComplete="current-password"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                placeholder="ABCD-EFGHJK"
              />
            </Campo>
          </>
        )}

        {modo === 'signup' && (
          <Campo etiqueta={t('auth.name')}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="name" />
          </Campo>
        )}

        {modo !== 'codigo' && (
          <Campo etiqueta={t('auth.email')}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Campo>
        )}

        {modo !== 'reset' && modo !== 'codigo' && (
          <Campo etiqueta={t('auth.password')} ayuda={modo === 'signup' ? t('auth.passwordHint') : undefined}>
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              minLength={modo === 'signup' ? 8 : undefined}
              autoComplete={modo === 'signup' ? 'new-password' : 'current-password'}
            />
          </Campo>
        )}

        {modo === 'signup' && <AvisoTerminos />}
        <Aviso tipo="error">{error}</Aviso>
        <Aviso>{ok}</Aviso>

        <button className="boton" disabled={enviando}>
          {modo === 'signup' ? t('auth.signup') : modo === 'reset' ? t('common.save') : t('auth.login')}
        </button>

        <div className="enlaces">
          {modo === 'login' && (
            <>
              <button type="button" className="boton texto" onClick={() => cambiar('signup')}>
                {t('auth.noAccount')}
              </button>
              <button type="button" className="boton texto" onClick={() => cambiar('reset')}>
                {t('auth.forgot')}
              </button>
            </>
          )}
          {(modo === 'signup' || modo === 'reset') && (
            <button type="button" className="boton texto" onClick={() => cambiar('login')}>
              {t('auth.haveAccount')}
            </button>
          )}
        </div>
        <PieLegal />
      </form>
    </div>
  );
}
