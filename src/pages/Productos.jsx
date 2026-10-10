import { useMemo, useState } from 'react';
import { collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { useDinero } from '../lib/formato';
import { UNIDADES_COMPRA, aNumero, costoReceta, margen, redondear } from '../lib/costos';
import { clave } from '../lib/importar';
import { reducirImagen } from '../lib/imagen';
import { Aviso, Campo, Cargando, useCopiar } from '../components/ui';

export const urlCatalogo = (empresaId) => `${window.location.origin}/c/${empresaId}`;

export default function Productos() {
  const { perfil } = useAuth();
  const { productos, cargando } = useDatos();
  const { t } = useI18n();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [buscar, setBuscar] = useState('');
  const [nuevo, setNuevo] = useState(false);

  const lista = useMemo(() => {
    const b = clave(buscar);
    return [...productos]
      .filter((p) => !b || clave(p.nombre).includes(b) || clave(p.categoria).includes(b))
      .sort((a, c) => (a.categoria || '').localeCompare(c.categoria || '') || a.nombre.localeCompare(c.nombre));
  }, [productos, buscar]);

  if (cargando) return <Cargando />;

  return (
    <>
      <div className="encabezado">
        <h1>{t('prod.title')}</h1>
        {esGestor && (
          <button type="button" className="boton" onClick={() => setNuevo((v) => !v)}>
            {nuevo ? t('common.cancel') : t('prod.new')}
          </button>
        )}
      </div>

      {esGestor && <EnlaceCatalogo />}
      {nuevo && esGestor && <FormProducto onListo={() => setNuevo(false)} />}

      <div className="barra">
        <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      </div>

      {lista.length === 0 && <p className="suave">{productos.length ? t('common.noResults') : t('prod.empty')}</p>}
      {lista.map((p) => (
        <FilaProducto key={p.id} producto={p} esGestor={esGestor} />
      ))}
    </>
  );
}

// El catálogo público es una página que cualquiera abre sin cuenta.
function EnlaceCatalogo() {
  const { t } = useI18n();
  const { empresa } = useAuth();
  const { copiado, copiar } = useCopiar();
  const url = urlCatalogo(empresa.id);
  return (
    <section className="tarjeta">
      <h2>{t('prod.catalogTitle')}</h2>
      <p className="suave">{t('prod.catalogHelp')}</p>
      <code className="enlace">{url}</code>
      <div className="fila envolver">
        <button type="button" className="boton secundario" onClick={() => copiar('url', url)}>
          {copiado === 'url' ? t('common.copied') : t('prod.copyLink')}
        </button>
        <a className="boton secundario" href={`/c/${empresa.id}`} target="_blank" rel="noreferrer">
          {t('prod.openCatalog')}
        </a>
        <a
          className="boton secundario"
          href={`https://wa.me/?text=${encodeURIComponent(t('prod.shareText', { empresa: empresa.nombre, url }))}`}
          target="_blank"
          rel="noreferrer"
        >
          {t('prod.shareWhatsapp')}
        </a>
      </div>
    </section>
  );
}

function FilaProducto({ producto, esGestor }) {
  const { t } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const { insumosPorId } = useDatos();
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const [msg, setMsg] = useState('');

  const costo = costoReceta(producto.receta, insumosPorId);
  const m = margen(producto.precio, costo.porUnidad);

  const alternarVisible = async () => {
    try {
      await updateDoc(doc(db, 'empresas', empresa.id, 'productos', producto.id), { visible: !producto.visible });
    } catch {
      setMsg(t('common.error'));
    }
  };

  const borrar = async () => {
    if (!window.confirm(t('common.confirmDelete', { nombre: producto.nombre }))) return;
    try {
      await deleteDoc(doc(db, 'empresas', empresa.id, 'productos', producto.id));
      if (producto.fotoUrl) deleteObject(ref(storage, `empresas/${empresa.id}/catalogo/${producto.id}.webp`)).catch(() => {});
    } catch {
      setMsg(t('common.error'));
    }
  };

  return (
    <section className="tarjeta">
      <button type="button" className="fila-titulo" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
        <div className="fila">
          {producto.fotoUrl ? <img src={producto.fotoUrl} alt="" className="miniatura" loading="lazy" /> : <div className="miniatura vacia" aria-hidden="true" />}
          <div>
            <strong>{producto.nombre}</strong>
            <div className="suave">{producto.categoria || t('prod.noCategory')}</div>
          </div>
        </div>
        <div className="derecha">
          <strong>{dinero(producto.precio)}</strong>
          <div>
            <span className={`insignia ${producto.visible ? 'activa' : ''}`}>{producto.visible ? t('prod.inCatalog') : t('prod.hidden')}</span>
          </div>
        </div>
      </button>

      {abierta && (
        <div className="detalle">
          {producto.descripcion && <p>{producto.descripcion}</p>}
          {esGestor && (
            <div className="resumen-costo">
              {costo.tiene ? (
                <>
                  <span>
                    {t('prod.cost')}: <strong>{dinero(costo.porUnidad)}</strong>
                  </span>
                  <span>
                    {t('prod.profit')}: <strong>{dinero(m.ganancia)}</strong> ({Math.round(m.porcentaje)}%)
                  </span>
                </>
              ) : (
                <span className="suave">{t('prod.noRecipe')}</span>
              )}
              {costo.faltan.length > 0 && <span className="aviso error">{t('prod.missingSupplies', { n: costo.faltan.length })}</span>}
            </div>
          )}
          {esGestor && !editando && (
            <div className="fila envolver">
              <button type="button" className="boton secundario" onClick={() => setEditando(true)}>
                {t('common.edit')}
              </button>
              <button type="button" className="boton secundario" onClick={alternarVisible}>
                {producto.visible ? t('prod.hide') : t('prod.show')}
              </button>
              <button type="button" className="boton texto peligro" onClick={borrar}>
                {t('common.delete')}
              </button>
            </div>
          )}
          <Aviso tipo="error">{msg}</Aviso>
          {editando && <FormProducto producto={producto} onListo={() => setEditando(false)} />}
        </div>
      )}
    </section>
  );
}

const factorInicial = (cantidad) => (cantidad >= 1000 && cantidad % 1000 === 0 ? 1000 : 1);

function FormProducto({ producto, onListo }) {
  const { t } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const { insumos, insumosPorId, productos } = useDatos();
  const idNuevo = useMemo(() => producto?.id || doc(collection(db, 'empresas', empresa.id, 'productos')).id, [producto, empresa.id]);

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [categoria, setCategoria] = useState(producto?.categoria || '');
  const [precio, setPrecio] = useState(producto ? String(producto.precio ?? '') : '');
  const [visible, setVisible] = useState(producto ? Boolean(producto.visible) : true);
  const [rinde, setRinde] = useState(String(producto?.receta?.rinde ?? 1));
  const [otros, setOtros] = useState(String(producto?.receta?.otros ?? 0));
  const [filas, setFilas] = useState(
    (producto?.receta?.items || []).map((i) => {
      const f = factorInicial(i.cantidad);
      return { insumoId: i.insumoId, cantidad: String(redondear(i.cantidad / f)), factor: f };
    }),
  );
  const [foto, setFoto] = useState(null);
  const [vista, setVista] = useState(producto?.fotoUrl || '');
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  const itemsBase = filas
    .filter((f) => f.insumoId && aNumero(f.cantidad) > 0)
    .map((f) => ({ insumoId: f.insumoId, cantidad: redondear(aNumero(f.cantidad) * f.factor) }));
  const receta = { rinde: Math.max(aNumero(rinde), 1), items: itemsBase, otros: Math.max(aNumero(otros), 0) };
  const costo = costoReceta(receta, insumosPorId);
  const m = margen(precio, costo.porUnidad);

  const cambiarFila = (i, cambios) => setFilas((fs) => fs.map((f, n) => (n === i ? { ...f, ...cambios } : f)));
  const elegirInsumo = (i, insumoId) => cambiarFila(i, { insumoId, factor: 1 });

  const elegirFoto = (ev) => {
    const a = ev.target.files?.[0];
    if (!a) return;
    setFoto(a);
    setVista(URL.createObjectURL(a));
  };

  const guardar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg({ tipo: 'ok', texto: '' });
    try {
      let fotoUrl = producto?.fotoUrl || '';
      if (foto) {
        const blob = await reducirImagen(foto, 900, 0.8);
        const destino = ref(storage, `empresas/${empresa.id}/catalogo/${idNuevo}.webp`);
        await uploadBytes(destino, blob, { contentType: 'image/webp' });
        fotoUrl = await getDownloadURL(destino);
      }
      const datos = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        precio: Math.max(aNumero(precio), 0),
        visible,
        fotoUrl,
        receta: itemsBase.length > 0 || receta.otros > 0 ? receta : null,
      };
      const destinoDoc = doc(db, 'empresas', empresa.id, 'productos', idNuevo);
      if (producto) await updateDoc(destinoDoc, datos);
      else await setDoc(destinoDoc, { ...datos, creadoEn: serverTimestamp() });
      onListo();
    } catch (e) {
      setMsg({ tipo: 'error', texto: e?.code === 'permission-denied' || e?.code === 'storage/unauthorized' ? t('common.permission') : t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('prod.name')}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} />
      </Campo>
      <Campo etiqueta={t('prod.description')}>
        <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={300} />
      </Campo>
      <div className="dos">
        <Campo etiqueta={t('prod.category')}>
          <input list="categorias" value={categoria} onChange={(e) => setCategoria(e.target.value)} maxLength={40} />
          <datalist id="categorias">
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Campo>
        <Campo etiqueta={t('prod.price')}>
          <input inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
        </Campo>
      </div>

      <Campo etiqueta={t('prod.photo')} ayuda={t('prod.photoHint')}>
        <div className="fila">
          {vista && <img src={vista} alt="" className="miniatura grande" />}
          <label className="boton secundario">
            {t('prod.photoUpload')}
            <input type="file" accept="image/*" hidden onChange={elegirFoto} />
          </label>
        </div>
      </Campo>

      <label className="fila casilla">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        <span>{t('prod.showInCatalog')}</span>
      </label>

      <fieldset className="receta">
        <legend>{t('recipe.title')}</legend>
        <p className="suave">{t('recipe.help')}</p>
        <Campo etiqueta={t('recipe.yields')} ayuda={t('recipe.yieldsHint')}>
          <input inputMode="decimal" value={rinde} onChange={(e) => setRinde(e.target.value)} />
        </Campo>

        {filas.map((f, i) => {
          const insumo = insumosPorId[f.insumoId];
          const opciones = UNIDADES_COMPRA[insumo?.unidad] || [['', 1]];
          return (
            <div key={i} className="fila-receta">
              <select value={f.insumoId} onChange={(e) => elegirInsumo(i, e.target.value)} aria-label={t('recipe.supply')}>
                <option value="">{t('recipe.pick')}</option>
                {[...insumos]
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre}
                    </option>
                  ))}
              </select>
              <input inputMode="decimal" value={f.cantidad} onChange={(e) => cambiarFila(i, { cantidad: e.target.value })} aria-label={t('stock.amount')} />
              <select className="corto" value={f.factor} onChange={(e) => cambiarFila(i, { factor: Number(e.target.value) })} aria-label={t('stock.inUnit')}>
                {opciones.map(([u, fa]) => (
                  <option key={u} value={fa}>
                    {u}
                  </option>
                ))}
              </select>
              <button type="button" className="boton texto peligro" onClick={() => setFilas((fs) => fs.filter((_, n) => n !== i))} aria-label={t('common.delete')}>
                ✕
              </button>
            </div>
          );
        })}
        <button type="button" className="boton secundario" onClick={() => setFilas((fs) => [...fs, { insumoId: '', cantidad: '', factor: 1 }])}>
          {t('recipe.addSupply')}
        </button>
        {insumos.length === 0 && <p className="suave">{t('recipe.noSupplies')}</p>}

        <Campo etiqueta={t('recipe.others')} ayuda={t('recipe.othersHint')}>
          <input inputMode="decimal" value={otros} onChange={(e) => setOtros(e.target.value)} />
        </Campo>

        <div className="resumen-costo">
          <span>
            {t('recipe.batchCost')}: <strong>{dinero(costo.total)}</strong>
          </span>
          <span>
            {t('prod.cost')}: <strong>{dinero(costo.porUnidad)}</strong>
          </span>
          {aNumero(precio) > 0 && (
            <span>
              {t('prod.profit')}: <strong>{dinero(m.ganancia)}</strong> ({Math.round(m.porcentaje)}%)
            </span>
          )}
        </div>
      </fieldset>

      <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        {producto && (
          <button type="button" className="boton secundario" onClick={onListo}>
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
