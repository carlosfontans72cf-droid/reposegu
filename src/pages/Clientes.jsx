import { useMemo, useState } from 'react';
import { collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { clave } from '../lib/importar';
import { enlaceWhatsapp, soloDigitos } from '../lib/paises';
import { Aviso, Campo, Cargando } from '../components/ui';

export default function Clientes() {
  const { perfil } = useAuth();
  const { clientes, cargando } = useDatos();
  const { t } = useI18n();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [buscar, setBuscar] = useState('');
  const [nuevo, setNuevo] = useState(false);

  const lista = useMemo(() => {
    const b = clave(buscar);
    return [...clientes]
      .filter((c) => !b || clave(c.nombre).includes(b) || soloDigitos(c.telefono).includes(b))
      .sort((a, c) => a.nombre.localeCompare(c.nombre));
  }, [clientes, buscar]);

  if (cargando) return <Cargando />;

  return (
    <>
      <div className="encabezado">
        <h1>{t('cli.title')}</h1>
        <button type="button" className="boton" onClick={() => setNuevo((v) => !v)}>
          {nuevo ? t('common.cancel') : t('cli.new')}
        </button>
      </div>
      {nuevo && <FormCliente onListo={() => setNuevo(false)} />}
      <div className="barra">
        <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>
      {lista.length === 0 && <p className="suave">{clientes.length ? t('common.noResults') : t('cli.empty')}</p>}
      {lista.map((c) => (
        <FilaCliente key={c.id} cliente={c} esGestor={esGestor} />
      ))}
    </>
  );
}

function FilaCliente({ cliente, esGestor }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const [msg, setMsg] = useState('');
  const wa = enlaceWhatsapp(cliente.telefono);

  const borrar = async () => {
    if (!window.confirm(t('common.confirmDelete', { nombre: cliente.nombre }))) return;
    try {
      await deleteDoc(doc(db, 'empresas', empresa.id, 'clientes', cliente.id));
    } catch {
      setMsg(t('common.error'));
    }
  };

  return (
    <section className="tarjeta">
      <button type="button" className="fila-titulo" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
        <div>
          <strong>{cliente.nombre}</strong>
          <div className="suave">{cliente.telefono || t('cli.noPhone')}</div>
        </div>
      </button>
      {abierta && (
        <div className="detalle">
          {cliente.direccion && <p>📍 {cliente.direccion}</p>}
          {cliente.notas && <p className="suave">{cliente.notas}</p>}
          <div className="fila envolver">
            {wa && (
              <a className="boton secundario" href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            {!editando && (
              <button type="button" className="boton secundario" onClick={() => setEditando(true)}>
                {t('common.edit')}
              </button>
            )}
            {esGestor && !editando && (
              <button type="button" className="boton texto peligro" onClick={borrar}>
                {t('common.delete')}
              </button>
            )}
          </div>
          <Aviso tipo="error">{msg}</Aviso>
          {editando && <FormCliente cliente={cliente} onListo={() => setEditando(false)} />}
        </div>
      )}
    </section>
  );
}

function FormCliente({ cliente, onListo }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [direccion, setDireccion] = useState(cliente?.direccion || '');
  const [notas, setNotas] = useState(cliente?.notas || '');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg('');
    try {
      const datos = { nombre: nombre.trim(), telefono: soloDigitos(telefono), direccion: direccion.trim(), notas: notas.trim() };
      if (cliente) await updateDoc(doc(db, 'empresas', empresa.id, 'clientes', cliente.id), datos);
      else await setDoc(doc(collection(db, 'empresas', empresa.id, 'clientes')), { ...datos, creadoEn: serverTimestamp() });
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('cli.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>
      <Campo etiqueta={t('cli.phone')} ayuda={t('cli.phoneHint')}>
        <input inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </Campo>
      <Campo etiqueta={t('cli.address')}>
        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={160} />
      </Campo>
      <Campo etiqueta={t('cli.notes')}>
        <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={300} />
      </Campo>
      <Aviso tipo="error">{msg}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        {cliente && (
          <button type="button" className="boton secundario" onClick={onListo}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
