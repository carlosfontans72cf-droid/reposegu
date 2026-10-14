// Escrituras a Firestore y Storage de la vertical de seguridad.
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import { reducirImagen } from './imagen';

const de = (empresaId, nombre, id) =>
  id ? doc(db, 'empresas', empresaId, nombre, id) : doc(collection(db, 'empresas', empresaId, nombre));

const ts = (ms) => (Number.isFinite(ms) ? Timestamp.fromMillis(ms) : null);

// Solo se guardan los datos de posición que hacen falta.
export const posLimpia = (p) =>
  p && Number.isFinite(p.lat) && Number.isFinite(p.lng)
    ? { lat: p.lat, lng: p.lng, precision: Number.isFinite(p.precision) ? Math.round(p.precision) : null }
    : null;

// ---------- Posición ----------

// Una lectura puntual del GPS. Devuelve null si no hay permiso, no hay señal o tarda demasiado.
export function leerPosicion({ alta = true, espera = 8000 } = {}) {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, precision: p.coords.accuracy }),
      () => resolve(null),
      { enableHighAccuracy: alta, timeout: espera, maximumAge: 15000 },
    );
  });
}

// Ubicación en vivo: un documento por guardia que se va pisando (no se acumula historial).
export const guardarUbicacion = (empresaId, perfil, pos, extra = {}) =>
  setDoc(de(empresaId, 'ubicaciones', perfil.id), {
    uid: perfil.id,
    nombre: perfil.nombre,
    ...posLimpia(pos),
    puestoNombre: extra.puestoNombre || '',
    actualizadoEn: serverTimestamp(),
  });

export const borrarUbicacion = (empresaId, uid) => deleteDoc(de(empresaId, 'ubicaciones', uid));

// ---------- Asistencia ----------

export async function marcarEntrada(empresaId, perfil, { turno, pos }) {
  const nueva = de(empresaId, 'asistencias');
  await setDoc(nueva, {
    uid: perfil.id,
    nombre: perfil.nombre,
    turnoId: turno?.id || null,
    puestoId: turno?.puestoId || null,
    puestoNombre: turno?.puestoNombre || '',
    turnoInicio: ts(turno?.inicio),
    entrada: serverTimestamp(),
    entradaPos: posLimpia(pos),
    salida: null,
    salidaPos: null,
    abierta: true,
  });
  return nueva.id;
}

export const marcarSalida = (empresaId, asistenciaId, pos) =>
  updateDoc(de(empresaId, 'asistencias', asistenciaId), {
    salida: serverTimestamp(),
    salidaPos: posLimpia(pos),
    abierta: false,
  });

// ---------- Turnos ----------

export function datosTurno(t) {
  return {
    puestoId: t.puestoId,
    puestoNombre: t.puestoNombre,
    inicio: ts(t.inicio),
    fin: ts(t.fin),
    requeridos: Math.max(0, Math.floor(Number(t.requeridos) || 0)),
    guardias: [...new Set(t.guardias || [])],
    notas: String(t.notas || '').slice(0, 500),
  };
}

export const guardarTurno = (empresaId, t, id) =>
  id
    ? updateDoc(de(empresaId, 'turnos', id), datosTurno(t))
    : setDoc(de(empresaId, 'turnos'), { ...datosTurno(t), creadoEn: serverTimestamp() });

export const borrarTurno = (empresaId, id) => deleteDoc(de(empresaId, 'turnos', id));

// Copia un turno a otros días (misma hora y mismos guardias). dias: nº de días de desfase.
export async function repetirTurno(empresaId, t, dias) {
  const batch = writeBatch(db);
  for (const d of dias) {
    batch.set(de(empresaId, 'turnos'), {
      ...datosTurno({ ...t, inicio: t.inicio + d * 86400000, fin: t.fin + d * 86400000 }),
      creadoEn: serverTimestamp(),
    });
  }
  await batch.commit();
}

// ---------- Rondas ----------

export async function iniciarRonda(empresaId, perfil, puesto) {
  const nueva = de(empresaId, 'rondas');
  await setDoc(nueva, {
    uid: perfil.id,
    nombre: perfil.nombre,
    puestoId: puesto.id,
    puestoNombre: puesto.nombre,
    plan: (puesto.puntos || []).map((p) => ({ id: p.id, nombre: p.nombre })),
    marcas: [],
    inicio: serverTimestamp(),
    fin: null,
    estado: 'en_curso',
    completa: false,
  });
  return nueva.id;
}

export const marcarPunto = (empresaId, rondaId, punto, pos) =>
  updateDoc(de(empresaId, 'rondas', rondaId), {
    marcas: arrayUnion({ puntoId: punto.id, nombre: punto.nombre, en: Date.now(), pos: posLimpia(pos) }),
  });

export const terminarRonda = (empresaId, rondaId, completa) =>
  updateDoc(de(empresaId, 'rondas', rondaId), { estado: 'terminada', completa: Boolean(completa), fin: serverTimestamp() });

