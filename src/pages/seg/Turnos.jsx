import { useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { borrarTurno, guardarTurno, repetirTurno } from '../../lib/segServicios';
import { aInputFecha, aInputHora, deInputFecha, diaLargo, fechaYHora, hora, inicioDiaMs } from '../../lib/segFormato';
import { cobertura, conflictosDeTurno, habilitacionAlDia, iniciales } from '../../lib/seguridad.js';
import { Aviso, Campo, Cargando } from '../../components/ui';

const DIA = 86400000;

// Agenda de turnos por día. Cada turno dice cuántos guardias necesita (puede ser 10 un día y
// 50 al siguiente) y quiénes están asignados.
export default function Turnos() {
  const { turnos, puestos, cargando } = useSeg();
  const { t, lang } = useI18n();
  const [dia, setDia] = useState(() => inicioDiaMs(Date.now()));
  const [editando, setEditando] = useState(null); // 'nuevo' | id

  const delDia = useMemo(
    () =>
      turnos
        .filter((x) => x.inicio < dia + DIA && x.fin > dia)
        .sort((a, b) => a.inicio - b.inicio || String(a.puestoNombre).localeCompare(String(b.puestoNombre))),
    [turnos, dia],
  );

  if (cargando) return <Cargando />;
  const hoy = inicioDiaMs(Date.now());
  const faltantes = delDia.reduce((n, x) => n + cobertura(x).faltan, 0);

  return (
    <>
      <div className="encabezado">
        <h1>{t('seg.shift.title')}</h1>
        <button type="button" className="boton" onClick={() => setEditando(editando ? null : 'nuevo')} disabled={puestos.length === 0}>
          {editando ? t('common.cancel') : t('seg.shift.new')}
        </button>
      </div>
      {puestos.length === 0 && <p className="aviso error">{t('seg.shift.needPosts')}</p>}

      <div className="selector-dia">
        <button type="button" className="boton secundario" onClick={() => setDia(dia - DIA)} aria-label={t('seg.shift.prevDay')}>
          ‹
        </button>
        <div>
          <strong>{diaLargo(dia, lang)}</strong>
          <input
            type="date"
            value={aInputFecha(dia)}
            onChange={(e) => e.target.value && setDia(deInputFecha(e.target.value))}
            aria-label={t('seg.shift.pickDay')}
          />
        </div>
        <button type="button" className="boton secundario" onClick={() => setDia(dia + DIA)} aria-label={t('seg.shift.nextDay')}>
          ›
        </button>
      </div>
      {dia !== hoy && (
        <button type="button" className="boton texto" onClick={() => setDia(hoy)}>
          {t('common.today')}
        </button>
      )}

      {delDia.length > 0 && (
        <p className={faltantes > 0 ? 'aviso error' : 'aviso ok'}>
          {faltantes > 0 ? t('seg.shift.missingTotal', { n: faltantes }) : t('seg.shift.allCovered')}
        </p>
      )}

      {editando === 'nuevo' && <FormTurno dia={dia} onListo={() => setEditando(null)} />}
      {delDia.length === 0 && editando !== 'nuevo' && <p className="suave">{t('seg.shift.empty')}</p>}

      {delDia.map((x) =>
        editando === x.id ? (
          <FormTurno key={x.id} turno={x} dia={dia} onListo={() => setEditando(null)} />
        ) : (
          <TarjetaTurno key={x.id} turno={x} onEditar={() => setEditando(x.id)} />
        ),
      )}
    </>
  );
}

function TarjetaTurno({ turno, onEditar }) {
  const { t, lang } = useI18n();
  const { empresa } = useAuth();
  const { equipoPorId } = useSeg();
  const [msg, setMsg] = useState('');
  const c = cobertura(turno);
  const cruza = inicioDiaMs(turno.inicio) !== inicioDiaMs(turno.fin - 1);

  const borrar = async () => {
    if (!window.confirm(t('common.confirmDelete', { nombre: turno.puestoNombre }))) return;
    try {
      await borrarTurno(empresa.id, turno.id);
    } catch {
      setMsg(t('common.error'));
    }
  };

  return (
    <section className="tarjeta turno">
      <div className="dato">
        <div>
          <strong>{turno.puestoNombre}</strong>
          <div>
            {hora(turno.inicio, lang)} – {hora(turno.fin, lang)}
            {cruza && <span className="suave"> {t('seg.shift.nextDayEnd')}</span>}
          </div>
        </div>
        <span className={`insignia cob-${c.estado}`}>
          {c.asignados}/{c.requeridos} · {t(`seg.shift.cov.${c.estado}`)}
        </span>
      </div>
      {c.faltan > 0 && <p className="suave">{t('seg.shift.missing', { n: c.faltan })}</p>}
      <div className="chips">
        {(turno.guardias || []).map((uid) => (
          <span key={uid} className="chip">
            <span className="avatar chico" aria-hidden="true">
              {iniciales(equipoPorId[uid]?.nombre)}
            </span>
            {equipoPorId[uid]?.nombre || t('seg.shift.unknownGuard')}
          </span>
        ))}
      </div>
      {turno.notas && <p className="suave">{turno.notas}</p>}
      <div className="fila">
        <button type="button" className="boton secundario" onClick={onEditar}>
          {t('common.edit')}
        </button>
        <button type="button" className="boton texto peligro" onClick={borrar}>
          {t('common.delete')}
        </button>
      </div>
      <Aviso tipo="error">{msg}</Aviso>
    </section>
  );
}

function FormTurno({ turno, dia, onListo }) {
  const { t, lang, fecha } = useI18n();
  const { empresa } = useAuth();
  const { puestos, guardias, turnos, personalPorId } = useSeg();
  const base = turno ? inicioDiaMs(turno.inicio) : dia;
  const [puestoId, setPuestoId] = useState(turno?.puestoId || puestos.find((p) => p.activo !== false)?.id || puestos[0]?.id || '');
  const [fechaIni, setFechaIni] = useState(aInputFecha(base));
  const [desde, setDesde] = useState(turno ? aInputHora(turno.inicio) : '08:00');
  const [hasta, setHasta] = useState(turno ? aInputHora(turno.fin) : '16:00');
  const [requeridos, setRequeridos] = useState(turno?.requeridos ?? 2);
  const [asignados, setAsignados] = useState(turno?.guardias || []);
  const [notas, setNotas] = useState(turno?.notas || '');
  const [repetir, setRepetir] = useState('0');
  const [buscar, setBuscar] = useState('');
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const diaIni = deInputFecha(fechaIni) ?? base;
  const inicio = fechaYHora(diaIni, desde);
  let fin = fechaYHora(diaIni, hasta);
  if (fin <= inicio) fin += DIA; // termina al día siguiente (turno nocturno)
  const prop = { id: turno?.id, inicio, fin, guardias: asignados };

  const info = useMemo(() => {
    const m = {};
    for (const g of guardias) {
      const choques = conflictosDeTurno(prop, turnos, g.id);
      const vence = personalPorId[g.id]?.habilitacionVence ?? null;
      m[g.id] = { choques, habOk: habilitacionAlDia(vence, fin) };
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardias, turnos, personalPorId, inicio, fin, asignados]);

  const alternar = (uid) => setAsignados((l) => (l.includes(uid) ? l.filter((x) => x !== uid) : [...l, uid]));
  const visibles = guardias
    .filter((g) => g.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
    .sort((a, b) => Number(asignados.includes(b.id)) - Number(asignados.includes(a.id)) || a.nombre.localeCompare(b.nombre));
  const c = cobertura({ requeridos, guardias: asignados });
  const problemas = asignados.filter((u) => info[u]?.choques.length || info[u]?.habOk === false).length;

  const guardar = async (ev) => {
    ev.preventDefault();
    const puesto = puestos.find((p) => p.id === puestoId);
    if (!puesto) return setMsg(t('seg.shift.needPosts'));
    if (problemas > 0 && !window.confirm(t('seg.shift.confirmProblems', { n: problemas }))) return;
    setOcupado(true);
    setMsg('');
    try {
      const datos = { puestoId, puestoNombre: puesto.nombre, inicio, fin, requeridos, guardias: asignados, notas };
      await guardarTurno(empresa.id, datos, turno?.id);
      const n = Math.min(60, Number(repetir) || 0);
      if (!turno && n > 0) await repetirTurno(empresa.id, datos, Array.from({ length: n }, (_, i) => i + 1));
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={guardar}>
      <Campo etiqueta={t('seg.shift.post')}>
        <select value={puestoId} onChange={(e) => setPuestoId(e.target.value)} required>
          {puestos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
              {p.activo === false ? ` (${t('seg.post.inactive')})` : ''}
            </option>
          ))}
        </select>
      </Campo>
      <div className="tres">
        <Campo etiqueta={t('seg.shift.date')}>
          <input type="date" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)} required />
        </Campo>
        <Campo etiqueta={t('seg.shift.from')}>
          <input type="time" value={desde} onChange={(e) => setDesde(e.target.value)} required />
        </Campo>
        <Campo etiqueta={t('seg.shift.to')}>
          <input type="time" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
        </Campo>
      </div>
      {fin - inicio > DIA - 1 || fin > inicio + 16 * 3600000 ? <p className="suave">{t('seg.shift.long')}</p> : null}
      <div className="dos">
        <Campo etiqueta={t('seg.shift.required')} ayuda={t('seg.shift.requiredHelp')}>
          <input
            type="number"
            min="0"
            max="500"
            inputMode="numeric"
            value={requeridos}
            onChange={(e) => setRequeridos(Math.max(0, Math.min(500, Math.floor(Number(e.target.value) || 0))))}
          />
        </Campo>
        {!turno && (
          <Campo etiqueta={t('seg.shift.repeat')} ayuda={t('seg.shift.repeatHelp')}>
            <input type="number" min="0" max="60" inputMode="numeric" value={repetir} onChange={(e) => setRepetir(e.target.value)} />
          </Campo>
        )}
      </div>

      <div>
        <span className="etiqueta">
          {t('seg.shift.guards')} · {c.asignados}/{c.requeridos}
        </span>
        {guardias.length === 0 ? (
          <p className="suave">{t('seg.staff.empty')}</p>
        ) : (
          <>
            {guardias.length > 8 && (
              <input type="search" placeholder={t('common.search')} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            )}
            <ul className="lista-guardias">
              {visibles.map((g) => {
                const i = info[g.id] || { choques: [], habOk: true };
                const marcado = asignados.includes(g.id);
                return (
                  <li key={g.id}>
                    <label className="fila casilla">
                      <input type="checkbox" checked={marcado} onChange={() => alternar(g.id)} />
                      <span>
                        {g.nombre}
                        {i.choques.length > 0 && (
                          <small className="alerta-chica">
                            {' '}
                            · {t('seg.shift.overlap', { puesto: i.choques[0].puestoNombre, hora: hora(i.choques[0].inicio, lang) })}
                          </small>
                        )}
                        {!i.habOk && (
                          <small className="alerta-chica">
                            {' '}
                            · {t('seg.shift.licenseExpired', { fecha: fecha(new Date(personalPorId[g.id].habilitacionVence)) })}
                          </small>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {c.estado === 'excedido' && <p className="suave">{t('seg.shift.over')}</p>}
      </div>

      <Campo etiqueta={t('seg.shift.notes')}>
        <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={500} />
      </Campo>
      <Aviso tipo="error">{msg}</Aviso>
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
