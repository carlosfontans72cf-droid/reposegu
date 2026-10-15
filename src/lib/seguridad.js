// Lógica pura de la vertical de seguridad (sin Firebase, para poder probarla sola).

const MIN = 60000;
const DIA = 86400000;

// ---------- Ubicación ----------

// Distancia en metros entre dos puntos {lat, lng} (fórmula de haversine).
export function distanciaMetros(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const AJUSTE_UBICACION = {
  minimoMs: 30 * 1000, // nunca más de una escritura cada 30 segundos
  movimientoM: 15, // si se movió menos que esto, no vale la pena escribir...
  latidoMs: 3 * MIN, // ...pero se avisa cada 3 minutos para mostrar que sigue en línea
  precisionMaxM: 5000, // más impreciso que esto (antena lejana) no sirve; entre 200 m y 5 km se guarda con su margen de error
};

// Decide si una lectura nueva del GPS se guarda. Cuida las escrituras (costo) y la batería.
// previa: { lat, lng, en (ms) } de lo último guardado, o null.
export function debeGuardarUbicacion(previa, nueva, ahoraMs, ajuste = AJUSTE_UBICACION) {
  if (!nueva || !Number.isFinite(nueva.lat) || !Number.isFinite(nueva.lng)) return false;
  if (Number.isFinite(nueva.precision) && nueva.precision > ajuste.precisionMaxM) return false;
  if (!previa) return true;
  const pasado = ahoraMs - previa.en;
  if (pasado < ajuste.minimoMs) return false;
  if (pasado >= ajuste.latidoMs) return true;
  return distanciaMetros(previa, nueva) >= ajuste.movimientoM;
}

// Qué tan fresca es la ubicación de un guardia.
export function frescuraUbicacion(actualizadoEnMs, ahoraMs) {
  if (!Number.isFinite(actualizadoEnMs)) return 'sin';
  const d = ahoraMs - actualizadoEnMs;
  if (d <= 4 * MIN) return 'envivo';
  if (d <= 20 * MIN) return 'reciente';
  return 'perdida';
}

export const enlaceMapaCoord = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng)
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null;

// Mapa embebido de OpenStreetMap (no requiere clave) con un marcador.
export function enlaceMapaEmbebido(lat, lng, delta = 0.006) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].map((n) => n.toFixed(6)).join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lng.toFixed(6)}`;
}

// ---------- Turnos ----------

// Cuántos guardias faltan para cubrir un turno.
export function cobertura(turno) {
  const requeridos = Math.max(0, Math.floor(Number(turno?.requeridos) || 0));
  const asignados = new Set(turno?.guardias || []).size;
  let estado = 'completo';
  if (asignados === 0) estado = requeridos === 0 ? 'completo' : 'vacio';
  else if (asignados < requeridos) estado = 'parcial';
  else if (asignados > requeridos) estado = 'excedido';
  return { requeridos, asignados, faltan: Math.max(0, requeridos - asignados), estado };
}

// ¿Dos turnos se pisan en el tiempo? (fechas en ms)
export const seSuperponen = (a, b) => a.inicio < b.fin && b.inicio < a.fin;

// Turnos de `otros` en los que el guardia ya está asignado y se pisan con `turno`.
// turno/otros: { id, inicio (ms), fin (ms), guardias: [uid] }
export function conflictosDeTurno(turno, otros, uid) {
  return otros.filter(
    (o) => o.id !== turno.id && (o.guardias || []).includes(uid) && seSuperponen(turno, o),
  );
}

// Hay personal asignado que no puede trabajar ese turno por habilitación vencida.
export function habilitacionAlDia(vence, finTurnoMs) {
  if (vence == null) return true; // sin dato: no se bloquea, solo se avisa en la ficha
  return vence >= finTurnoMs;
}

export function estadoHabilitacion(venceMs, ahoraMs) {
  if (venceMs == null) return 'sin';
  if (venceMs < ahoraMs) return 'vencida';
  if (venceMs - ahoraMs <= 30 * DIA) return 'porvencer';
  return 'vigente';
}

// De los turnos de hoy, el que corresponde al ingreso de un guardia:
// el que está en curso o el que empieza más pronto (hasta 3 horas antes).
export function turnoParaEntrada(turnos, ahoraMs, adelantoMs = 3 * 60 * MIN) {
  const candidatos = turnos.filter((t) => t.fin > ahoraMs && t.inicio - adelantoMs <= ahoraMs);
  candidatos.sort((a, b) => a.inicio - b.inicio);
  return candidatos[0] || null;
}

// ---------- Asistencia ----------

export const minutosTrabajados = (entradaMs, salidaMs) =>
  Number.isFinite(entradaMs) && Number.isFinite(salidaMs) && salidaMs > entradaMs
    ? Math.round((salidaMs - entradaMs) / MIN)
    : 0;

export function formatoDuracion(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}:${String(m).padStart(2, '0')} h`;
}

