import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { cancelarAlerta, enviarAlerta, leerPosicion } from '../../lib/segServicios';
import { telefonoInternacional } from '../../lib/seguridad.js';
import { Aviso } from '../ui';

const MANTENER_MS = 1200;

// Botón de emergencia del guardia, siempre visible. El pánico exige mantener apretado
// 1,2 segundos (evita toques sin querer); "necesito ayuda" es un aviso sin urgencia.
// Envía la ubicación en el momento y la alerta le llega a dueño y administradores.
export default function BotonSOS() {
  const { perfil, empresa } = useAuth();
  const { alertasActivas, miFicha, asistenciaAbierta } = useSeg();
  const { t } = useI18n();
  const [abierto, setAbierto] = useState(false);
  const [progreso, setProgreso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState('');
  const timer = useRef(null);
  const activa = alertasActivas[0] || null;

  useEffect(() => () => clearTimeout(timer.current), []);

  const enviar = async (tipo) => {
    setEnviando(true);
    setMsg('');
    try {
      const pos = await leerPosicion({ espera: 5000 });
      await enviarAlerta(empresa.id, perfil, {
        tipo,
        pos,
        telefono: miFicha?.telefono,
        puestoNombre: asistenciaAbierta?.puestoNombre,
      });
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch {
      setMsg(t('common.error'));
    } finally {
      setEnviando(false);
      setProgreso(false);
    }
  };

  const empezar = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (timer.current || enviando) return;
    setProgreso(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      enviar('panico');
    }, MANTENER_MS);
  };
  const soltar = () => {
    clearTimeout(timer.current);
    timer.current = null;
    if (!enviando) setProgreso(false);
  };

  const cancelar = async () => {
    try {
      await cancelarAlerta(empresa.id, activa.id);
      setAbierto(false);
    } catch {
      setMsg(t('common.error'));
    }
  };

  const base = telefonoInternacional(empresa.whatsapp, empresa.pais);
  const llamada = base ? `tel:+${base}` : null;

  return (
    <>
      <button
        type="button"
        className={`sos-flotante ${activa ? 'activa' : ''}`}
        onClick={() => setAbierto(true)}
        aria-label={t('seg.sos.open')}
      >
        SOS
      </button>

      {abierto && (
        <div className="hoja" role="dialog" aria-modal="true" aria-label={t('seg.sos.title')}>
          <div className="hoja-cuerpo">
            <h2>{activa ? t('seg.sos.sentTitle') : t('seg.sos.title')}</h2>

            {activa ? (
              <>
                <p>{activa.tipo === 'panico' ? t('seg.sos.sentPanic') : t('seg.sos.sentHelp')}</p>
                <p className="suave">{activa.pos ? t('seg.sos.withLocation') : t('seg.sos.noLocation')}</p>
                {llamada && (
                  <a className="boton grande" href={llamada}>
                    {t('seg.sos.callBase')}
                  </a>
                )}
                <button type="button" className="boton secundario" onClick={cancelar}>
                  {t('seg.sos.cancelAlert')}
                </button>
              </>
            ) : (
              <>
                <p className="suave">{t('seg.sos.help')}</p>
                <button
                  type="button"
                  className={`boton-panico ${progreso ? 'cargando' : ''}`}
                  style={{ '--mantener': `${MANTENER_MS}ms` }}
                  onPointerDown={empezar}
                  onPointerUp={soltar}
                  onPointerLeave={soltar}
                  onPointerCancel={soltar}
                  onKeyDown={empezar}
                  onKeyUp={soltar}
                  onContextMenu={(e) => e.preventDefault()}
                  disabled={enviando}
                >
                  <span className="relleno" aria-hidden="true" />
                  <strong>{enviando ? t('seg.sos.sending') : t('seg.sos.panic')}</strong>
                  <small>{t('seg.sos.hold')}</small>
                </button>
                <button type="button" className="boton secundario grande" disabled={enviando} onClick={() => enviar('ayuda')}>
                  {t('seg.sos.needHelp')}
                </button>
                <p className="suave">{t('seg.sos.warning')}</p>
              </>
            )}
            <Aviso tipo="error">{msg}</Aviso>
            <button type="button" className="boton texto" onClick={() => setAbierto(false)}>
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
