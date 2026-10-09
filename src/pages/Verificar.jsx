import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { Aviso, SelectorIdioma } from '../components/ui';

export default function Verificar() {
  const { user, refrescarUsuario, salir } = useAuth();
  const { t, lang } = useI18n();
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const reenviar = async () => {
    setOcupado(true);
    try {
      auth.languageCode = lang;
      await sendEmailVerification(auth.currentUser);
      setMensaje({ tipo: 'ok', texto: t('verify.sent') });
    } catch (e) {
      const clave = `auth.err.${String(e?.code || '').replace('auth/', '')}`;
      const texto = t(clave);
      setMensaje({ tipo: 'error', texto: texto === clave ? t('common.error') : texto });
    } finally {
      setOcupado(false);
    }
  };

  const confirmar = async () => {
    setOcupado(true);
    try {
      const listo = await refrescarUsuario();
      if (!listo) setMensaje({ tipo: 'error', texto: t('verify.notYet') });
    } catch {
      setMensaje({ tipo: 'error', texto: t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <section className="tarjeta formulario">
        <h1>{t('verify.title')}</h1>
        <p>{t('verify.text', { email: user?.email || '' })}</p>
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
        <button className="boton" onClick={confirmar} disabled={ocupado}>
          {t('verify.done')}
        </button>
        <button className="boton secundario" onClick={reenviar} disabled={ocupado}>
          {t('verify.resend')}
        </button>
        <button className="boton texto" onClick={salir}>
          {t('common.logout')}
        </button>
      </section>
    </div>
  );
}
