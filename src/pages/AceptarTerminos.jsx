import { useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { TERMINOS_VERSION } from '../legal/index.js';
import { Aviso, CasillaTerminos, SelectorIdioma } from '../components/ui';

// Para cuentas que todavía no aceptaron la versión vigente de los términos.
export default function AceptarTerminos() {
  const { perfil, salir } = useAuth();
  const { t } = useI18n();
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const continuar = async () => {
    setOcupado(true);
    setError('');
    try {
      await updateDoc(doc(db, 'usuarios', perfil.id), { terminosVersion: TERMINOS_VERSION, terminosEn: serverTimestamp() });
    } catch {
      setError(t('common.error'));
      setOcupado(false);
    }
  };

  return (
    <div className="pantalla">
      <div className="selector-flotante">
        <SelectorIdioma />
      </div>
      <section className="tarjeta formulario">
        <h1>{t('legal.updatedTitle')}</h1>
        <p>{t('legal.updatedText')}</p>
        <CasillaTerminos valor={acepto} onChange={setAcepto} />
        <Aviso tipo="error">{error}</Aviso>
        <button className="boton" onClick={continuar} disabled={!acepto || ocupado}>
          {t('legal.continue')}
        </button>
        <button type="button" className="boton texto" onClick={salir}>
          {t('common.logout')}
        </button>
      </section>
    </div>
  );
}
