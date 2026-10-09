// Datos por país: moneda, zona horaria e idioma por defecto.
export const PAISES = {
  UY: { moneda: 'UYU', zona: 'America/Montevideo', idioma: 'es' },
  AR: { moneda: 'ARS', zona: 'America/Argentina/Buenos_Aires', idioma: 'es' },
  BR: { moneda: 'BRL', zona: 'America/Sao_Paulo', idioma: 'pt' },
};

export const ZONAS = Object.values(PAISES).map((p) => p.zona);
export const IDIOMAS = ['es', 'pt', 'en'];
export const VERTICALES = ['pasteleria', 'seguridad'];

// Máximo de personas de equipo (dueño + admins + empleados) por vertical.
// Seguridad no tiene límite: un evento puede pasar de 10 a 50 guardias en un día.
export const LIMITE_EQUIPO = { pasteleria: 10, seguridad: Infinity };

export const soloDigitos = (s) => String(s || '').replace(/\D/g, '');

export function enlaceWhatsapp(numero, texto) {
  const n = soloDigitos(numero);
  if (!n) return null;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}
