import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useSeg } from '../../data/SeguridadProvider';
import { useI18n } from '../../i18n';
import { borrarUbicacion, guardarUbicacion } from '../../lib/segServicios';
import { debeGuardarUbicacion } from '../../lib/seguridad.js';

// Ubicación en vivo del guardia. Solo funciona mientras:
//  - tiene la entrada marcada (jornada en curso) o una alerta activa, y
//  - la app está abierta (el navegador pausa el GPS con la pantalla bloqueada).
// Mantiene la pantalla encendida con la Wake Lock API cuando el aparato la soporta.
export default function Seguimiento() {
  const { perfil, empresa } = useAuth();
  const { asistenciaAbierta, alertasActivas } = useSeg();
  const { t } = useI18n();
  const [estado, setEstado] = useState('inactivo'); // inactivo | pidiendo | activo | denegado | error | nosoporta
  const previa = useRef(null);
  const activo = Boolean(asistenciaAbierta) || alertasActivas.length > 0;
  const puesto = asistenciaAbierta?.puestoNombre || '';
  const puestoRef = useRef(puesto);
  puestoRef.current = puesto;
  const yaHuboSeguimiento = useRef(false);

  // GPS en vivo.
  useEffect(() => {
    if (!activo) return undefined;
    if (!('geolocation' in navigator)) {
      setEstado('nosoporta');
      return undefined;
    }
    setEstado('pidiendo');
    yaHuboSeguimiento.current = true;
    const id = navigator.geolocation.watchPosition(
      (p) => {
        setEstado('activo');
        const nueva = { lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy };
        const ahora = Date.now();
        if (!debeGuardarUbicacion(previa.current, nueva, ahora)) return;
        previa.current = { ...nueva, en: ahora };
        guardarUbicacion(empresa.id, perfil, nueva, { puestoNombre: puestoRef.current }).catch(() => {
          previa.current = null; // reintenta en la próxima lectura
        });
      },
      (e) => setEstado(e.code === 1 ? 'denegado' : 'error'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [activo, empresa.id, perfil]);

  // Al terminar la jornada se borra la ubicación: deja de verse en el mapa.
  useEffect(() => {
    if (activo || !yaHuboSeguimiento.current) return;
    yaHuboSeguimiento.current = false;
    previa.current = null;
    setEstado('inactivo');
    borrarUbicacion(empresa.id, perfil.id).catch(() => {});
  }, [activo, empresa.id, perfil.id]);

  // Pantalla encendida mientras dura el seguimiento.
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return undefined;
    let candado = null;
    let cancelado = false;
    const pedir = async () => {
      try {
        const c = await navigator.wakeLock.request('screen');
        if (cancelado) c.release().catch(() => {});
        else candado = c;
      } catch {
        /* sin permiso: sigue sin mantener la pantalla */
      }
    };
    pedir();
    const alVolver = () => document.visibilityState === 'visible' && pedir();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alVolver);
      candado?.release().catch(() => {});
    };
  }, [activo]);

  if (!activo) return null;
  const aviso = {
    pidiendo: ['pidiendo', t('seg.gps.asking')],
    activo: ['activo', t('seg.gps.on')],
    denegado: ['denegado', t('seg.gps.denied')],
    error: ['error', t('seg.gps.error')],
    nosoporta: ['error', t('seg.gps.unsupported')],
    inactivo: ['pidiendo', t('seg.gps.asking')],
  }[estado];
  return (
    <p className={`gps-estado ${aviso[0]}`} role="status">
      <span className="punto" aria-hidden="true" /> {aviso[1]}
    </p>
  );
}
