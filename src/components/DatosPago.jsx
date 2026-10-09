import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useI18n } from '../i18n';
import { enlaceWhatsapp } from '../lib/paises';
import { useCopiar } from './ui';

// Botones de cobro manual: cada uno copia los datos para pegarlos en la app del banco,
// y el último abre WhatsApp para mandar el comprobante.
export default function DatosPago({ empresa }) {
  const { t } = useI18n();
  const { copiado, copiar } = useCopiar();
  const [cobro, setCobro] = useState(undefined);

  useEffect(() => {
    let vivo = true;
    getDoc(doc(db, 'plataforma', 'cobro'))
      .then((s) => vivo && setCobro(s.exists() ? s.data() : null))
      .catch(() => vivo && setCobro(null));
    return () => {
      vivo = false;
    };
  }, []);

  if (cobro === undefined) return null;

  const opciones = [
    { clave: 'pix', etiqueta: t('pay.pixBR'), boton: t('pay.copyPix'), texto: cobro?.pixBR },
    { clave: 'uy', etiqueta: t('pay.accountUY'), boton: t('pay.copyData'), texto: cobro?.cuentaUY },
    { clave: 'br', etiqueta: t('pay.accountBR'), boton: t('pay.copyData'), texto: cobro?.cuentaBR },
  ].filter((o) => o.texto);
  // Brasil ve primero Pix; el resto, la cuenta de Uruguay.
  if (empresa?.pais !== 'BR') opciones.sort((a, b) => (a.clave === 'uy' ? -1 : b.clave === 'uy' ? 1 : 0));

  const plan = t(`plan.${empresa?.plan === 'anual' ? 'anual' : 'mensual'}`);
  const mensaje = t('pay.proofText', { empresa: empresa?.nombre || '', plan });
  // Un botón de WhatsApp por país; el de la empresa va primero.
  // `whatsapp` es el campo viejo (un solo número) y queda como respaldo.
  const whatsapps = ['UY', 'BR', 'AR']
    .map((pais) => ({ pais, numero: cobro?.[`whatsapp${pais}`] }))
    .filter((w) => w.numero);
  if (whatsapps.length === 0 && cobro?.whatsapp) whatsapps.push({ pais: null, numero: cobro.whatsapp });
  whatsapps.sort((a, b) => (b.pais === empresa?.pais) - (a.pais === empresa?.pais));

  return (
    <section className="tarjeta">
      <h2>{t('pay.title')}</h2>
      <p className="suave">{t('pay.plans', { m: cobro?.precioMensual ?? 20, a: cobro?.precioAnual ?? 120 })}</p>

      {opciones.length === 0 && <p className="suave">{t('pay.none')}</p>}

      {opciones.map((o) => (
        <div key={o.clave} className="dato">
          <div>
            <span className="etiqueta">{o.etiqueta}</span>
            <pre className="texto-cuenta">{o.texto}</pre>
          </div>
          <button type="button" className="boton secundario" onClick={() => copiar(o.clave, o.texto)}>
            {copiado === o.clave ? t('common.copied') : o.boton}
          </button>
        </div>
      ))}

      {whatsapps.length > 0 && (
        <div className="columna-botones">
          {whatsapps.map((w) => (
            <a key={w.pais || 'unico'} className="boton" href={enlaceWhatsapp(w.numero, mensaje)} target="_blank" rel="noreferrer">
              {w.pais ? t('pay.sendProofTo', { pais: t(`country.${w.pais}`) }) : t('pay.sendProof')}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
