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
import { Aviso, Campo, SelectorIdioma } from '../components/ui';

export default function Login() {
  const { t, lang } = useI18n();
  const [modo, setModo] = useState('login'); // login | signup | reset
  const [nombre, setNombre] = useState('');
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
      if (modo === 'login') {
        await signInWithEmailAndPassword(auth, correo, clave);
      } else if (modo === 'signup') {
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
        <h2>{modo === 'signup' ? t('auth.signup') : modo === 'reset' ? t('auth.forgot') : t('auth.login')}</h2>

        {modo === 'signup' && (
          <Campo etiqueta={t('auth.name')}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="name" />
          </Campo>
        )}

        <Campo etiqueta={t('auth.email')}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </Campo>

        {modo !== 'reset' && (
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
          {modo !== 'login' && (
            <button type="button" className="boton texto" onClick={() => cambiar('login')}>
              {t('auth.haveAccount')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
