import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../../firebase';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { haceTiempo, useAhora } from '../../lib/segFormato';
import { enlaceMapaCoord, frescuraUbicacion, iniciales, leerDoc } from '../../lib/seguridad.js';
import { Aviso, Cargando } from '../../components/ui';

// Mapa en vivo (OpenStreetMap, sin clave). Cada guardia en servicio aparece con su última
// posición; los que tienen una alerta activa se marcan en rojo.
export default function MapaVivo() {
  const { empresa } = useAuth();
  const { alertasActivas, puestos } = useSeg();
  const { t, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  const elegido = params.get('uid');
  const [lista, setLista] = useState(null);
  const [error, setError] = useState(false);
  const ahora = useAhora(20000);
  const caja = useRef(null);
  const mapa = useRef(null);
  const capa = useRef(null);
  const encuadrado = useRef(false);

  // La ubicación se escucha solo con esta pantalla abierta (cuida las lecturas).
  useEffect(
    () =>
      onSnapshot(
        collection(db, 'empresas', empresa.id, 'ubicaciones'),
        (s) => setLista(s.docs.map(leerDoc).filter((u) => Number.isFinite(u.lat) && Number.isFinite(u.lng))),
        () => {
          setError(true);
          setLista([]);
        },
      ),
    [empresa.id],
  );

  useEffect(() => {
    if (!caja.current || mapa.current) return undefined;
    mapa.current = L.map(caja.current, { zoomControl: true }).setView([-34.9, -56.16], 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(mapa.current);
    capa.current = L.layerGroup().addTo(mapa.current);
    return () => {
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  const enAlerta = new Set(alertasActivas.map((a) => a.uid));

  useEffect(() => {
    if (!mapa.current || !capa.current || !lista) return;
    capa.current.clearLayers();
    const puntos = [];
    for (const p of puestos) {
      if (!Number.isFinite(p.lat)) continue;
      L.marker([p.lat, p.lng], {
        icon: L.divIcon({ className: 'pin pin-puesto', html: '<span>▣</span>', iconSize: [26, 26] }),
        title: p.nombre,
      })
        .bindTooltip(p.nombre)
        .addTo(capa.current);
    }
    for (const u of lista) {
      const f = frescuraUbicacion(u.actualizadoEn, ahora);
      const clase = enAlerta.has(u.uid) ? 'alerta' : f;
      L.marker([u.lat, u.lng], {
        icon: L.divIcon({ className: `pin pin-${clase}`, html: `<span>${iniciales(u.nombre)}</span>`, iconSize: [34, 34] }),
        title: u.nombre,
        zIndexOffset: enAlerta.has(u.uid) ? 1000 : 0,
      })
        .bindTooltip(`${u.nombre} · ${haceTiempo(u.actualizadoEn, ahora, lang)}`)
        .addTo(capa.current);
      puntos.push([u.lat, u.lng]);
    }
    const sel = lista.find((u) => u.uid === elegido);
    if (sel) mapa.current.setView([sel.lat, sel.lng], 17);
    else if (!encuadrado.current && puntos.length) {
      mapa.current.fitBounds(puntos, { padding: [40, 40], maxZoom: 16 });
      encuadrado.current = true;
    }
  }, [lista, puestos, ahora, elegido, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  if (lista === null && !error) return <Cargando />;
  const ordenada = [...(lista || [])].sort((a, b) => Number(enAlerta.has(b.uid)) - Number(enAlerta.has(a.uid)) || a.nombre.localeCompare(b.nombre));

  return (
    <>
      <h1>{t('seg.map.title')}</h1>
      <p className="suave">{t('seg.map.help')}</p>
      <Aviso tipo="error">{error ? t('common.error') : ''}</Aviso>
      <div ref={caja} className="mapa-vivo" role="region" aria-label={t('seg.map.title')} />
      {lista?.length === 0 && !error && <p className="suave">{t('seg.map.empty')}</p>}
      {ordenada.map((u) => {
        const f = frescuraUbicacion(u.actualizadoEn, ahora);
        return (
          <section key={u.uid} className={`tarjeta ${enAlerta.has(u.uid) ? 'en-alerta' : ''}`}>
            <div className="dato">
              <div className="persona">
                <span className="avatar" aria-hidden="true">
                  {iniciales(u.nombre)}
                </span>
                <div>
                  <strong>{u.nombre}</strong>
                  {enAlerta.has(u.uid) && <span className="insignia bloqueada"> 🚨 {t('seg.alert.title')}</span>}
                  <div className="suave">
                    {u.puestoNombre || '—'} · <span className={`frescura ${f}`}>{t(`seg.map.fresh.${f}`)}</span> ·{' '}
                    {haceTiempo(u.actualizadoEn, ahora, lang)}
                  </div>
                </div>
              </div>
              <div className="fila">
                <button type="button" className="boton secundario" onClick={() => setParams({ uid: u.uid })}>
                  {t('seg.map.center')}
                </button>
                <a className="boton secundario" href={enlaceMapaCoord(u.lat, u.lng)} target="_blank" rel="noreferrer">
                  {t('seg.alert.openMaps')}
                </a>
                <Link className="boton secundario" to={`/chat/${u.uid}`}>
                  {t('seg.nav.chat')}
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
