import { useMemo, useState } from 'react';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { diaHora, diaLargo, hora, inicioDiaMs, useAhora } from '../../lib/segFormato';
import { atrasoMinutos, enlaceMapaCoord, formatoDuracion, minutosTrabajados, resumenRonda } from '../../lib/seguridad.js';
import { Cargando } from '../../components/ui';

// Registro de asistencia y de rondas de los últimos 14 días.
export default function Asistencia() {
  const { asistencias, rondas, guardias, cargando } = useSeg();
  const { t, lang } = useI18n();
  const ahora = useAhora(60000);
  const [pestana, setPestana] = useState('asistencia');
  const [uid, setUid] = useState('');

  const filas = useMemo(() => asistencias.filter((a) => !uid || a.uid === uid), [asistencias, uid]);
  const rondasFiltradas = useMemo(() => rondas.filter((r) => !uid || r.uid === uid), [rondas, uid]);
  const horasPorGuardia = useMemo(() => {
    const m = {};
    for (const a of asistencias) m[a.uid] = (m[a.uid] || 0) + minutosTrabajados(a.entrada, a.salida ?? (a.abierta ? ahora : null));
    return m;
  }, [asistencias, ahora]);

  if (cargando) return <Cargando />;

  const agrupar = (lista, campo) => {
    const g = new Map();
    for (const x of lista) {
      const d = inicioDiaMs(x[campo]);
      if (!g.has(d)) g.set(d, []);
      g.get(d).push(x);
    }
    return [...g.entries()];
  };

  return (
    <>
      <h1>{t('seg.att.title')}</h1>
      <p className="suave">{t('seg.att.help')}</p>
      <div className="fila filtros">
        {['asistencia', 'rondas'].map((p) => (
          <button key={p} type="button" className={`boton ${pestana === p ? '' : 'secundario'}`} onClick={() => setPestana(p)}>
            {t(`seg.att.tab.${p}`)}
          </button>
        ))}
      </div>
      <select value={uid} onChange={(e) => setUid(e.target.value)} aria-label={t('seg.att.guard')}>
        <option value="">{t('seg.att.allGuards')}</option>
        {guardias.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nombre}
          </option>
        ))}
      </select>

      {pestana === 'asistencia' && (
        <>
          {!uid && Object.keys(horasPorGuardia).length > 0 && (
            <section className="tarjeta">
              <h2>{t('seg.att.hoursTitle')}</h2>
              {Object.entries(horasPorGuardia)
                .sort((a, b) => b[1] - a[1])
                .map(([u, min]) => (
                  <div key={u} className="dato">
                    <span>{guardias.find((g) => g.id === u)?.nombre || asistencias.find((a) => a.uid === u)?.nombre}</span>
                    <strong>{formatoDuracion(min)}</strong>
                  </div>
                ))}
            </section>
          )}
          {filas.length === 0 && <p className="suave">{t('seg.att.empty')}</p>}
          {agrupar(filas, 'entrada').map(([dia, lista]) => (
            <section key={dia} className="tarjeta">
              <h2>{diaLargo(dia, lang)}</h2>
              {lista.map((a) => {
                const atraso = atrasoMinutos(a.entrada, a.turnoInicio);
                const min = minutosTrabajados(a.entrada, a.salida ?? (a.abierta ? ahora : null));
                const mapaIn = a.entradaPos ? enlaceMapaCoord(a.entradaPos.lat, a.entradaPos.lng) : null;
                const mapaOut = a.salidaPos ? enlaceMapaCoord(a.salidaPos.lat, a.salidaPos.lng) : null;
                return (
                  <div key={a.id} className="dato">
                    <div>
                      <strong>{a.nombre}</strong>
                      <div className="suave">{a.puestoNombre || t('seg.me.noPost')}</div>
                      <div>
                        {hora(a.entrada, lang)} – {a.abierta ? t('seg.att.inProgress') : hora(a.salida, lang)} · {formatoDuracion(min)}
                      </div>
                      <div className="chips">
                        {atraso > 0 && <span className="insignia bloqueada">{t('seg.att.late', { n: atraso })}</span>}
                        {!a.turnoId && <span className="insignia">{t('seg.att.noShift')}</span>}
                        {mapaIn ? (
                          <a href={mapaIn} target="_blank" rel="noreferrer">
                            {t('seg.att.inPlace')}
                          </a>
                        ) : (
                          <span className="suave">{t('seg.att.noGpsIn')}</span>
                        )}
                        {mapaOut && (
                          <a href={mapaOut} target="_blank" rel="noreferrer">
                            {t('seg.att.outPlace')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}

      {pestana === 'rondas' && (
        <>
          {rondasFiltradas.length === 0 && <p className="suave">{t('seg.att.noRounds')}</p>}
          {agrupar(rondasFiltradas, 'inicio').map(([dia, lista]) => (
            <section key={dia} className="tarjeta">
              <h2>{diaLargo(dia, lang)}</h2>
              {lista.map((r) => {
                const res = resumenRonda(r.plan, r.marcas);
                return (
                  <div key={r.id} className="dato">
                    <div>
                      <strong>{r.nombre}</strong> · {r.puestoNombre}
                      <div className="suave">
                        {diaHora(r.inicio, lang)} {r.fin ? `– ${hora(r.fin, lang)}` : ''}
                      </div>
                      {res.faltan.length > 0 && r.estado === 'terminada' && (
                        <div className="suave">
                          {t('seg.att.skipped')}: {res.faltan.map((p) => p.nombre).join(', ')}
                        </div>
                      )}
                    </div>
                    <span className={`insignia ${r.estado === 'en_curso' ? 'prueba' : r.completa ? 'activa' : 'bloqueada'}`}>
                      {r.estado === 'en_curso' ? t('seg.att.inProgress') : r.completa ? t('seg.att.complete') : t('seg.att.incomplete')} ·{' '}
                      {res.cumplidos}/{res.total}
                    </span>
                  </div>
                );
              })}
            </section>
          ))}
        </>
      )}
    </>
  );
}
