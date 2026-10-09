import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { IDIOMAS, ZONAS, soloDigitos } from '../lib/paises';
import { reducirImagen } from '../lib/imagen';
import { Aviso, Campo } from '../components/ui';

export default function Ajustes() {
  const { perfil, empresa } = useAuth();
  const { t } = useI18n();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  return (
    <>
      <h1>{t('settings.title')}</h1>
      {esGestor && empresa && <DatosNegocio empresa={empresa} />}
      <MiCuenta perfil={perfil} />
    </>
  );
}

function DatosNegocio({ empresa }) {
  const { t } = useI18n();
  const [nombre, setNombre] = useState(empresa.nombre || '');
  const [whatsapp, setWhatsapp] = useState(empresa.whatsapp || '');
  const [color, setColor] = useState(empresa.marca?.colorPrimario || '#8a3b5c');
  const [idioma, setIdioma] = useState(empresa.idiomaDefecto || 'es');
  const [zona, setZona] = useState(empresa.zonaHoraria || ZONAS[0]);
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const falla = (e) =>
    setMensaje({ tipo: 'error', texto: e?.code === 'permission-denied' ? t('common.permission') : t('common.error') });

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      await updateDoc(doc(db, 'empresas', empresa.id), {
        nombre: nombre.trim(),
        whatsapp: soloDigitos(whatsapp),
        idiomaDefecto: idioma,
        zonaHoraria: zona,
        marca: { ...empresa.marca, colorPrimario: color },
      });
      setMensaje({ tipo: 'ok', texto: t('settings.saved') });
    } catch (e) {
      falla(e);
    } finally {
      setOcupado(false);
    }
  };

  // El logo se achica en el celular antes de subirlo, para cuidar el almacenamiento.
  const subirLogo = async (ev) => {
    const archivo = ev.target.files?.[0];
    if (!archivo) return;
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      const blob = await reducirImagen(archivo, 512);
      const destino = ref(storage, `empresas/${empresa.id}/marca/logo.webp`);
      await uploadBytes(destino, blob, { contentType: 'image/webp' });
      const url = await getDownloadURL(destino);
      await updateDoc(doc(db, 'empresas', empresa.id), { marca: { ...empresa.marca, logoUrl: url } });
      setMensaje({ tipo: 'ok', texto: t('settings.logoSaved') });
    } catch (e) {
      falla(e);
    } finally {
      setOcupado(false);
      ev.target.value = '';
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <h2>{t('settings.business')}</h2>

      <Campo etiqueta={t('settings.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>

      <Campo etiqueta={t('settings.whatsapp')} ayuda={t('settings.whatsappHint')}>
        <input inputMode="numeric" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="59899123456" />
      </Campo>

      <Campo etiqueta={t('settings.brandColor')}>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      </Campo>

      <Campo etiqueta={t('settings.logo')}>
        <div className="fila">
          {empresa.marca?.logoUrl && <img src={empresa.marca.logoUrl} alt="" className="logo grande" />}
          <label className="boton secundario">
            {t('settings.logoUpload')}
            <input type="file" accept="image/*" hidden onChange={subirLogo} disabled={ocupado} />
          </label>
        </div>
      </Campo>

      <Campo etiqueta={t('settings.defaultLanguage')}>
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
          {IDIOMAS.map((l) => (
            <option key={l} value={l}>
              {t(`lang.${l}`)}
            </option>
          ))}
        </select>
      </Campo>

      <Campo etiqueta={t('settings.timezone')}>
        <select value={zona} onChange={(e) => setZona(e.target.value)}>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </Campo>

      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      <button className="boton" disabled={ocupado}>
        {t('common.save')}
      </button>
    </form>
  );
}

function MiCuenta({ perfil }) {
  const { t, lang, setLang } = useI18n();
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [idioma, setIdioma] = useState(perfil.idioma || lang);
  const [mensaje, setMensaje] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMensaje({ tipo: 'ok', texto: '' });
    try {
      await updateDoc(doc(db, 'usuarios', perfil.id), { nombre: nombre.trim(), idioma });
      setLang(idioma);
      setMensaje({ tipo: 'ok', texto: t('settings.saved') });
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e?.code === 'permission-denied' ? t('common.permission') : t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <h2>{t('settings.me')}</h2>
      <Campo etiqueta={t('settings.myName')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>
      <Campo etiqueta={t('settings.myLanguage')}>
        <select value={idioma} onChange={(e) => setIdioma(e.target.value)}>
          {IDIOMAS.map((l) => (
            <option key={l} value={l}>
              {t(`lang.${l}`)}
            </option>
          ))}
        </select>
      </Campo>
      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>
      <button className="boton" disabled={ocupado}>
        {t('common.save')}
      </button>
    </form>
  );
}
