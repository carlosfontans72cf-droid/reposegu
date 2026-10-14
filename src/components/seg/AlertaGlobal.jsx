import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { atenderAlerta } from '../../lib/segServicios';
import { enlaceMapaCoord, telefonoInternacional } from '../../lib/seguridad.js';
import { enlaceWhatsapp } from '../../lib/paises';

// Sirena corta hecha con WebAudio (no hay archivo de sonido que cargar).
function sirena(ctx) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.connect(g);
  g.connect(ctx.destination);
  const t0 = ctx.currentTime;
  for (let i = 0; i < 4; i += 1) {
    o.frequency.setValueAtTime(i % 2 ? 660 : 880, t0 + i * 0.25);
  }
  g.gain.setValueAtTime(0.12, t0);
  g.gain.setValueAtTime(0, t0 + 1);
  o.start(t0);
  o.stop(t0 + 1);
}

// Cartel rojo para dueño y administradores: aparece en cualquier pantalla mientras haya
// una alerta activa, con sonido y vibración. Solo funciona con la app abierta.
export default function AlertaGlobal() {
  const { perfil, empresa } = useAuth();
  const { alertasActivas } = useSeg();
  const { t, lang } = useI18n();
  const [silenciadas, setSilenciadas] = useState(() => new Set());
  const [error, setError] = useState('');
  const audio = useRef(null);

  const sonando = alertasActivas.filter((a) => !silenciadas.has(a.id));
  const hayParaSonar = sonando.length > 0;

  useEffect(() => {
    if (!hayParaSonar) return undefined;
    const tocar = () => {
      try {
        if (!audio.current) audio.current = new (window.AudioContext || window.webkitAudioContext)();
        audio.current.resume?.();
        sirena(audio.current);
        navigator.vibrate?.([300, 150, 300, 150, 300]);
      } catch {
        /* sin audio: queda el cartel visual */
      }
    };
    tocar();
    const i = setInterval(tocar, 3000);
    return () => clearInterval(i);
  }, [hayParaSonar]);

  // El título de la pestaña avisa aunque la app esté en segundo plano.
  useEffect(() => {
    if (alertasActivas.length === 0) return undefined;
    const original = document.title;
    let alterna = false;
    const i = setInterval(() => {
      alterna = !alterna;
      document.title = alterna ? `🚨 ${t('seg.alert.title')}` : original;
    }, 900);
    return () => {
      clearInterval(i);
      document.title = original;
    };
  }, [alertasActivas.length, t]);

  if (alertasActivas.length === 0) return null;

  const atender = async (a) => {
    try {
      await atenderAlerta(empresa.id, a.id, perfil);
    } catch {
      setError(t('common.error'));
    }
  };

  const hora = (ms) => new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' }).format(ms);

  return (
    <div className="alertas-globales" role="alert" aria-live="assertive">
      {alertasActivas.map((a) => {
        const mapa = a.pos ? enlaceMapaCoord(a.pos.lat, a.pos.lng) : null;
        const intl = telefonoInternacional(a.telefono, empresa.pais);
        const wa = intl ? enlaceWhatsapp(intl) : null;
        const llamar = intl ? `tel:+${intl}` : null;
        return (
          <section key={a.id} className={`alerta ${a.tipo}`}>
            <div className="alerta-cabecera">
              <strong>
                {a.tipo === 'panico' ? '🚨 ' : '⚠️ '}
                {a.tipo === 'panico' ? t('seg.alert.panic') : t('seg.alert.help')}
              </strong>
              <span>{hora(a.creadoEn)}</span>
            </div>
            <p>
              <strong>{a.nombre}</strong>
              {a.puestoNombre && ` · ${a.puestoNombre}`}
            </p>
            <div className="fila">
              {a.pos ? (
                <Link className="boton secundario" to={`/mapa?uid=${a.uid}`}>
                  {t('seg.alert.seeMap')}
                </Link>
              ) : (
                <span className="suave">{t('seg.alert.noLocation')}</span>
              )}
              {mapa && (
                <a className="boton secundario" href={mapa} target="_blank" rel="noreferrer">
                  {t('seg.alert.openMaps')}
                </a>
              )}
              {llamar && (
                <a className="boton secundario" href={llamar}>
                  {t('seg.alert.call')}
                </a>
              )}
              {wa && (
                <a className="boton secundario" href={wa} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              )}
              <Link className="boton secundario" to={`/chat/${a.uid}`}>
                {t('seg.nav.chat')}
              </Link>
            </div>
            <div className="fila">
              {!silenciadas.has(a.id) && (
                <button type="button" className="boton secundario" onClick={() => setSilenciadas((s) => new Set(s).add(a.id))}>
                  {t('seg.alert.mute')}
                </button>
              )}
              <button type="button" className="boton" onClick={() => atender(a)}>
                {t('seg.alert.attend')}
              </button>
            </div>
          </section>
        );
      })}
      {error && <p className="aviso error">{error}</p>}
    </div>
  );
}
