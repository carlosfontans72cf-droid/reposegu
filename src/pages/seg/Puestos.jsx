import { useState } from 'react';
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { enlaceMapa } from '../../lib/formato';
import { leerPosicion } from '../../lib/segServicios';
import { enlaceMapaCoord } from '../../lib/seguridad.js';
import { Aviso, Campo, Cargando } from '../../components/ui';

const nuevoId = () => Math.random().toString(36).slice(2, 9);

// Puestos y eventos donde trabajan los guardias, con sus puntos de ronda.
export default function Puestos() {
  const { puestos, cargando } = useSeg();
  const { t } = useI18n();
  const [editando, setEditando] = useState(null);

  if (cargando) return <Cargando />;
  const ordenados = [...puestos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  return (
    <>
      <div className="encabezado">
        <h1>{t('seg.post.title')}</h1>
        <button type="button" className="boton" onClick={() => setEditando(editando ? null : 'nuevo')}>
          {editando ? t('common.cancel') : t('seg.post.new')}
        </button>
      </div>
      <p className="suave">{t('seg.post.help')}</p>
      {editando === 'nuevo' && <FormPuesto onListo={() => setEditando(null)} />}
      {puestos.length === 0 && editando !== 'nuevo' && <p className="suave">{t('seg.post.empty')}</p>}
      {ordenados.map((p) =>
        editando === p.id ? (
          <FormPuesto key={p.id} puesto={p} onListo={() => setEditando(null)} />
        ) : (
          <FilaPuesto key={p.id} puesto={p} onEditar={() => setEditando(p.id)} />
        ),
      )}
    </>
  );
}

function FilaPuesto({ puesto, onEditar }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [msg, setMsg] = useState('');
  const mapa = puesto.lat != null ? enlaceMapaCoord(puesto.lat, puesto.lng) : enlaceMapa(puesto.direccion);

  const borrar = async () => {
    if (!window.confirm(t('common.confirmDelete', { nombre: puesto.nombre }))) return;
    try {
      await deleteDoc(doc(db, 'empresas', empresa.id, 'puestos', puesto.id));
    } catch {
      setMsg(t('common.error'));
    }
  };

  return (
    <section className={`tarjeta ${puesto.activo === false ? 'inactivo' : ''}`}>
      <div className="dato">
        <div>
          <strong>{puesto.nombre}</strong>{' '}
          <span className="insignia">{t(`seg.post.type.${puesto.tipo || 'fijo'}`)}</span>
          {puesto.activo === false && <span className="insignia bloqueada">{t('seg.post.inactive')}</span>}
          {puesto.cliente && <div className="suave">{puesto.cliente}</div>}
          {puesto.direccion && (
            <div className="suave">
              {mapa ? (
                <a href={mapa} target="_blank" rel="noreferrer">
                  {puesto.direccion}
                </a>
              ) : (
                puesto.direccion
              )}
            </div>
          )}
          <div className="suave">{t('seg.post.pointsCount', { n: (puesto.puntos || []).length })}</div>
          {puesto.instrucciones && <p className="suave">{puesto.instrucciones}</p>}
        </div>
        <div className="fila">
          <button type="button" className="boton secundario" onClick={onEditar}>
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

function FormPuesto({ puesto, onListo }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const [nombre, setNombre] = useState(puesto?.nombre || '');
  const [cliente, setCliente] = useState(puesto?.cliente || '');
  const [direccion, setDireccion] = useState(puesto?.direccion || '');
  const [tipo, setTipo] = useState(puesto?.tipo || 'fijo');
  const [instrucciones, setInstrucciones] = useState(puesto?.instrucciones || '');
  const [activo, setActivo] = useState(puesto?.activo !== false);
  const [coords, setCoords] = useState(puesto?.lat != null ? { lat: puesto.lat, lng: puesto.lng } : null);
  const [puntos, setPuntos] = useState(puesto?.puntos || []);
  const [nuevoPunto, setNuevoPunto] = useState('');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const usarMiUbicacion = async () => {
    setMsg('');
    const p = await leerPosicion();
    if (p) setCoords({ lat: p.lat, lng: p.lng });
    else setMsg(t('seg.post.noGps'));
  };

  const agregarPunto = () => {
    const n = nuevoPunto.trim();
    if (!n) return;
    setPuntos((l) => [...l, { id: nuevoId(), nombre: n.slice(0, 60) }]);
    setNuevoPunto('');
  };
  const mover = (i, d) =>
    setPuntos((l) => {
      const c = [...l];
      const j = i + d;
      if (j < 0 || j >= c.length) return c;
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg('');
    try {
      const datos = {
        nombre: nombre.trim(),
        cliente: cliente.trim(),
        direccion: direccion.trim(),
        tipo,
        instrucciones: instrucciones.trim().slice(0, 1000),
        activo,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        puntos,
      };
      if (puesto) await updateDoc(doc(db, 'empresas', empresa.id, 'puestos', puesto.id), datos);
      else await setDoc(doc(collection(db, 'empresas', empresa.id, 'puestos')), { ...datos, creadoEn: serverTimestamp() });
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('seg.post.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>
      <div className="dos">
        <Campo etiqueta={t('seg.post.type')}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="fijo">{t('seg.post.type.fijo')}</option>
            <option value="evento">{t('seg.post.type.evento')}</option>
          </select>
        </Campo>
        <Campo etiqueta={t('seg.post.client')}>
          <input value={cliente} onChange={(e) => setCliente(e.target.value)} maxLength={80} />
        </Campo>
      </div>
      <Campo etiqueta={t('seg.post.address')}>
        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={160} />
      </Campo>
      <div className="fila">
        <button type="button" className="boton secundario" onClick={usarMiUbicacion}>
          {t('seg.post.useMyLocation')}
        </button>
        {coords && (
          <span className="suave">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}{' '}
            <button type="button" className="boton texto" onClick={() => setCoords(null)}>
              {t('common.delete')}
            </button>
          </span>
        )}
      </div>
      <p className="suave">{t('seg.post.locationHelp')}</p>
      <Campo etiqueta={t('seg.post.instructions')} ayuda={t('seg.post.instructionsHelp')}>
        <textarea rows={3} value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} maxLength={1000} />
      </Campo>

      <div>
        <span className="etiqueta">{t('seg.post.points')}</span>
        <p className="suave">{t('seg.post.pointsHelp')}</p>
        <ol className="puntos-lista">
          {puntos.map((p, i) => (
            <li key={p.id}>
              <span>{p.nombre}</span>
              <span className="fila">
                <button type="button" className="boton texto" onClick={() => mover(i, -1)} aria-label="↑" disabled={i === 0}>
                  ↑
                </button>
                <button type="button" className="boton texto" onClick={() => mover(i, 1)} aria-label="↓" disabled={i === puntos.length - 1}>
                  ↓
                </button>
                <button type="button" className="boton texto peligro" onClick={() => setPuntos((l) => l.filter((x) => x.id !== p.id))}>
                  {t('common.delete')}
                </button>
              </span>
            </li>
          ))}
        </ol>
        <div className="fila">
          <input
            value={nuevoPunto}
            onChange={(e) => setNuevoPunto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregarPunto();
              }
            }}
            placeholder={t('seg.post.pointName')}
            maxLength={60}
          />
          <button type="button" className="boton secundario" onClick={agregarPunto}>
            {t('seg.post.addPoint')}
          </button>
        </div>
      </div>

      <label className="fila casilla">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        <span>{t('seg.post.active')}</span>
      </label>
      <Aviso tipo="error">{msg}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        {puesto && (
          <button type="button" className="boton secundario" onClick={onListo}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