// Minutos de atraso de una entrada respecto del inicio del turno (0 si llegó a tiempo).
// Se toleran 5 minutos.
export function atrasoMinutos(entradaMs, inicioMs, toleranciaMin = 5) {
  if (!Number.isFinite(entradaMs) || !Number.isFinite(inicioMs)) return 0;
  const d = Math.round((entradaMs - inicioMs) / MIN);
  return d > toleranciaMin ? d : 0;
}

// ---------- Rondas ----------

// puntos: [{id, nombre}] del plan del puesto. marcas: [{puntoId, ...}] hechas.
export function resumenRonda(puntos, marcas) {
  const hechos = new Set((marcas || []).map((m) => m.puntoId));
  const faltan = (puntos || []).filter((p) => !hechos.has(p.id));
  return {
    total: (puntos || []).length,
    cumplidos: (puntos || []).length - faltan.length,
    faltan,
    completa: (puntos || []).length > 0 && faltan.length === 0,
  };
}

// Siguiente punto sugerido: el primero del plan que todavía no se marcó.
export const siguientePunto = (puntos, marcas) => resumenRonda(puntos, marcas).faltan[0] || null;

// ---------- Incidentes y alertas ----------

export const TIPOS_INCIDENTE = ['robo', 'intrusion', 'agresion', 'incendio', 'accidente', 'dano', 'sospechoso', 'otro'];
export const GRAVEDADES = ['baja', 'media', 'alta'];
export const ESTADOS_INCIDENTE = ['abierto', 'revisado', 'cerrado'];
export const TIPOS_ALERTA = ['panico', 'ayuda'];

// Orden para mostrar: lo urgente primero (alta y abierto arriba).
export function ordenarIncidentes(lista) {
  const g = { alta: 0, media: 1, baja: 2 };
  const e = { abierto: 0, revisado: 1, cerrado: 2 };
  return [...lista].sort(
    (a, b) =>
      (e[a.estado] ?? 3) - (e[b.estado] ?? 3) ||
      (g[a.gravedad] ?? 3) - (g[b.gravedad] ?? 3) ||
      (b.creadoEn || 0) - (a.creadoEn || 0),
  );
}

// ---------- Chat ----------

// lado: 'guardia' | 'gestion'. Hay mensajes sin leer si el último vino del otro lado
// y es posterior a la última lectura propia.
export function tieneSinLeer(chat, lado) {
  if (!chat || !chat.ultimoDe || chat.ultimoDe === lado) return false;
  const leido = lado === 'guardia' ? chat.leidoGuardia : chat.leidoGestion;
  return !Number.isFinite(leido) || (chat.ultimo || 0) > leido;
}

// ---------- Presentación ----------

export function iniciales(nombre) {
  const p = String(nombre || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return p.map((x) => x[0]?.toUpperCase() || '').join('') || '?';
}

// Limpia teléfonos: deja dígitos y un + inicial.
export function limpiarTelefono(s) {
  const t = String(s || '').trim();
  const digitos = t.replace(/\D/g, '');
  return t.startsWith('+') ? `+${digitos}` : digitos;
}

export const enlaceLlamada = (tel) => (limpiarTelefono(tel) ? `tel:${limpiarTelefono(tel)}` : null);

// ---------- Datos de Firestore ----------

// Convierte los Timestamp (en cualquier nivel) a milisegundos. En la pantalla todas las
// fechas de seguridad son números (ms); al escribir se vuelven a guardar como Timestamp.
export function aMsProfundo(v) {
  if (v && typeof v.toMillis === 'function') return v.toMillis();
  if (Array.isArray(v)) return v.map(aMsProfundo);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, aMsProfundo(x)]));
  return v;
}

// Lee un documento de Firestore: { id, ...datos } con fechas en ms. serverTimestamp
// pendiente se estima con la hora del aparato, para que no aparezca vacío un instante.
export const leerDoc = (snap) => ({ id: snap.id, ...aMsProfundo(snap.data({ serverTimestamps: 'estimate' })) });

const PREFIJO_PAIS = { UY: '598', AR: '54', BR: '55' };

// Teléfono en formato internacional (solo dígitos, para wa.me). Si empieza con "+", se respeta;
// si no, se le antepone el prefijo del país de la empresa (quitando ceros iniciales).
export function telefonoInternacional(tel, pais) {
  const t = String(tel || '').trim();
  const d = t.replace(/\D/g, '');
  if (!d) return '';
  if (t.startsWith('+')) return d;
  if (t.startsWith('00')) return d.replace(/^00/, '');
  const pre = PREFIJO_PAIS[pais] || '';
  return pre && !d.startsWith(pre) ? `${pre}${d.replace(/^0+/, '')}` : d.replace(/^0+/, '');
}
