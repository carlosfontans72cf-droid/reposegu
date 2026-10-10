import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { enlaceMapa, formatoFechaHora, inicioDelDia, mismoDia, useDinero } from '../lib/formato';
import { aNumero } from '../lib/costos';
import { aInputFecha } from '../lib/suscripcion';
import { enlaceWhatsapp } from '../lib/paises';
import { cambiarEstado, editarPedido, registrarCobro } from '../lib/servicios';
import { Aviso, Cargando } from '../components/ui';
import { aFechaPedido, saldoDe } from './Pedidos';

const sumarDias = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

// Agenda del día: qué hay que entregar, adónde, cuánto cobrar y cuánto cuesta el traslado.
export default function Entregas() {
  const { perfil } = useAuth();
  const { pedidos, cargando } = useDatos();
  const { t } = useI18n();
  const dinero = useDinero();
  const esGestor = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const [dia, setDia] = useState(inicioDelDia());

  const delDia = useMemo(
    () =>
      pedidos
        .filter((p) => p.estado !== 'cancelado' && aFechaPedido(p) && mismoDia(aFechaPedido(p), dia))
        .sort((a, b) => aFechaPedido(a) - aFechaPedido(b)),
    [pedidos, dia],
  );
  const envios = delDia.filter((p) => p.tipoEntrega === 'envio');
  const retiros = delDia.filter((p) => p.tipoEntrega !== 'envio');

  const cobradoEnvio = envios.reduce((s, p) => s + aNumero(p.envioCobrado), 0);
  const costoEnvio = envios.reduce((s, p) => s + aNumero(p.envioCosto), 0);
  const porCobrar = envios.filter((p) => p.estado !== 'entregado').reduce((s, p) => s + saldoDe(p), 0);

  if (cargando) return <Cargando />;

  return (
    <>
      <h1>{t('deliv.title')}</h1>
      <div className="fila selector-dia">
        <button type="button" className="boton secundario" onClick={() => setDia(sumarDias(dia, -1))} aria-label={t('deliv.prev')}>
          ‹
        </button>
        <input type="date" value={aInputFecha(dia)} onChange={(e) => e.target.value && setDia(new Date(`${e.target.value}T00:00:00`))} />
        <button type="button" className="boton secundario" onClick={() => setDia(sumarDias(dia, 1))} aria-label={t('deliv.next')}>
          ›
        </button>
        <button type="button" className="boton texto" onClick={() => setDia(inicioDelDia())}>
          {t('common.today')}
        </button>
      </div>

      {envios.length > 0 && (
        <section className="tarjeta">
          <div className="resumen-costo">
            <span>
              {t('deliv.count')}: <strong>{envios.length}</strong>
            </span>
            <span>
              {t('deliv.toCollect')}: <strong>{dinero(porCobrar)}</strong>
            </span>
            {esGestor && (
              <>
                <span>
                  {t('deliv.shippingCharged')}: <strong>{dinero(cobradoEnvio)}</strong>
                </span>
                <span>
                  {t('deliv.shippingCost')}: <strong>{dinero(costoEnvio)}</strong>
                </span>
                <span>
                  {t('deliv.shippingResult')}: <strong>{dinero(cobradoEnvio - costoEnvio)}</strong>
                </span>
              </>
            )}
          </div>
        </section>
      )}

      <h2>{t('deliv.shipments')}</h2>
      {envios.length === 0 && <p className="suave">{t('deliv.noShipments')}</p>}
      {envios.map((p) => (
        <TarjetaEnvio key={p.id} pedido={p} />
      ))}

      <h2>{t('deliv.pickups')}</h2>
      {retiros.length === 0 && <p className="suave">{t('deliv.noPickups')}</p>}
      {retiros.map((p) => (
        <TarjetaRetiro key={p.id} pedido={p} />
      ))}
    </>
  );
}

function useAcciones() {
  const { t } = useI18n();
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const correr = async (fn) => {
    setOcupado(true);
    setMsg('');
    try {
      await fn();
    } catch (e) {
      setMsg(e?.code === 'permission-denied' ? t('common.permission') : t('common.error'));
    } finally {
      setOcupado(false);
    }
  };
  return { msg, ocupado, correr };
}

