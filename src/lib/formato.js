import { useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';

// Pesos uruguayos, argentinos o reales según la empresa, con el formato del idioma.
export function formatoDinero(n, moneda = 'UYU', lang = 'es') {
  const x = Number(n);
  if (!Number.isFinite(x)) return '—';
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: moneda,
      maximumFractionDigits: Number.isInteger(x) ? 0 : 2,
    }).format(x);
  } catch {
    return `${moneda} ${x}`;
  }
}

export function useDinero(monedaFija) {
  const { empresa } = useAuth();
  const { lang } = useI18n();
  const moneda = monedaFija || empresa?.moneda || 'UYU';
  return useCallback((n) => formatoDinero(n, moneda, lang), [moneda, lang]);
}

export const inicioDelDia = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const mismoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// <input type="datetime-local"> trabaja con hora local, sin zona.
const dos = (n) => String(n).padStart(2, '0');
export const aInputFechaHora = (d) =>
  d ? `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}` : '';
export const deInputFechaHora = (s) => (s ? new Date(s) : null);

export function formatoFechaHora(d, lang = 'es') {
  if (!d) return '—';
  return new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}

export const enlaceMapa = (direccion) =>
  direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null;
