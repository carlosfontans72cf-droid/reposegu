import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { iniciarRonda, leerPosicion, marcarPunto, terminarRonda } from '../../lib/segServicios';
import { hora } from '../../lib/segFormato';
import { resumenRonda, siguientePunto } from '../../lib/seguridad.js';
import { Aviso, Cargando } from '../../components/ui';

// Ronda del guardia: recorre los puntos del puesto y marca cada uno (con su ubicación).
export default function Rondas() {
  const { perfil, empresa } = useAuth();
  const { puestos, asistenciaAbierta, rondaAbierta, cargando } = useSeg();
  const { t, lang } = useI18n();
  const [ocupado, setOcupado] = useState('');
  const [msg, setMsg] = useState('');

  if (cargando) return <Cargando />;
  if (!asistenciaAbierta && !rondaAbierta) {
    return (
      <>
        <h1>{t('seg.round.title')}</h1>
        <p className="aviso error">{t('seg.round.needClockIn')}</p>
        <Link className="boton" to="/">
          {t('nav.home')}
        </Link>
      </>
    );
  }

  const ejecutar = async (clave, fn) => {
    setOcupado(clave);
    setMsg('');
    try {
      await fn();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado('');
    }
  };

  // ---- ronda en curso ----
  if (rondaAbierta) {
    const r = rondaAbierta;
    const resumen = resumenRonda(r.plan, r.marcas);
    const sig = siguientePunto(r.plan, r.marcas);
    const hechos = new Map((r.marcas || []).map((m) => [m.puntoId, m]));

    const marcar = (p) =>
      ejecutar(p.id, async () => {
        const pos = await leerPosicion({ espera: 6000 });
        await marcarPunto(empresa.id, r.id, p, pos);
      });

    const cerrar = () => {
      if (!resumen.completa && !window.confirm(t('seg.round.finishIncomplete', { n: resumen.faltan.length }))) return;
      return ejecutar('fin', () => terminarRonda(empresa.id, r.id, resumen.completa));
    };

    return (
      <>
        <h1>{t('seg.round.title')}</h1>
        <p className="suave">
          {r.puestoNombre} · {t('seg.round.progress', { a: resumen.cumplidos, b: resumen.total })}
        </p>
        <div className="barra" aria-hidden="true">
          <span style={{ width: `${resumen.total ? (resumen.cumplidos / resumen.total) * 100 : 0}%` }} />
        </div>
        {resumen.total === 0 && <p className="aviso error">{t('seg.round.noPoints')}</p>}
        <ol className="puntos-ronda">
          {r.plan.map((p) => {
            const m = hechos.get(p.id);
            return (
              <li key={p.id} className={m ? 'hecho' : p.id === sig?.id ? 'siguiente' : ''}>
                <div>
                  <strong>{p.nombre}</strong>
                  {m && (
                    <div className="suave">
                      ✓ {hora(m.en, lang)}
                      {m.pos ? ` · ${t('seg.round.located')}` : ` · ${t('seg.round.noGps')}`}
                    </div>
                  )}
                </div>
                {!m && (
                  <button type="button" className={`boton ${p.id === sig?.id ? '' : 'secundario'}`} disabled={Boolean(ocupado)} onClick={() => marcar(p)}>
                    {ocupado === p.id ? t('seg.me.locating') : t('seg.round.mark')}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
        <Aviso tipo="error">{msg}</Aviso>
        <button type="button" className="boton grande" onClick={cerrar} disabled={Boolean(ocupado)}>
          {resumen.completa ? t('seg.round.finish') : t('seg.round.finishEarly')}
        </button>
      </>
    );
  }

  // ---- elegir puesto y empezar ----
  const conPuntos = puestos.filter((p) => p.activo !== false && (p.puntos || []).length > 0);
  const preferido = conPuntos.find((p) => p.id === asistenciaAbierta?.puestoId);
  const lista = preferido ? [preferido, ...conPuntos.filter((p) => p.id !== preferido.id)] : conPuntos;

  return (
    <>
      <h1>{t('seg.round.title')}</h1>
      <p className="suave">{t('seg.round.help')}</p>
      {lista.length === 0 && <p className="suave">{t('seg.round.noPosts')}</p>}
      {lista.map((p) => (
        <section key={p.id} className="tarjeta">
          <div className="dato">
            <div>
              <strong>{p.nombre}</strong>
              <div className="suave">{t('seg.post.pointsCount', { n: p.puntos.length })}</div>
            </div>
            <button
              type="button"
              className="boton"
              disabled={Boolean(ocupado)}
              onClick={() => ejecutar(p.id, () => iniciarRonda(empresa.id, perfil, p))}
            >
              {t('seg.round.start')}
            </button>
          </div>
        </section>
      ))}
      <Aviso tipo="error">{msg}</Aviso>
    </>
  );
}
