import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  initializeAuth,
  signInWithEmailAndPassword,
  deleteUser,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { app, db } from '../firebase';
import { emailDeAcceso, generarCodigo, generarSecreto, normalizarCodigo } from './acceso.js';

// Las cuentas por código se crean desde una segunda instancia de Firebase, en memoria,
// para que la sesión de quien las crea (dueño o administrador) no se cierre.
async function conAuthSecundario(fn) {
  const sec = initializeApp(app.options, `acceso-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const authSec = initializeAuth(sec, { persistence: inMemoryPersistence });
  try {
    return await fn(authSec);
  } finally {
    try {
      await signOut(authSec);
    } catch {
      /* sin sesión: nada que cerrar */
    }
    await deleteApp(sec);
  }
}

// Crea la cuenta (email interno + código como clave) y su perfil, ficha y registro de acceso.
// Devuelve { uid, codigo, email }. Si el nombre ya existe en la empresa, lanza auth/email-already-in-use.
export async function crearAcceso({ empresa, quien, nombre, rol, cargo, telefono, idioma }) {
  const nombreLimpio = String(nombre || '').trim().slice(0, 80);
  const codigo = generarCodigo(empresa.id);
  const email = emailDeAcceso(nombreLimpio, codigo);
  if (!email) {
    const e = new Error('nombre-invalido');
    e.code = 'acceso/nombre-invalido';
    throw e;
  }
  const tel = String(telefono || '').trim().slice(0, 30);
  const cargoLimpio = String(cargo || '').trim().slice(0, 40);
  const uid = await conAuthSecundario(async (authSec) => {
    const cred = await createUserWithEmailAndPassword(authSec, email, normalizarCodigo(codigo));
    try {
      const lote = writeBatch(db);
      lote.set(doc(db, 'usuarios', cred.user.uid), {
        empresaId: empresa.id,
        rol: rol === 'admin' ? 'admin' : 'empleado',
        nombre: nombreLimpio,
        ...(cargoLimpio ? { cargo: cargoLimpio } : {}),
        email,
        idioma: idioma || empresa.idiomaDefecto || 'es',
        activo: true,
        acceso: 'codigo',
        creadoPor: quien,
        creadoEn: serverTimestamp(),
      });
      lote.set(doc(db, 'empresas', empresa.id, 'accesos', cred.user.uid), {
        nombre: nombreLimpio,
        rol: rol === 'admin' ? 'admin' : 'empleado',
        cargo: cargoLimpio,
        codigo,
        telefono: tel,
        creadoPor: quien,
        creadoEn: serverTimestamp(),
      });
      if (empresa.vertical === 'seguridad' && tel) {
        lote.set(
          doc(db, 'empresas', empresa.id, 'personal', cred.user.uid),
          { telefono: tel, actualizadoEn: serverTimestamp() },
          { merge: true },
        );
      }
      await lote.commit();
    } catch (e) {
      // Sin perfil la cuenta no sirve y dejaría el nombre ocupado: se borra.
      try {
        await deleteUser(cred.user);
      } catch {
        /* queda sin perfil; no da acceso a nada */
      }
      throw e;
    }
    return cred.user.uid;
  });
  return { uid, codigo, email };
}

// Cambia el secreto del código (conserva el prefijo de la empresa). El código anterior deja de servir.
export async function renovarCodigo({ empresa, acceso }) {
  const anterior = acceso.codigo;
  const nuevo = anterior.slice(0, 4) + generarSecreto();
  const email = emailDeAcceso(acceso.nombre, anterior);
  await conAuthSecundario(async (authSec) => {
    const cred = await signInWithEmailAndPassword(authSec, email, normalizarCodigo(anterior));
    await updatePassword(cred.user, normalizarCodigo(nuevo));
  });
  await setDoc(
    doc(db, 'empresas', empresa.id, 'accesos', acceso.id),
    { codigo: nuevo, renovadoEn: serverTimestamp() },
    { merge: true },
  );
  return nuevo;
}
