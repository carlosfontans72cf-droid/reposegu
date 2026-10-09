import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useI18n } from '../i18n';
import { soloDigitos } from '../lib/paises';
import { Aviso, Campo, Cargando } from '../components/ui';

const VACIO = { whatsappUY: '', whatsappBR: '', whatsappAR: '', cuentaUY: '', cuentaBR: '', pixBR: '', precioMensual: 20, precioAnual: 120 };

// Datos de cobro que ven las empresas en los botones de pago.
export default function Cobro() {
  const { t } = useI18n();
  const [datos, setDatos] = useState(undefined);
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let vivo = true;
    getDoc(doc(db, 'plataforma', 'cobro'))
      .then((s) => vivo && setDatos({ ...VACIO, ...(s.exists() ? s.data() : {}) }))
      .catch(() => vivo && setDatos(VACIO));
    return () => {
      vivo = false;
    };
  }, []);

  if (!datos) return <Cargando />;

  const cambiar = (campo) => (ev) => setDatos({ ...datos, [campo]: ev.target.value });

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      await setDoc(doc(db, 'plataforma', 'cobro'), {
        whatsappUY: soloDigitos(datos.whatsappUY),
        whatsappBR: soloDigitos(datos.whatsappBR),
        whatsappAR: soloDigitos(datos.whatsappAR),
        cuentaUY: datos.cuentaUY.trim(),
        cuentaBR: datos.cuentaBR.trim(),
        pixBR: datos.pixBR.trim(),
        precioMensual: Number(datos.precioMensual),
        precioAnual: Number(datos.precioAnual),
      });
      setMensaje({ tipo: 'ok', texto: t('admin.saved') });
    } catch {
      setMensaje({ tipo: 'error', texto: t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <h1>{t('nav.billing')}</h1>
      <p className="suave">{t('admin.billingIntro')}</p>
      <form className="tarjeta formulario" onSubmit={guardar}>
        {[
          ['UY', '59895205598'],
          ['BR', '5553999265575'],
          ['AR', '5491171827254'],
        ].map(([pais, ejemplo]) => (
          <Campo key={pais} etiqueta={t('admin.whatsappCountry', { pais: t(`country.${pais}`) })}>
            <input inputMode="numeric" value={datos[`whatsapp${pais}`]} onChange={cambiar(`whatsapp${pais}`)} placeholder={ejemplo} />
          </Campo>
        ))}
        <Campo etiqueta={t('admin.accountUY')}>
          <textarea rows={4} value={datos.cuentaUY} onChange={cambiar('cuentaUY')} />
        </Campo>
        <Campo etiqueta={t('admin.accountBR')}>
          <textarea rows={4} value={datos.cuentaBR} onChange={cambiar('cuentaBR')} />
        </Campo>
        <Campo etiqueta={t('admin.pixBR')}>
          <input value={datos.pixBR} onChange={cambiar('pixBR')} />
        </Campo>
        <div className="dos">
          <Campo etiqueta={t('admin.priceMonthly')}>
            <input type="number" min="0" step="0.01" value={datos.precioMensual} onChange={cambiar('precioMensual')} required />
          </Campo>
          <Campo etiqueta={t('admin.priceYearly')}>
            <input type="number" min="0" step="0.01" value={datos.precioAnual} onChange={cambiar('precioAnual')} required />
          </Campo>
        </div>
        <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
      </form>
    </>
  );
}