function TarjetaEnvio({ pedido: p }) {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const { productosPorId, insumosPorId } = useDatos();
  const { msg, ocupado, correr } = useAcciones();
  const [repartidor, setRepartidor] = useState(p.repartidor || '');
  const saldo = saldoDe(p);
  const entregado = p.estado === 'entregado';
  const mapa = enlaceMapa(p.direccion);
  const wa = enlaceWhatsapp(p.clienteTelefono);

  const salio = () =>
    correr(async () => {
      if (p.estado !== 'listo') await cambiarEstado(empresa.id, p, 'listo', productosPorId, insumosPorId);
      await editarPedido(empresa.id, p.id, { enCamino: true, repartidor: repartidor.trim() });
    });

  const entregar = (cobrando) =>
    correr(async () => {
      if (cobrando && saldo > 0) await registrarCobro(empresa.id, p.id, saldo);
      await cambiarEstado(empresa.id, p, 'entregado', productosPorId, insumosPorId);
    });

  return (
    <section className={`tarjeta pedido estado-${p.estado}`}>
      <div className="dato">
        <div>
          <strong>
            {formatoFechaHora(aFechaPedido(p), lang)} · #{p.numero} {p.clienteNombre}
          </strong>
          <div>
            📍 {p.direccion}{' '}
            {mapa && (
              <a href={mapa} target="_blank" rel="noreferrer">
                {t('orders.openMap')}
              </a>
            )}
          </div>
          {p.zonaNombre && <div className="suave">{p.zonaNombre}</div>}
          {p.notas && <div className="suave">📝 {p.notas}</div>}
        </div>
        <div className="derecha">
          <span className={`insignia pedido-${p.estado}`}>{p.enCamino && !entregado ? t('deliv.onTheWay') : t(`orders.state.${p.estado}`)}</span>
          <div>
            {saldo > 0 && !entregado ? (
              <strong>
                {t('deliv.collect')}: {dinero(saldo)}
              </strong>
            ) : (
              <span className="suave">{t('deliv.paid')}</span>
            )}
          </div>
        </div>
      </div>

      {!entregado && (
        <>
          <div className="fila envolver">
            <input
              className="repartidor"
              placeholder={t('deliv.driver')}
              value={repartidor}
              onChange={(e) => setRepartidor(e.target.value)}
              onBlur={() => repartidor.trim() !== (p.repartidor || '') && correr(() => editarPedido(empresa.id, p.id, { repartidor: repartidor.trim() }))}
              maxLength={60}
            />
            {wa && (
              <a className="boton secundario" href={wa} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            {p.clienteTelefono && (
              <a className="boton secundario" href={`tel:${p.clienteTelefono}`}>
                {t('deliv.call')}
              </a>
            )}
          </div>
          <div className="fila envolver">
            {!p.enCamino && (
              <button type="button" className="boton secundario" disabled={ocupado} onClick={salio}>
                {t('deliv.left')}
              </button>
            )}
            <button type="button" className="boton" disabled={ocupado} onClick={() => entregar(false)}>
              {t('deliv.delivered')}
            </button>
            {saldo > 0 && (
              <button type="button" className="boton" disabled={ocupado} onClick={() => entregar(true)}>
                {t('deliv.deliveredPaid')}
              </button>
            )}
          </div>
        </>
      )}
      {entregado && p.repartidor && <p className="suave">{t('deliv.deliveredBy', { nombre: p.repartidor })}</p>}
      <Aviso tipo="error">{msg}</Aviso>
    </section>
  );
}

function TarjetaRetiro({ pedido: p }) {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { empresa } = useAuth();
  const { productosPorId, insumosPorId } = useDatos();
  const { msg, ocupado, correr } = useAcciones();
  const saldo = saldoDe(p);
  const entregado = p.estado === 'entregado';

  const entregar = () =>
    correr(async () => {
      if (saldo > 0) await registrarCobro(empresa.id, p.id, saldo);
      await cambiarEstado(empresa.id, p, 'entregado', productosPorId, insumosPorId);
    });

  return (
    <section className={`tarjeta pedido estado-${p.estado}`}>
      <div className="dato">
        <div>
          <strong>
            {formatoFechaHora(aFechaPedido(p), lang)} · #{p.numero} {p.clienteNombre}
          </strong>
          <div className="suave">{(p.items || []).map((i) => `${i.cantidad}× ${i.nombre}`).join(', ')}</div>
        </div>
        <div className="derecha">
          <span className={`insignia pedido-${p.estado}`}>{t(`orders.state.${p.estado}`)}</span>
          <div>{saldo > 0 && !entregado ? <strong>{t('deliv.collect')}: {dinero(saldo)}</strong> : <span className="suave">{t('deliv.paid')}</span>}</div>
        </div>
      </div>
      {!entregado && (
        <button type="button" className="boton" disabled={ocupado} onClick={entregar}>
          {saldo > 0 ? t('deliv.deliveredPaid') : t('deliv.delivered')}
        </button>
      )}
      <Aviso tipo="error">{msg}</Aviso>
    </section>
  );
}
