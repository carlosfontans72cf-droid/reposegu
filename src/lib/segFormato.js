import { useEffect, useState } from 'react';

// Formatos de fecha y hora para la vertical de seguridad (todo en ms).
export const hora = (ms, lang = 'es') =>
  Number.isFinite(ms) ? new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' }).format(ms) : '—';

export const diaCorto = (ms, lang = 'es') =>
  Number.isFinite(ms) ? new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short' }).format(ms) : '—';

export const diaLargo = (ms, lang = 'es') =>
  Number.isFinite(ms) ? new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(ms) : '—';

export const diaHora = (ms, lang = 'es') =>
  Number.isFinite(ms)
    ? new Intl.DateTimeFormat(lang, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(ms)
    : '—';

export const inicioDiaMs = (ms) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

// "hace 3 min" / "3 min ago" según el idioma.
export function haceTiempo(ms, ahora, lang = 'es') {
  if (!Number.isFinite(ms)) return '—';
  const seg = Math.round((ms - ahora) / 1000);
  const f = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const abs = Math.abs(seg);
  if (abs < 60) return f.format(Math.round(seg / 10) * 10 || 0, 'second');
  if (abs < 3600) return f.format(Math.round(seg / 60), 'minute');
  if (abs < 86400) return f.format(Math.round(seg / 3600), 'hour');
  return f.format(Math.round(seg / 86400), 'day');
}

// <input type="date"> en hora local.
const dos = (n) => String(n).padStart(2, '0');
export const aInputFecha = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};
export const deInputFecha = (s) => {
  const [a, m, d] = String(s).split('-').map(Number);
  return a ? new Date(a, m - 1, d).getTime() : null;
};
export const aInputHora = (ms) => {
  const d = new Date(ms);
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`;
};
// Combina una fecha (ms, inicio de día) y "HH:MM" en un instante.
export const fechaYHora = (diaMs, hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  const d = new Date(diaMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h || 0, m || 0).getTime();
};

// Hook útil: hora actual que se refresca cada `cada` ms.
export function useAhora(cada = 30000) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setAhora(Date.now()), cada);
    return () => clearInterval(i);
  }, [cada]);
  return ahora;
}
