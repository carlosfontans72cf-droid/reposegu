import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useDatos } from '../data/DatosProvider';
import { useI18n } from '../i18n';
import { aNumero, estadoStock, formatearCantidad } from '../lib/costos';
import { formatoFechaHora, inicioDelDia, mismoDia, useDinero } from '../lib/formato';
import { estadoSuscripcion } from '../lib/suscripcion';
import DatosPago from '../components/DatosPago';
import { aFechaPedido, saldoDe } from './Pedidos';

const ACTIVOS = ['nuevo', 'confirmado', 'preparacion', 'listo'];

export default function Inicio() {
  const { perfil, empresa } = useAuth();
  const { t, fecha } = useI18n();
  const sus = estadoSuscripcion(empresa);
  const veCobro = perfil.rol === 'dueno' || perfil.rol === 'admin';
  const enPrueba = sus.estado === 'prueba';
  const esPasteleria = empresa.vertical === 'pasteleria';

  return (
    <>
      <h1>{t('home.hello', { nombre: perfil.nombre })}</h1>
      <p className="suave">
        {t(`role.${perfil.rol}`)} · {t(`vertical.${empresa.vertical}`)}
      </p>

      {esPasteleria ? (
        <Panel esGestor={veCobro} />
      ) : (
        <section className="tarjeta">
          <p>{t('home.soonSecurity')}</p>
        </section>
      )}

      {veCobro && (
        <section className="tarjeta">
          <h2>{t('home.status')}</h2>
          <p>
            <span className={`insignia ${sus.estado}`}>{t(`state.${sus.estado}`)}</span>
          </p>
          <p>
            {t('home.daysLeft', { n: sus.dias })}
            {sus.fin && <span className="suave"> · {t('home.until', { fecha: fecha(sus.fin) })}</span>}
          </p>
          {enPrueba && <p className="suave">{t('company.intro')}</p>}
        </section>
      )}

      {veCobro && <DatosPago empresa={empresa} />}
    </>
  );
}

// Números del día a día de la pastelería.
function Panel({ esGestor }) {
  const { t, lang } = useI18n();
  const dinero = useDinero();
  const { pedidos, insumos, cargando } = useDatos();
  if (cargando) return null;

  const ahora = new Date();
  const hoy = pedidos.filter((p) => p.estado !== 'cancelado' && aFechaPedido(p) && mismoDia(aFechaPedido(p), ahora));
  const hoyPendientes = hoy.filter((p) => p.estado !== 'entregado');
  const proximos = pedidos
    .filter((p) => ACTIVOS.includes(p.estado) && aFechaPedido(p) >= inicioDelDia())
    .sort((a, b) => aFechaPedido(a) - aFechaPedido(b))
    .slice(0, 5);
  const atrasados = pedidos.filter((p) => ACTIVOS.includes(p.estado) && aFechaPedido(p) < inicioDelDia()).length;
  const porCobrar = pedidos.filter((p) => p.estado !== 'cancelado').reduce((s, p) => s + saldoDe(p), 0);
  const bajos = insumos.filter((i) => estadoStock(i) !== 'ok').sort((a, b) => a.nombre.localeCompare(b.nombre));

  const delMes = pedidos.filter(
    (p) => p.estado === 'entregado' && aFechaPedido(p)?.getMonth() === ahora.getMonth() && aFechaPedido(p)?.getFullYear() === ahora.getFullYear(),
  );
  const ventas = delMes.reduce((s, p) => s + aNumero(p.total), 0);
  const costos = delMes.reduce(
    (s, p) =>
      s +
      (p.items || []).reduce((x, it) => x + aNumero(it.cantidad) * aNumero(it.costo), 0) +
      (p.tipoEntrega === 'envio' ? aNumero(p.envioCosto) : 0),
    0,
  );

  return (
    <>
      <div className="fila envolver acciones-rapidas">
        <Link className="boton" to="/pedidos?nuevo=1">
          {t('orders.new')}
        </Link>
        <Link className="boton secundario" to="/entregas">
          {t('deliv.title')}
        </Link>
      </div>

      <div className="metricas">
        <Link to="/entregas" className="metrica">
          <span className="suave">{t('home.today')}</span>
          <strong>{hoyPendientes.length}</strong>
          <span className="suave">{t('home.todayDetail', { n: hoy.length })}</span>
        </Link>
        <Link to="/pedidos" className="metrica">
          <span className="suave">{t('home.toCollect')}</span>
          <strong>{dinero(porCobrar)}</strong>
        </Link>
        <Link to="/stock" className="metrica">
          <span className="suave">{t('home.lowStock')}</span>
          <strong>{bajos.length}</strong>
        </Link>
        {esGestor && (
          <div className="metrica">
            <span className="suave">{t('home.monthSales')}</span>
            <strong>{dinero(ventas)}</strong>
            <span className="suave">
              {t('home.monthProfit')}: {dinero(ventas - costos)}
            </span>
          </div>
        )}
      </div>

      {atrasados > 0 && (
        <Link to="/pedidos" className="aviso error banda-enlace">
          {t('home.overdue', { n: atrasados })}
        </Link>
      )}

      <section className="tarjeta">
        <h2>{t('home.upcoming')}</h2>
        {proximos.length === 0 && <p className="suave">{t('home.noUpcoming')}</p>}
        <ul className="lista">
          {proximos.map((p) => (
            <li key={p.id}>
              <Link to="/pedidos">
                #{p.numero} · {p.clienteNombre}
              </Link>
              <span className="suave">
                {formatoFechaHora(aFechaPedido(p), lang)} · {t(`orders.state.${p.estado}`)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {bajos.length > 0 && (
        <section className="tarjeta">
          <h2>{t('home.lowStock')}</h2>
          <ul className="lista">
            {bajos.slice(0, 6).map((i) => (
              <li key={i.id}>
                <span>{i.nombre}</span>
                <span className={`insignia stock-${estadoStock(i)}`}>{formatearCantidad(i.stock, i.unidad, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
