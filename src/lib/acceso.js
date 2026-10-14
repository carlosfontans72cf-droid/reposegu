// Acceso con nombre y código (sin email) para guardias y administradores.
// Firebase Auth pide un email, así que se arma uno interno a partir del nombre y de la
// empresa. Nunca se envía nada a esa dirección: el dominio ".invalid" no existe.
// La contraseña es el código completo.

export const DOMINIO_ACCESO = 'acceso.invalid';
// Sin letras ni números que se confunden (0/O, 1/I).
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LARGO_PREFIJO = 4;
const LARGO_SECRETO = 6;

export const esEmailAcceso = (email) => String(email || '').toLowerCase().endsWith(`@${DOMINIO_ACCESO}`);

// Nombre en minúsculas, sin tildes, solo letras/números separados por guiones.
export function slugNombre(nombre) {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/g, '');
}

// Cuatro caracteres fijos por empresa: evitan que dos empresas con un "Juan Pérez" choquen.
export function prefijoEmpresa(empresaId) {
  let h = 2166136261;
  for (const ch of String(empresaId)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let out = '';
  for (let i = 0; i < LARGO_PREFIJO; i += 1) {
    out += ALFABETO[h % 32];
    h = Math.floor(h / 32) ^ Math.imul(h, 31);
    h >>>= 0;
  }
  return out;
}

// azar: función que devuelve un entero 0-255 (por defecto, criptográfico).
const azarSeguro = (n) => crypto.getRandomValues(new Uint8Array(n));

export function generarSecreto(bytes = azarSeguro) {
  const b = bytes(LARGO_SECRETO);
  let s = '';
  for (let i = 0; i < LARGO_SECRETO; i += 1) s += ALFABETO[b[i] % 32]; // 256 es múltiplo de 32: sin sesgo
  return s;
}

export const generarCodigo = (empresaId, bytes) => prefijoEmpresa(empresaId) + generarSecreto(bytes);

export const normalizarCodigo = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// ABCD-EFGHJK
export function formatearCodigo(codigo) {
  const c = normalizarCodigo(codigo);
  return c.length > LARGO_PREFIJO ? `${c.slice(0, LARGO_PREFIJO)}-${c.slice(LARGO_PREFIJO)}` : c;
}

export const codigoValido = (s) => normalizarCodigo(s).length === LARGO_PREFIJO + LARGO_SECRETO;

// Email interno: nombre + prefijo de empresa. No incluye el secreto, así el código se puede renovar.
export function emailDeAcceso(nombre, codigo) {
  const slug = slugNombre(nombre);
  const prefijo = normalizarCodigo(codigo).slice(0, LARGO_PREFIJO).toLowerCase();
  if (!slug || prefijo.length < LARGO_PREFIJO) return '';
  return `${slug}.${prefijo}@${DOMINIO_ACCESO}`;
}

// Credenciales para iniciar sesión a partir de lo que escribe la persona.
export function credencialesDeAcceso(nombre, codigo) {
  if (!codigoValido(codigo)) return null;
  const email = emailDeAcceso(nombre, codigo);
  return email ? { email, clave: normalizarCodigo(codigo) } : null;
}
