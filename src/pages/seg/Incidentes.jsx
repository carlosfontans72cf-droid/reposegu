import { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { actualizarIncidente, crearIncidente, leerPosicion } from '../../lib/segServicios';
import { diaHora } from '../../lib/segFormato';
import { enlaceMapaCoord, ESTADOS_INCIDENTE, GRAVEDADES, ordenarIncidentes, TIPOS_INCIDENTE } from '../../lib/seguridad.js';
import { Aviso, Campo, Cargando } from '../../components/ui';

// Incidentes: el guardia los reporta (con fotos o video) y dueño/administrador los revisan.
export default function Incidentes({ esGestor }) {
  const { incidentes, cargando } = useSeg();
  const { t } = useI18n();
  const [nuevo, setNuevo] = useState(false);
  const [filtro, setFiltro] = useState('pendientes');

  if (cargando) return <Cargando />;
  let lista = ordenarIncidentes(incidentes);
  if (esGestor && filtro === 'pendientes') lista = lista.filter((i) => i.estado !== 'cerrado');

  return (
    <>
      <div className="encabezado">
        <h1>{t('seg.inc.title')}</h1>
        {!esGestor && (
          <button type="button" className="boton" onClick={() => setNuevo(!nuevo)}>
            {nuevo ? t('common.cancel') : t('seg.inc.new')}
          </button>
        )}
      </div>
      {!esGestor && nuevo && <FormIncidente onListo={() => setNuevo(false)} />}
      {esGestor && (
        <div className="fila filtros">
          {['pendientes', 'todos'].map((f) => (
            <button key={f} type="button" className={`boton ${filtro === f ? '' : 'secundario'}`} onClick={() => setFiltro(f)}>
              {t(`seg.inc.filter.${f}`)}
            </button>
          ))}
        </div>
      )}
      {lista.length === 0 && !nuevo && <p className="suave">{t('seg.inc.empty')}</p>}
      {lista.map((i) => (
        <TarjetaIncidente key={i.id} inc={i} esGestor={esGestor} />
      ))}
    </>
  );
}

function TarjetaIncidente({ inc, esGestor }) {
  const { t, lang } = useI18n();
  const { empresa } = useAuth();
  const [nota, setNota] = useState(inc.notaGestion || '');
  const [msg, setMsg] = useState('');
  const mapa = inc.pos ? enlaceMapaCoord(inc.pos.lat, inc.pos.lng) : null;

  const cambiar = async (estado) => {
    setMsg('');
    try {
      await actualizarIncidente(empresa.id, inc.id, { estado, notaGestion: nota });
    } catch {
      setMsg(t('common.error'));
    }
  };

  return (
    <section className={`tarjeta incidente grave-${inc.gravedad}`}>
      <div className="dato">
        <div>
          <strong>{t(`seg.inc.type.${inc.tipo}`)}</strong>{' '}
          <span className={`insignia grav-${inc.gravedad}`}>{t(`seg.inc.sev.${inc.gravedad}`)}</span>{' '}
          <span className="insignia">{t(`seg.inc.state.${inc.estado}`)}</span>
          <div className="suave">
            {inc.nombre}
            {inc.puestoNombre && ` · ${inc.puestoNombre}`} · {diaHora(inc.creadoEn, lang)}
          </div>
        </div>
      </div>
      <p>{inc.descripcion}</p>
      {(inc.fotos?.length > 0 || inc.video) && (
        <div className="galeria">
          {(inc.fotos || []).map((u) => (
            <a key={u} href={u} target="_blank" rel="noreferrer">
              <img src={u} alt={t('seg.inc.photo')} loading="lazy" />
            </a>
          ))}
          {inc.video && <video src={inc.video} controls preload="none" playsInline />}
        </div>
      )}
      {mapa && (
        <a href={mapa} target="_blank" rel="noreferrer">
          {t('seg.alert.openMaps')}
        </a>
      )}
      {inc.notaGestion && !esGestor && (
        <p className="suave">
          {t('seg.inc.managerNote')}: {inc.notaGestion}
        </p>
      )}
      {esGestor && (
        <>
          <Campo etiqueta={t('seg.inc.managerNote')}>
            <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} />
          </Campo>
          <div className="fila">
            {ESTADOS_INCIDENTE.filter((e) => e !== inc.estado).map((e) => (
              <button key={e} type="button" className="boton secundario" onClick={() => cambiar(e)}>
                {t(`seg.inc.mark.${e}`)}
              </button>
            ))}
            {nota !== (inc.notaGestion || '') && (
              <button type="button" className="boton" onClick={() => cambiar(inc.estado)}>
                {t('seg.inc.saveNote')}
              </button>
            )}
          </div>
        </>
      )}
      <Aviso tipo="error">{msg}</Aviso>
    </section>
  );
}

function FormIncidente({ onListo }) {
  const { t } = useI18n();
  const { perfil, empresa } = useAuth();
  const { asistenciaAbierta, puestos } = useSeg();
  const [tipo, setTipo] = useState('sospechoso');
  const [gravedad, setGravedad] = useState('media');
  const [descripcion, setDescripcion] = useState('');
  const [puestoId, setPuestoId] = useState(asistenciaAbierta?.puestoId || '');
  const [fotos, setFotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [msg, setMsg] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const elegirFotos = (e) => setFotos(Array.from(e.target.files || []).slice(0, 4));
  const elegirVideo = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 50 * 1024 * 1024) {
      setMsg(t('seg.inc.videoTooBig'));
      e.target.value = '';
      return;
    }
    setMsg('');
    setVideo(f);
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    setOcupado(true);
    setMsg('');
    try {
      const pos = await leerPosicion({ espera: 5000 });
      const puesto = puestos.find((p) => p.id === puestoId);
      await crearIncidente(
        empresa.id,
        perfil,
        { tipo, gravedad, descripcion, puestoId: puesto?.id || null, puestoNombre: puesto?.nombre || asistenciaAbierta?.puestoNombre || '', pos },
        { fotos, video },
      );
      onListo();
    } catch {
      setMsg(t('common.error'));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form className="tarjeta formulario" onSubmit={enviar}>
      <div className="dos">
        <Campo etiqueta={t('seg.inc.kind')}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_INCIDENTE.map((x) => (
              <option key={x} value={x}>
                {t(`seg.inc.type.${x}`)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta={t('seg.inc.severity')}>
          <select value={gravedad} onChange={(e) => setGravedad(e.target.value)}>
            {GRAVEDADES.map((x) => (
              <option key={x} value={x}>
                {t(`seg.inc.sev.${x}`)}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <Campo etiqueta={t('seg.shift.post')}>
        <select value={puestoId} onChange={(e) => setPuestoId(e.target.value)}>
          <option value="">—</option>
          {puestos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta={t('seg.inc.description')}>
        <textarea rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required maxLength={2000} />
      </Campo>
      <Campo etiqueta={t('seg.inc.photos')} ayuda={t('seg.inc.photosHelp')}>
        <input type="file" accept="image/*" multiple onChange={elegirFotos} />
      </Campo>
      <Campo etiqueta={t('seg.inc.video')} ayuda={t('seg.inc.videoHelp')}>
        <input type="file" accept="video/*" onChange={elegirVideo} />
      </Campo>
      <p className="suave">{t('seg.inc.locationNote')}</p>
      <Aviso tipo="error">{msg}</Aviso>
      <button className="boton grande" disabled={ocupado}>
        {ocupado ? t('seg.inc.sending') : t('seg.inc.send')}
      </button>
    </form>
  );
}
