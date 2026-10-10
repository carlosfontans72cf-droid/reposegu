import { useState } from 'react';
import { collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { useDinero } from '../lib/formato';
import { aNumero } from '../lib/costos';
import { Aviso, Campo, Cargando } from '../components/ui';

// Zonas de envío: cuánto se le cobra al cliente y cuánto cuesta realmente el traslado.
export default function Zonas() {
  const { zonas, cargando } = useDatos();
  const { t } = useI18n();
  const [editando, setEditando] = useState(null); // null | 'nueva' | id

  if (cargando) return <Cargando />;
  return (
    <>
      <div className="encabezado">
        <h1>{t('zone.title')}</h1>
        <button type="button" className="boton" onClick={() => setEditando(editando ? null : 'nueva')}>
          {editando ? t('common.cancel') : t('zone.new')}
        </button>
      </div>
      <p className="suave">{t('zone.help')}</p>
      {editando === 'nueva' && <FormZona onListo={() => setEditando(null)} />}
      {zonas.length === 0 && editando !== 'nueva' && <p className="suave">{t('zone.empty')}</p>}
      {[...zonas]
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map((z) => (
          <FilaZona key={z.id} zona={z} editando={editando === z.id} onEditar={(v) => setEditando(v ? z.id : null)} />
        ))}
    </>
  );
}

function FilaZona({ zona, editando, onEditar }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const dinero = useDinero();
  const [msg, setMsg] = useState('');

  const borrar = async () => {
    if (!window.confirm(t('common.confirmDelete', { nombre: zona.nombre }))) return;
    try {
      await deleteDoc(doc(db, 'empresas', empresa.id, 'zonas', zona.id));
    } catch {
      setMsg(t('common.error'));
    }
  };

  if (editando) return <FormZona zona={zona} onListo={() => onEditar(false)} />;
  return (
    <section className="tarjeta">
      <div className="dato">
        <div>
          <strong>{zona.nombre}</strong>
          <div className="suave">
            {t('zone.charged')}: {dinero(zona.tarifa)} · {t('zone.realCost')}: {dinero(zona.costoReal)}
          </div>
        </div>
        <div className="fila">
          <button type="button" className="boton secundario" onClick={() => onEditar(true)}>
            {t('common.edit')}
          </button>
          <button type="button" className="boton texto peligro" onClick={borrar}>
            {t('common.delete')}
          </button>
        </div>
      </div>
      <Aviso tipo="error">{msg}</Aviso>
    </section>
  );
}

function FormZona({ zona, onListo }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [nombre, setNombre] = useState(zona?.nombre || '');
  const [tarifa, setTarifa] = useState(String(zona?.tarifa ?? ''));
  const [costoReal, setCostoReal] = useState(String(zona?.costoReal ?? ''));
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg('');
    try {
      const datos = { nombre: nombre.trim(), tarifa: Math.max(aNumero(tarifa), 0), costoReal: Math.max(aNumero(costoReal), 0) };
      if (zona) await updateDoc(doc(db, 'empresas', empresa.id, 'zonas', zona.id), datos);
      else await setDoc(doc(collection(db, 'empresas', empresa.id, 'zonas')), { ...datos, creadoEn: serverTimestamp() });
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('zone.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={60} />
      </Campo>
      <div className="dos">
        <Campo etiqueta={t('zone.charged')} ayuda={t('zone.chargedHint')}>
          <input inputMode="decimal" value={tarifa} onChange={(e) => setTarifa(e.target.value)} required />
        </Campo>
        <Campo etiqueta={t('zone.realCost')} ayuda={t('zone.realCostHint')}>
          <input inputMode="decimal" value={costoReal} onChange={(e) => setCostoReal(e.target.value)} />
        </Campo>
      </div>
      <Aviso tipo="error">{msg}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        {zona && (
          <button type="button" className="boton secundario" onClick={onListo}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
