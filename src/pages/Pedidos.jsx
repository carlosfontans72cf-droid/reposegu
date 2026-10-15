import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { aInputFechaHora, deInputFechaHora, enlaceMapa, formatoFechaHora, inicioDelDia, mismoDia, useDinero } from '../lib/formato';
import { aNumero, consumoDePedido, costoReceta, faltantesDeStock, formatearCantidad, totalesPedido } from '../lib/costos';
import { clave } from '../lib/importar';
import { soloDigitos } from '../lib/paises';
import { armarMensajePedido, enlaceWhatsappCliente } from '../lib/mensajePedido';
import { cambiarEstado, crearPedido, editarPedido, registrarCobro } from '../lib/servicios';
import { Aviso, Campo, Cargando } from '../components/ui';

export const aFechaPedido = (p) => (p?.fechaEntrega?.toDate ? p.fechaEntrega.toDate() : null);
export const saldoDe = (p) => Math.max(aNumero(p.total) - aNumero(p.abonado), 0);
const ACTIVOS = ['nuevo', 'confirmado', 'preparacion', 'listo'];
const SIGUIENTE = { nuevo: 'confirmado', confirmado: 'preparacion', preparacion: 'listo', listo: 'entregado' };

export default function Pedidos() {
  const { pedidos, cargando } = useDatos();
  const { t } = useI18n();
  const [filtro, setFiltro] = useState('activos');
  const [buscar, setBuscar] = useState('');
  const [params] = useSearchParams();
  const [nuevo, setNuevo] = useState(params.get('nuevo') === '1');

  const lista = useMemo(() => {
    const b = clave(buscar);
    const pasa = (p) => {
      if (filtro === 'activos') return ACTIVOS.includes(p.estado);
      if (filtro === 'entregados') return p.estado === 'entregado';
      if (filtro === 'cancelados') return p.estado === 'cancelado';
      return true;
    };
    const f = pedidos.filter((p) => pasa(p) && (!b || clave(p.clienteNombre).includes(b) || String(p.numero) === buscar.replace('#', '').trim()));
    // Los pendientes, del más próximo al más lejano; el historial, del más reciente al más viejo.
    const asc = [...f].sort((a, c) => (aFechaPedido(a)?.getTime() || 0) - (aFechaPedido(c)?.getTime() || 0));
    return filtro === 'activos' ? asc : asc.reverse();
  }, [pedidos, filtro, buscar]);

  if (cargando) return <Cargando />;

  return (
    <>
      <div className="encabezado">
        <h1>{t('orders.title')}</h1>
        <button type="button" className="boton" onClick={() => setNuevo((v) => !v)}>
          {nuevo ? t('common.cancel') : t('orders.new')}
        </button>
      </div>

      {nuevo && <FormPedido onListo={() => setNuevo(false)} />}

      <div className="barra">
        <input type="search" placeholder={t('orders.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <div className="pestanas" role="tablist">
          {['activos', 'entregados', 'cancelados', 'todos'].map((k) => (
            <button key={k} type="button" className={filtro === k ? 'activo' : ''} onClick={() => setFiltro(k)}>
              {t(`orders.filter.${k}`)}
            </button>
          ))}
        </div>
      </div>

      {lista.length === 0 && <p className="suave">{t('orders.empty')}</p>}
      {lista.map((p) => (
        <TarjetaPedido key={p.id} pedido={p} />
      ))}
      <p className="suave">{t('orders.windowNote')}</p>
    </>
  );
}

export function TarjetaPedido({ pedido: p, compacta = false }) {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { perfil, empresa } = useAuth();
  const { productosPorId, insumosPorId } = useDatos();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [abierta, setAbierta] = useState(false);
  const [editando, setEditando] = useState(false);
  const [cobro, setCobro] = useState('');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const fecha = aFechaPedido(p);
  const saldo = saldoDe(p);
  const hoy = fecha && mismoDia(fecha, new Date());
  const atrasado = fecha && fecha < inicioDelDia() && ACTIVOS.includes(p.estado);
  const costoTotal = (p.items || []).reduce((s, it) => s + aNumero(it.cantidad) * aNumero(it.costo), 0);
  const ganancia = aNumero(p.total) - costoTotal - (p.tipoEntrega === 'envio' ? aNumero(p.envioCosto) : 0);

  const correr = async (accion) => {
    setOcupado(true);
    setMsg('');
    try {
      await accion();
    } catch (e) {
      setMsg(e?.code === 'permission-denied' ? t('common.permission') : t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  const irA = (nuevo) => {
    if (nuevo === 'cancelado' && !window.confirm(t('orders.confirmCancel', { n: p.numero }))) return;
    if (nuevo === 'preparacion' && !p.stockDescontado) {
      const faltan = faltantesDeStock(consumoDePedido(p.items, productosPorId), insumosPorId);
      if (faltan.length > 0) {
        const lista = faltan.map((f) => `${f.nombre}: ${formatearCantidad(f.falta, f.unidad, lang)}`).join('\n');
        if (!window.confirm(t('orders.lowStockConfirm', { lista }))) return;
      }
    }
    correr(() => cambiarEstado(empresa.id, p, nuevo, productosPorId, insumosPorId));
  };

  const cobrar = () => {
    const n = aNumero(cobro);
    if (!(n > 0)) return;
    correr(async () => {
      await registrarCobro(empresa.id, p.id, n);
      setCobro('');
    });
  };

  const avisar = enlaceWhatsappCliente(
    p.clienteTelefono,
    empresa.pais,
    armarMensajePedido(t, p, {
      empresa,
      fechaTxt: formatoFechaHora(fecha, lang),
      totalTxt: dinero(p.total),
      saldoTxt: dinero(saldo),
      saldo,
    }),
  );
  const mapa = enlaceMapa(p.direccion);

  return (
    <section className={`tarjeta pedido estado-${p.estado}`}>
      <button type="button" className="fila-titulo" onClick={() => setAbierta((a) => !a)} aria-expanded={abierta}>
        <div>
          <strong>
            #{p.numero} · {p.clienteNombre}
          </strong>
          <div className={`suave ${atrasado ? 'atrasado' : ''}`}>
            {hoy ? `${t('common.today')} · ` : ''}
            {formatoFechaHora(fecha, lang)} · {p.tipoEntrega === 'envio' ? t('orders.delivery') : t('orders.pickup')}
          </div>
        </div>
        <div className="derecha">
          <span className={`insignia pedido-${p.estado}`}>{t(`orders.state.${p.estado}`)}</span>
          <div>
            <strong>{dinero(p.total)}</strong>
            {saldo > 0 && p.estado !== 'cancelado' && <span className="suave saldo">{t('orders.owes', { n: dinero(saldo) })}</span>}
          </div>
        </div>
      </button>

      {abierta && !editando && (
        <div className="detalle">
          <ul className="lista">
            {(p.items || []).map((it, i) => (
              <li key={i}>
                <span>
                  {it.cantidad} × {it.nombre}
                </span>
                <span>{dinero(aNumero(it.cantidad) * aNumero(it.precio))}</span>
              </li>
            ))}
            {aNumero(p.descuento) > 0 && (
              <li>
                <span>{t('orders.discount')}</span>
                <span>− {dinero(p.descuento)}</span>
              </li>
            )}
            {p.tipoEntrega === 'envio' && (
              <li>
                <span>
                  {t('orders.shipping')}
                  {p.zonaNombre ? ` (${p.zonaNombre})` : ''}
                </span>
                <span>{dinero(p.envioCobrado)}</span>
              </li>
            )}
          </ul>

          {p.tipoEntrega === 'envio' && p.direccion && (
            <p>
              📍 {p.direccion}{' '}
              {mapa && (
                <a href={mapa} target="_blank" rel="noreferrer">
                  {t('orders.openMap')}
                </a>
              )}
            </p>
          )}
          {p.notas && <p className="suave">📝 {p.notas}</p>}

          <div className="resumen-costo">
            <span>
              {t('orders.paid')}: <strong>{dinero(p.abonado)}</strong>
            </span>
            <span>
              {t('orders.balance')}: <strong>{dinero(saldo)}</strong>
            </span>
            {esGestor && (
              <span>
                {t('orders.estProfit')}: <strong>{dinero(ganancia)}</strong>
              </span>
            )}
          </div>

          {saldo > 0 && p.estado !== 'cancelado' && (
            <div className="fila">
              <input inputMode="decimal" placeholder={t('orders.payAmount')} value={cobro} onChange={(e) => setCobro(e.target.value)} />
              <button type="button" className="boton secundario" disabled={ocupado} onClick={cobrar}>
                {t('orders.registerPayment')}
              </button>
              <button type="button" className="boton texto" disabled={ocupado} onClick={() => setCobro(String(saldo))}>
                {t('orders.payAll')}
              </button>
            </div>
          )}

          {!compacta && (
            <div className="fila envolver">
              {SIGUIENTE[p.estado] && (
                <button type="button" className="boton" disabled={ocupado} onClick={() => irA(SIGUIENTE[p.estado])}>
                  {t(`orders.next.${p.estado}`)}
                </button>
              )}
              {['nuevo', 'confirmado'].includes(p.estado) && (
                <button type="button" className="boton secundario" onClick={() => setEditando(true)}>
                  {t('common.edit')}
                </button>
              )}
              {avisar && (
                <a className="boton secundario" href={avisar} target="_blank" rel="noreferrer">
                  {t('orders.notify')}
                </a>
              )}
            </div>
          )}

          {!compacta && (
            <div className="fila envolver">
              <label className="suave">
                {t('orders.changeState')}{' '}
                <select
                  className="corto"
                  value={p.estado}
                  disabled={ocupado}
                  onChange={(e) => irA(e.target.value)}
                  aria-label={t('orders.changeState')}
                >
                  {['nuevo', 'confirmado', 'preparacion', 'listo', 'entregado', 'cancelado'].map((e) => (
                    <option key={e} value={e}>
                      {t(`orders.state.${e}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {p.stockDescontado && <p className="suave">{t('orders.stockDone')}</p>}
          <Aviso tipo="error">{msg}</Aviso>
        </div>
      )}

      {abierta && editando && <FormPedido pedido={p} onListo={() => setEditando(false)} />}
    </section>
  );
}

const manana9 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d;
};

export function FormPedido({ pedido, onListo }) {
  const { t } = useI18n();
  const dinero = useDinero();
  const { empresa, user } = useAuth();
  const { productos, clientes, zonas, productosPorId, insumosPorId } = useDatos();

  const [clienteNombre, setClienteNombre] = useState(pedido?.clienteNombre || '');
  const [telefono, setTelefono] = useState(pedido?.clienteTelefono || '');
  const [guardarCliente, setGuardarCliente] = useState(true);
  const [items, setItems] = useState(
    pedido?.items?.length
      ? pedido.items.map((i) => ({ productoId: i.productoId || '', nombre: i.nombre, cantidad: String(i.cantidad), precio: String(i.precio), costo: aNumero(i.costo) }))
      : [{ productoId: '', nombre: '', cantidad: '1', precio: '', costo: 0 }],
  );
  const [fecha, setFecha] = useState(aInputFechaHora(pedido ? aFechaPedido(pedido) : manana9()));
  const [tipo, setTipo] = useState(pedido?.tipoEntrega || 'retiro');
  const [zonaId, setZonaId] = useState(pedido?.zonaId || '');
  const [direccion, setDireccion] = useState(pedido?.direccion || '');
  const [envioCobrado, setEnvioCobrado] = useState(String(pedido?.envioCobrado ?? ''));
  const [envioCosto, setEnvioCosto] = useState(String(pedido?.envioCosto ?? ''));
  const [descuento, setDescuento] = useState(String(pedido?.descuento || ''));
  const [abonado, setAbonado] = useState(String(pedido?.abonado || ''));
  const [notas, setNotas] = useState(pedido?.notas || '');
  const [msg, setMsg] = useState({ tipo: 'ok', texto: '' });
  const [ocupado, setOcupado] = useState(false);

  const clienteExistente = clientes.find((c) => clave(c.nombre) === clave(clienteNombre));

  const elegirCliente = (nombre) => {
    setClienteNombre(nombre);
    const c = clientes.find((x) => clave(x.nombre) === clave(nombre));
    if (c) {
      if (c.telefono) setTelefono(c.telefono);
      if (c.direccion && !direccion) setDireccion(c.direccion);
    }
  };

  const cambiarItem = (i, cambios) => setItems((l) => l.map((it, n) => (n === i ? { ...it, ...cambios } : it)));
  const elegirProducto = (i, id) => {
    if (!id || id === '__otro') return cambiarItem(i, { productoId: '', nombre: '', costo: 0 });
    const p = productosPorId[id];
    cambiarItem(i, {
      productoId: id,
      nombre: p.nombre,
      precio: String(p.precio ?? ''),
      costo: costoReceta(p.receta, insumosPorId).porUnidad,
    });
  };

  const elegirZona = (id) => {
    setZonaId(id);
    const z = zonas.find((x) => x.id === id);
    if (z) {
      setEnvioCobrado(String(z.tarifa ?? ''));
      setEnvioCosto(String(z.costoReal ?? ''));
    }
  };

  const itemsValidos = items.filter((it) => it.nombre.trim() && aNumero(it.cantidad) > 0);
  const tot = totalesPedido({ items: itemsValidos, descuento, tipoEntrega: tipo, envioCobrado });
  const saldo = Math.max(tot.total - aNumero(abonado), 0);

  const guardar = async (ev) => {
    ev.preventDefault();
    if (itemsValidos.length === 0) return setMsg({ tipo: 'error', texto: t('orders.needItems') });
    const fe = deInputFechaHora(fecha);
    if (!fe || Number.isNaN(fe.getTime())) return setMsg({ tipo: 'error', texto: t('orders.needDate') });
    setOcupado(true);
    setMsg({ tipo: 'ok', texto: '' });
    try {
      let clienteId = clienteExistente?.id || pedido?.clienteId || '';
      if (!clienteExistente && guardarCliente && clienteNombre.trim() && !pedido) {
        const nuevo = doc(collection(db, 'empresas', empresa.id, 'clientes'));
        await setDoc(nuevo, {
          nombre: clienteNombre.trim(),
          telefono: soloDigitos(telefono),
          direccion: tipo === 'envio' ? direccion.trim() : '',
          notas: '',
          creadoEn: serverTimestamp(),
        });
        clienteId = nuevo.id;
      }
      const datos = {
        clienteId,
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: soloDigitos(telefono),
        items: itemsValidos.map((it) => ({
          productoId: it.productoId || null,
          nombre: it.nombre.trim(),
          cantidad: aNumero(it.cantidad),
          precio: aNumero(it.precio),
          costo: Number(aNumero(it.costo).toFixed(4)),
        })),
        subtotal: tot.subtotal,
        descuento: tot.descuento,
        total: tot.total,
        tipoEntrega: tipo,
        direccion: tipo === 'envio' ? direccion.trim() : '',
        zonaId: tipo === 'envio' ? zonaId : '',
        zonaNombre: tipo === 'envio' ? zonas.find((z) => z.id === zonaId)?.nombre || '' : '',
        envioCobrado: tipo === 'envio' ? aNumero(envioCobrado) : 0,
        envioCosto: tipo === 'envio' ? aNumero(envioCosto) : 0,
        repartidor: pedido?.repartidor || '',
        enCamino: pedido?.enCamino || false,
        fechaEntrega: Timestamp.fromDate(fe),
        notas: notas.trim(),
        abonado: aNumero(abonado),
      };
      if (pedido) await editarPedido(empresa.id, pedido.id, datos);
      else await crearPedido(empresa.id, user.uid, datos);
      onListo();
    } catch (e) {
      setMsg({ tipo: 'error', texto: e?.code === 'permission-denied' ? t('common.permission') : t('common.error') });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <h2>{pedido ? t('orders.edit', { n: pedido.numero }) : t('orders.new')}</h2>

      <Campo etiqueta={t('orders.client')}>
        <input list="lista-clientes" value={clienteNombre} onChange={(e) => elegirCliente(e.target.value)} required maxLength={80} autoComplete="off" />
        <datalist id="lista-clientes">
          {clientes.map((c) => (
            <option key={c.id} value={c.nombre} />
          ))}
        </datalist>
      </Campo>
      <Campo etiqueta={t('cli.phone')} ayuda={t('cli.phoneHint')}>
        <input inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </Campo>
      {!clienteExistente && !pedido && clienteNombre.trim() && (
        <label className="fila casilla">
          <input type="checkbox" checked={guardarCliente} onChange={(e) => setGuardarCliente(e.target.checked)} />
          <span>{t('orders.saveClient')}</span>
        </label>
      )}

      <fieldset className="receta">
        <legend>{t('orders.items')}</legend>
        {items.map((it, i) => (
          <div key={i} className="fila-pedido">
            <select value={it.productoId || (it.nombre ? '__otro' : '')} onChange={(e) => elegirProducto(i, e.target.value)} aria-label={t('orders.product')}>
              <option value="">{t('orders.pickProduct')}</option>
              {[...productos]
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              <option value="__otro">{t('orders.other')}</option>
            </select>
            {!it.productoId && (
              <input placeholder={t('orders.itemName')} value={it.nombre} onChange={(e) => cambiarItem(i, { nombre: e.target.value })} maxLength={80} />
            )}
            <div className="fila">
              <input className="corto" inputMode="decimal" value={it.cantidad} onChange={(e) => cambiarItem(i, { cantidad: e.target.value })} aria-label={t('stock.amount')} />
              <span className="suave">×</span>
              <input inputMode="decimal" value={it.precio} onChange={(e) => cambiarItem(i, { precio: e.target.value })} aria-label={t('prod.price')} placeholder={t('prod.price')} />
              <button type="button" className="boton texto peligro" onClick={() => setItems((l) => (l.length > 1 ? l.filter((_, n) => n !== i) : l))} aria-label={t('common.delete')}>
                ✕
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="boton secundario" onClick={() => setItems((l) => [...l, { productoId: '', nombre: '', cantidad: '1', precio: '', costo: 0 }])}>
          {t('orders.addItem')}
        </button>
      </fieldset>

      <Campo etiqueta={t('orders.date')}>
        <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </Campo>

      <Campo etiqueta={t('orders.deliveryType')}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="retiro">{t('orders.pickup')}</option>
          <option value="envio">{t('orders.delivery')}</option>
        </select>
      </Campo>

      {tipo === 'envio' && (
        <>
          {zonas.length > 0 && (
            <Campo etiqueta={t('orders.zone')}>
              <select value={zonaId} onChange={(e) => elegirZona(e.target.value)}>
                <option value="">{t('orders.noZone')}</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          )}
          <Campo etiqueta={t('cli.address')}>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} required maxLength={160} />
          </Campo>
          <div className="dos">
            <Campo etiqueta={t('orders.shippingCharged')}>
              <input inputMode="decimal" value={envioCobrado} onChange={(e) => setEnvioCobrado(e.target.value)} />
            </Campo>
            <Campo etiqueta={t('orders.shippingCost')} ayuda={t('orders.shippingCostHint')}>
              <input inputMode="decimal" value={envioCosto} onChange={(e) => setEnvioCosto(e.target.value)} />
            </Campo>
          </div>
        </>
      )}

      <div className="dos">
        <Campo etiqueta={t('orders.discount')}>
          <input inputMode="decimal" value={descuento} onChange={(e) => setDescuento(e.target.value)} />
        </Campo>
        <Campo etiqueta={t('orders.deposit')} ayuda={t('orders.depositHint')}>
          <input inputMode="decimal" value={abonado} onChange={(e) => setAbonado(e.target.value)} />
        </Campo>
      </div>

      <Campo etiqueta={t('orders.notes')}>
        <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={400} placeholder={t('orders.notesHint')} />
      </Campo>

      <div className="resumen-costo">
        <span>
          {t('orders.total')}: <strong>{dinero(tot.total)}</strong>
        </span>
        <span>
          {t('orders.balance')}: <strong>{dinero(saldo)}</strong>
        </span>
      </div>

      <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
      <div className="fila">
        <button className="boton" disabled={ocupado}>
          {t('common.save')}
        </button>
        <button type="button" className="boton secundario" onClick={onListo}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