// ---------- Incidentes ----------

// Sube las fotos (reducidas en el celular) y el video opcional, y luego crea el incidente.
export async function crearIncidente(empresaId, perfil, datos, { fotos = [], video = null } = {}) {
  const nuevo = de(empresaId, 'incidentes');
  const subir = async (blob, nombre, tipo) => {
    const r = ref(storage, `empresas/${empresaId}/incidentes/${nuevo.id}/${nombre}`);
    await uploadBytes(r, blob, { contentType: tipo });
    return getDownloadURL(r);
  };
  const urlsFotos = [];
  for (const [i, f] of fotos.slice(0, 4).entries()) {
    const blob = await reducirImagen(f, 1280, 0.8);
    urlsFotos.push(await subir(blob, `foto${i + 1}.webp`, 'image/webp'));
  }
  let urlVideo = null;
  if (video) urlVideo = await subir(video, `video.${(video.type.split('/')[1] || 'mp4').replace(/\W/g, '')}`, video.type || 'video/mp4');

  await setDoc(nuevo, {
    uid: perfil.id,
    nombre: perfil.nombre,
    puestoId: datos.puestoId || null,
    puestoNombre: datos.puestoNombre || '',
    tipo: datos.tipo,
    gravedad: datos.gravedad,
    descripcion: String(datos.descripcion || '').slice(0, 2000),
    fotos: urlsFotos,
    video: urlVideo,
    pos: posLimpia(datos.pos),
    estado: 'abierto',
    notaGestion: '',
    creadoEn: serverTimestamp(),
  });
  return nuevo.id;
}

export const actualizarIncidente = (empresaId, id, { estado, notaGestion }) =>
  updateDoc(de(empresaId, 'incidentes', id), {
    estado,
    notaGestion: String(notaGestion || '').slice(0, 1000),
    revisadoEn: serverTimestamp(),
  });

// ---------- Alertas de pánico / ayuda ----------

export async function enviarAlerta(empresaId, perfil, { tipo, pos, telefono, puestoNombre }) {
  const nueva = de(empresaId, 'alertas');
  await setDoc(nueva, {
    uid: perfil.id,
    nombre: perfil.nombre,
    telefono: telefono || '',
    puestoNombre: puestoNombre || '',
    tipo,
    pos: posLimpia(pos),
    estado: 'activa',
    creadoEn: serverTimestamp(),
  });
  return nueva.id;
}

// Gestión: marca la alerta como atendida.
export const atenderAlerta = (empresaId, id, perfil, nota = '') =>
  updateDoc(de(empresaId, 'alertas', id), {
    estado: 'atendida',
    atendidaPor: perfil.nombre,
    atendidaEn: serverTimestamp(),
    nota: String(nota).slice(0, 500),
  });

// El guardia puede cancelar su propia alerta (falsa alarma).
export const cancelarAlerta = (empresaId, id) => updateDoc(de(empresaId, 'alertas', id), { estado: 'cancelada' });

// ---------- Chat ----------
// Hay un hilo por guardia (id = uid del guardia). Lo ve el guardia y toda la gestión.

export async function enviarMensaje(empresaId, chatUid, perfil, lado, texto) {
  const limpio = String(texto || '').trim().slice(0, 1000);
  if (!limpio) return;
  const batch = writeBatch(db);
  const chat = de(empresaId, 'chats', chatUid);
  const msg = doc(collection(db, 'empresas', empresaId, 'chats', chatUid, 'mensajes'));
  batch.set(msg, { de: perfil.id, nombre: perfil.nombre, lado, texto: limpio, creadoEn: serverTimestamp() });
  batch.set(
    chat,
    {
      guardiaUid: chatUid,
      ...(lado === 'guardia' ? { guardiaNombre: perfil.nombre } : {}),
      ultimoTexto: limpio.slice(0, 120),
      ultimoDe: lado,
      ultimo: serverTimestamp(),
      [lado === 'guardia' ? 'leidoGuardia' : 'leidoGestion']: serverTimestamp(),
    },
    { merge: true },
  );
  await batch.commit();
}

export const marcarChatLeido = (empresaId, chatUid, lado) =>
  setDoc(
    de(empresaId, 'chats', chatUid),
    { guardiaUid: chatUid, [lado === 'guardia' ? 'leidoGuardia' : 'leidoGestion']: serverTimestamp() },
    { merge: true },
  );

// ---------- Personal (ficha del guardia) ----------

export const guardarFicha = (empresaId, uid, f) =>
  setDoc(
    de(empresaId, 'personal', uid),
    {
      documento: String(f.documento || '').slice(0, 40),
      telefono: String(f.telefono || '').slice(0, 30),
      contactoEmergencia: String(f.contactoEmergencia || '').slice(0, 120),
      habilitacionVence: ts(f.habilitacionVence),
      notas: String(f.notas || '').slice(0, 500),
      actualizadoEn: serverTimestamp(),
    },
    { merge: true },
  );
