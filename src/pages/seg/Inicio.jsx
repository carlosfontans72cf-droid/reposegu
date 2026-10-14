import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { leerPosicion, marcarEntrada, marcarSalida } from '../../lib/segServicios';
import { diaHora, hora, inicioDiaMs, useAhora } from '../../lib/segFormato';
import {
  atrasoMinutos,
  cobertura,
  estadoHabilitacion,
  formatoDuracion,
  minutosTrabajados,
  tieneSinLeer,
  turnoParaEntrada,
} from '../../lib/seguridad.js';
import { Aviso, Cargando } from '../../components/ui';

export default function InicioSeg({ esGestor }) {
  const { cargando, fallo } = useSeg();
  const { t } = useI18n();
  if (cargando) return <Cargando />;
  return (
    <>
      {fallo && <Aviso tipo="error">{t('common.error')}</Aviso>}
      {esGestor ? <PanelGestor /> : <PanelGuardia />}
    </>
  );
}

// ---------- Guardia ----------

function PanelGuardia() {
  const { perfil, empresa } = useAuth();
  const { turnos, asistenciaAbierta, rondaAbierta, chatPropio, puestosPorId } = useSeg();
  const { t, lang } = useI18n();
  const ahora = useAhora(30000);
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState('');
  const hoy = inicioDiaMs(ahora);

  const mios = turnos
    .filter((x) => x.fin > ahora - 3600000 && x.inicio < hoy + 2 * 86400000)
    .sort((a, b) => a.inicio - b.inicio);
  const proximo = turnoParaEntrada(mios, ahora);
  const turnoActual = asistenciaAbierta ? turnos.find((x) => x.id === asistenciaAbierta.turnoId) : null;
  const puesto = puestosPorId[(turnoActual || proximo)?.puestoId];

  const entrar = async () => {
    if (!proximo && !window.confirm(t('seg.me.noShiftConfirm'))) return;
    setOcupado(true);
    setMsg('');
    try {
      const pos = await leerPosicion();
      await marcarEntrada(empresa.id, perfil, { turno: proximo, pos });
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  const salir = async () => {
    if (rondaAbierta && !window.confirm(t('seg.me.roundOpenConfirm'))) return;
    setOcupado(true);
    setMsg('');
    try {
      const pos = await leerPosicion();
      await marcarSalida(empresa.id, asistenciaAbierta.id, pos);
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  const enCurso = asistenciaAbierta;
  const minutos = enCurso ? minutosTrabajados(enCurso.entrada, ahora) : 0;

  return (
    <>
      <h1>{t('home.hello', { nombre: perfil.nombre })}</h1>
      <p className="suave">{t('seg.me.subtitle')}</p>

      <section className={`tarjeta jornada ${enCurso ? 'activa' : ''}`}>
        {enCurso ? (
          <>
            <h2>{t('seg.me.onDuty')}</h2>
            <p>
              <strong>{enCurso.puestoNombre || t('seg.me.noPost')}</strong>
              <br />
              <span className="suave">
                {t('seg.me.since', { hora: hora(enCurso.entrada, lang) })} · {formatoDuracion(minutos)}
              </span>
            </p>
            <p className="suave">{t('seg.me.trackingOn')}</p>
            {puesto?.instrucciones && (
              <details>
                <summary>{t('seg.me.instructions')}</summary>
                <p>{puesto.instrucciones}</p>
              </details>
            )}
            <div className="fila">
              <Link className="boton" to="/rondas">
                {rondaAbierta ? t('seg.me.continueRound') : t('seg.me.round')}
              </Link>
              <Link className="boton secundario" to="/incidentes">
                {t('seg.me.report')}
              </Link>
            </div>
            <button type="button" className="boton secundario grande" onClick={salir} disabled={ocupado}>
              {ocupado ? t('seg.me.locating') : t('seg.me.clockOut')}
            </button>
          </>
        ) : (
          <>
            <h2>{t('seg.me.offDuty')}</h2>
            {proximo ? (
              <p>
                {t('seg.me.next')}: <strong>{proximo.puestoNombre}</strong>
                <br />
                <span className="suave">
                  {diaHora(proximo.inicio, lang)} – {hora(proximo.fin, lang)}
                </span>
              </p>
            ) : (
              <p className="suave">{t('seg.me.noShifts')}</p>
            )}
            <p className="suave">{t('seg.me.trackingHelp')}</p>
            <button type="button" className="boton grande" onClick={entrar} disabled={ocupado}>
              {ocupado ? t('seg.me.locating') : t('seg.me.clockIn')}
            </button>
          </>
        )}
        <Aviso tipo="error">{msg}</Aviso>
      </section>

      <section className="tarjeta">
        <h2>{t('seg.me.myShifts')}</h2>
        {mios.length === 0 && <p className="suave">{t('seg.me.noShifts')}</p>}
        {mios.map((x) => (
          <div key={x.id} className="dato">
            <div>
              <strong>{x.puestoNombre}</strong>
              <div className="suave">
                {diaHora(x.inicio, lang)} – {hora(x.fin, lang)}
              </div>
              {x.notas && <div className="suave">{x.notas}</div>}
            </div>
          </div>
        ))}
      </section>

      <Link to="/chat" className="tarjeta enlace-tarjeta">
        <strong>
          {t('seg.nav.chat')}
          {tieneSinLeer(chatPropio, 'guardia') && <span className="insignia bloqueada"> {t('seg.chat.unread')}</span>}
        </strong>
        <span className="suave">{chatPropio?.ultimoTexto || t('seg.chat.guardHelp')}</span>
      </Link>
    </>
  );
}

// ---------- Dueño / administrador ----------

function PanelGestor() {
  const { perfil } = useAuth();
  const { turnos, asistencias, incidentes, guardias, personalPorId, chats, alertasActivas } = useSeg();
  const { t, lang } = useI18n();
  const ahora = useAhora(30000);
  const hoy = inicioDiaMs(ahora);

  const deHoy = turnos.filter((x) => x.inicio < hoy + 86400000 && x.fin > hoy).sort((a, b) => a.inicio - b.inicio);
  const sinCubrir = deHoy.filter((x) => cobertura(x).faltan > 0);
  const faltan = sinCubrir.reduce((n, x) => n + cobertura(x).faltan, 0);
  const enServicio = asistencias.filter((a) => a.abierta);
  const abiertos = incidentes.filter((i) => i.estado === 'abierto');
  const sinLeer = chats.filter((c) => tieneSinLeer(c, 'gestion'));
  const habs = guardias
    .map((g) => ({ g, e: estadoHabilitacion(personalPorId[g.id]?.habilitacionVence ?? null, ahora) }))
    .filter((x) => x.e === 'vencida' || x.e === 'porvencer');
  // Turnos que ya empezaron y todavía no tienen la entrada de alguno de sus guardias.
  const tarde = [];
  for (const x of deHoy) {
    if (x.inicio > ahora - 10 * 60000 || x.fin < ahora) continue;
    for (const uid of x.guardias || []) {
      const marco = asistencias.some((a) => a.uid === uid && (a.turnoId === x.id || (a.entrada >= x.inicio - 3 * 3600000 && a.entrada < x.fin)));
      if (!marco) tarde.push({ x, uid });
    }
  }
  const nombre = (uid) => guardias.find((g) => g.id === uid)?.nombre || '—';

  return (
    <>
      <h1>{t('home.hello', { nombre: perfil.nombre })}</h1>
      <p className="suave">
        {t(`role.${perfil.rol}`)} · {t('vertical.seguridad')}
      </p>

      {alertasActivas.length > 0 && (
        <p className="aviso error" role="alert">
          🚨 {t('seg.home.activeAlerts', { n: alertasActivas.length })}
        </p>
      )}

      <div className="cifras">
        <Link to="/mapa" className="cifra">
          <strong>{enServicio.length}</strong>
          <span>{t('seg.home.onDuty')}</span>
        </Link>
        <Link to="/turnos" className={`cifra ${faltan > 0 ? 'mal' : ''}`}>
          <strong>{faltan}</strong>
          <span>{t('seg.home.missing')}</span>
        </Link>
        <Link to="/incidentes" className={`cifra ${abiertos.length > 0 ? 'mal' : ''}`}>
          <strong>{abiertos.length}</strong>
          <span>{t('seg.home.openIncidents')}</span>
        </Link>
        <Link to="/chat" className={`cifra ${sinLeer.length > 0 ? 'mal' : ''}`}>
          <strong>{sinLeer.length}</strong>
          <span>{t('seg.home.unreadChats')}</span>
        </Link>
      </div>

      <section className="tarjeta">
        <div className="encabezado">
          <h2>{t('seg.home.today')}</h2>
          <Link className="boton secundario" to="/turnos">
            {t('seg.nav.shifts')}
          </Link>
        </div>
        {deHoy.length === 0 && <p className="suave">{t('seg.shift.empty')}</p>}
        {deHoy.map((x) => {
          const c = cobertura(x);
          return (
            <div key={x.id} className="dato">
              <div>
                <strong>{x.puestoNombre}</strong>
                <div className="suave">
                  {hora(x.inicio, lang)} – {hora(x.fin, lang)}
                </div>
              </div>
              <span className={`insignia cob-${c.estado}`}>
                {c.asignados}/{c.requeridos}
              </span>
            </div>
          );
        })}
      </section>

      {tarde.length > 0 && (
        <section className="tarjeta">
          <h2>{t('seg.home.notClockedIn')}</h2>
          {tarde.map(({ x, uid }) => (
            <div key={`${x.id}${uid}`} className="dato">
              <div>
                <strong>{nombre(uid)}</strong>
                <div className="suave">
                  {x.puestoNombre} · {t('seg.home.since', { hora: hora(x.inicio, lang), min: atrasoMinutos(ahora, x.inicio, 0) })}
                </div>
              </div>
              <Link className="boton secundario" to={`/chat/${uid}`}>
                {t('seg.nav.chat')}
              </Link>
            </div>
          ))}
        </section>
      )}

      {enServicio.length > 0 && (
        <section className="tarjeta">
          <h2>{t('seg.home.onDuty')}</h2>
          {enServicio.map((a) => {
            return (
              <div key={a.id} className="dato">
                <div>
                  <strong>{a.nombre}</strong>
                  <div className="suave">
                    {a.puestoNombre || '—'} · {t('seg.me.since', { hora: hora(a.entrada, lang) })} ·{' '}
                    {formatoDuracion(minutosTrabajados(a.entrada, ahora))}
                  </div>
                </div>
                <div className="fila">
                  <Link className="boton secundario" to={`/mapa?uid=${a.uid}`}>
                    {t('seg.nav.map')}
                  </Link>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {habs.length > 0 && (
        <section className="tarjeta">
          <h2>{t('seg.home.licenses')}</h2>
          {habs.map(({ g, e }) => (
            <div key={g.id} className="dato">
              <strong>{g.nombre}</strong>
              <span className={`insignia hab-${e}`}>{t(`seg.staff.lic.${e}`)}</span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
