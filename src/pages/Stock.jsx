import { useMemo, useState } from 'react';
import { collection, deleteDoc, doc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { useDinero } from '../lib/formato';
import { UNIDADES, UNIDADES_COMPRA, aNumero, costoBase, estadoStock, formatearCantidad, redondear } from '../lib/costos';
import { clave } from '../lib/importar';
import { Aviso, Campo, Cargando } from '../components/ui';

// Insumos y su stock. El equipo ajusta cantidades; dueño y administrador editan precios y datos.
export default function Stock() {
  const { perfil } = useAuth();
  const { insumos, productos, cargando } = useDatos();
  const { t } = useI18n();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [buscar, setBuscar] = useState('');
  const [nuevo, setNuevo] = useState(false);
  const [solo, setSolo] = useState('todos');

  const lista = useMemo(() => {
    const b = clave(buscar);
    return [...insumos]
      .filter((i) => (!b || clave(i.nombre).includes(b)) && (solo === 'todos' || estadoStock(i) !== 'ok'))
      .sort((a, c) => a.nombre.localeCompare(c.nombre));
  }, [insumos, buscar, solo]);

  const bajos = insumos.filter((i) => estadoStock(i) !== 'ok').length;
  if (cargando) return <Cargando />;

  return (
    <>
      <div className="encabezado">
        <h1>{t('stock.title')}</h1>
        {esGestor && (
          <button type="button" className="boton" onClick={() => setNuevo((v) => !v)}>
            {nuevo ? t('common.cancel') : t('stock.new')}
          </button>
        )}
      </div>

      {nuevo && esGestor && <FormInsumo onListo={() => setNuevo(false)} />}

      <div className="barra">
        <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <div className="pestanas" role="tablist">
          <button type="button" className={solo === 'todos' ? 'activo' : ''} onClick={() => setSolo('todos')}>
            {t('stock.all')} ({insumos.length})
          </button>
          <button type="button" className={solo === 'bajos' ? 'activo' : ''} onClick={() => setSolo('bajos')}>
            {t('stock.low')} ({bajos})
          </button>
        </div>
      </div>

      {lista.length === 0 && <p className="suave">{insumos.length ? t('common.noResults') : t('stock.empty')}</p>}
      {lista.map((i) => (
        <FilaInsumo key={i.id} insumo={i} esGestor={esGestor} usadoEn={productos.filter((p) => p.receta?.items?.some((x) => x.insumoId === i.id))} />
      ))}
    </>
  );
}

function FilaInsumo({ insumo, esGestor, usadoEn }) {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const est = estadoStock(insumo);

  return (
    <section className="tarjeta">
      <button type="button" className="fila-titulo" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
        <div>
          <strong>{insumo.nombre}</strong>
          {esGestor && (
            <div className="suave">
              {dinero(costoBase(insumo) * (insumo.unidad === 'un' ? 1 : 1000))} / {insumo.unidad === 'g' ? 'kg' : insumo.unidad === 'ml' ? 'l' : 'un'}
            </div>
          )}
        </div>
        <div className="derecha">
          <span className={`insignia stock-${est}`}>{t(`stock.state.${est}`)}</span>
          <div>{formatearCantidad(insumo.stock, insumo.unidad, lang)}</div>
        </div>
      </button>

      {abierta && (
        <div className="detalle">
          <AjusteStock insumo={insumo} empresaId={empresa.id} />
          {insumo.stockMinimo > 0 && (
            <p className="suave">{t('stock.minimumIs', { n: formatearCantidad(insumo.stockMinimo, insumo.unidad, lang) })}</p>
          )}
          {esGestor && !editando && (
            <div className="fila">
              <button type="button" className="boton secundario" onClick={() => setEditando(true)}>
                {t('common.edit')}
              </button>
              <BotonEliminar insumo={insumo} usadoEn={usadoEn} empresaId={empresa.id} />
            </div>
          )}
          {editando && <FormInsumo insumo={insumo} onListo={() => setEditando(false)} />}
        </div>
      )}
    </section>
  );
}

// Entró mercadería / salió mercadería: suma o resta a lo que hay.
function AjusteStock({ insumo, empresaId }) {
  const { t } = useI18n();
  const opciones = UNIDADES_COMPRA[insumo.unidad] || [[insumo.unidad, 1]];
  const [cantidad, setCantidad] = useState('');
  const [factor, setFactor] = useState(opciones[0][1]);
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const aplicar = async (signo) => {
    const n = aNumero(cantidad) * factor;
    if (!(n > 0)) return;
    setOcupado(true);
    setMsg('');
    try {
      await updateDoc(doc(db, 'empresas', empresaId, 'insumos', insumo.id), { stock: increment(redondear(signo * n)) });
      setCantidad('');
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="formulario">
      <div className="fila ajuste">
        <input inputMode="decimal" placeholder={t('stock.amount')} value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
        {opciones.length > 1 && (
          <select className="corto" value={factor} onChange={(e) => setFactor(Number(e.target.value))}>
            {opciones.map(([u, f]) => (
              <option key={u} value={f}>
                {u}
              </option>
            ))}
          </select>
        )}
        {opciones.length === 1 && <span className="suave">{opciones[0][0]}</span>}
      </div>
      <div className="fila">
        <button type="button" className="boton" disabled={ocupado} onClick={() => aplicar(1)}>
          {t('stock.add')}
        </button>
        <button type="button" className="boton secundario" disabled={ocupado} onClick={() => aplicar(-1)}>
          {t('stock.remove')}
        </button>
      </div>
      <Aviso tipo="error">{msg}</Aviso>
    </div>
  );
}

function BotonEliminar({ insumo, usadoEn, empresaId }) {
  const { t } = useI18n();
  const [msg, setMsg] = useState('');
  const borrar = async () => {
    if (usadoEn.length > 0) {
      setMsg(t('stock.usedIn', { lista: usadoEn.map((p) => p.nombre).join(', ') }));
      return;
    }
    if (!window.confirm(t('common.confirmDelete', { nombre: insumo.nombre }))) return;
    try {
      await deleteDoc(doc(db, 'empresas', empresaId, 'insumos', insumo.id));
    } catch {
      setMsg(t('common.error'));
    }
  };
  return (
    <>
      <button type="button" className="boton texto peligro" onClick={borrar}>
        {t('common.delete')}
      </button>
      <Aviso tipo="error">{msg}</Aviso>
    </>
  );
}

const unidadInicial = (i) => (i && i.cantidadCompra >= 1000 && i.cantidadCompra % 1000 === 0 ? 1000 : 1);

function FormInsumo({ insumo, onListo }) {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const { insumos } = useDatos();
  const f0 = unidadInicial(insumo);
  const [nombre, setNombre] = useState(insumo?.nombre || '');
  const [tipo, setTipo] = useState(insumo?.unidad || 'g');
  const [factor, setFactor] = useState(f0);
  const [cantidad, setCantidad] = useState(insumo ? String(insumo.cantidadCompra / f0) : '1');
  const [precio, setPrecio] = useState(insumo ? String(insumo.precioCompra) : '');
  const [stock, setStock] = useState(insumo ? String(redondear(insumo.stock / f0, 3)) : '0');
  const [minimo, setMinimo] = useState(insumo ? String(redondear(insumo.stockMinimo / f0, 3)) : '0');
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const opciones = UNIDADES_COMPRA[tipo];
  const cambiarTipo = (v) => {
    setTipo(v);
    setFactor(1);
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    const n = nombre.trim();
    if (insumos.some((x) => x.id !== insumo?.id && clave(x.nombre) === clave(n))) {
      setMsg({ tipo: 'error', texto: t('stock.duplicate') });
      return;
    }
    setOcupado(true);
    setMsg({ tipo: 'ok', texto: '' });
    try {
      const datos = {
        nombre: n,
        unidad: tipo,
        cantidadCompra: redondear(Math.max(aNumero(cantidad), 0.001) * factor),
        precioCompra: Math.max(aNumero(precio), 0),
        stock: redondear(aNumero(stock) * factor),
        stockMinimo: redondear(Math.max(aNumero(minimo), 0) * factor),
      };
      if (insumo) await updateDoc(doc(db, 'empresas', empresa.id, 'insumos', insumo.id), datos);
      else await setDoc(doc(collection(db, 'empresas', empresa.id, 'insumos')), { ...datos, creadoEn: serverTimestamp() });
      onListo();
    } catch {
      setMsg({ tipo: 'error', texto: t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('stock.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>
      <Campo etiqueta={t('stock.measuredIn')}>
        <select value={tipo} onChange={(e) => cambiarTipo(e.target.value)}>
          {UNIDADES.map((u) => (
            <option key={u} value={u}>
              {t(`unit.${u}`)}
            </option>
          ))}
        </select>
      </Campo>
      {opciones.length > 1 && (
        <Campo etiqueta={t('stock.inUnit')}>
          <select value={factor} onChange={(e) => setFactor(Number(e.target.value))}>
            {opciones.map(([u, fa]) => (
              <option key={u} value={fa}>
                {u}
              </option>
            ))}
          </select>
        </Campo>
      )}
      <div className="dos">
        <Campo etiqueta={t('stock.boughtAmount')} ayuda={t('stock.boughtHint')}>
          <input inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
        </Campo>
        <Campo etiqueta={t('stock.boughtPrice')}>
          <input inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
        </Campo>
      </div>
      <div className="dos">
        <Campo etiqueta={t('stock.current')}>
          <input inputMode="decimal" value={stock} onChange={(e) => setStock(e.target.value)} />
        </Campo>
        <Campo etiqueta={t('stock.minimum')}>
          <input inputMode="decimal" value={minimo} onChange={(e) => setMinimo(e.target.value)} />
        </Campo>
      </div>
      <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        {insumo && (
          <button type="button" className="boton secundario" onClick={onListo}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
