// Estado efectivo de la suscripción de una empresa.
// estado guardado: 'prueba' | 'activa' | 'vencida' | 'suspendida'
// resultado:       'prueba' | 'activa' | 'gracia' | 'bloqueada'

export const DIAS_GRACIA = 7;
const DIA = 24 * 60 * 60 * 1000;

const aFecha = (v) => (v && typeof v.toDate === 'function' ? v.toDate() : v instanceof Date ? v : null);

export function estadoSuscripcion(empresa, ahora = new Date()) {
  if (!empresa) return { estado: 'bloqueada', fin: null, dias: 0 };
  if (empresa.estado === 'suspendida') return { estado: 'bloqueada', fin: null, dias: 0 };

  const finPrueba = aFecha(empresa.finPrueba);
  const venceEl = aFecha(empresa.venceEl);
  const enPrueba = empresa.estado === 'prueba';
  const fin = enPrueba ? finPrueba : venceEl || finPrueba;
  if (!fin) return { estado: 'bloqueada', fin: null, dias: 0 };

  const t = ahora.getTime();
  if (t <= fin.getTime()) {
    return {
      estado: enPrueba ? 'prueba' : 'activa',
      fin,
      dias: Math.ceil((fin.getTime() - t) / DIA),
    };
  }
  const finGracia = fin.getTime() + DIAS_GRACIA * DIA;
  if (t <= finGracia) {
    return { estado: 'gracia', fin, dias: Math.ceil((finGracia - t) / DIA) };
  }
  return { estado: 'bloqueada', fin, dias: 0 };
}

// Suma meses sin desbordar (31 de enero + 1 mes = 28/29 de febrero).
export function sumarMeses(fecha, meses) {
  const d = new Date(fecha.getTime());
  const dia = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + meses);
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dia, ultimo));
  return d;
}

// Fecha local (no UTC) para no correr un día en zonas como UTC-3.
export const aInputFecha = (d) =>
  d
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    : '';
export const deInputFecha = (s) => (s ? new Date(`${s}T23:59:59`) : null);
export { aFecha };
