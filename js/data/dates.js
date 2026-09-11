import { CONFIG } from './catalog.js';

const MS_DAY = 24 * 60 * 60 * 1000;

function parseISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISO(new Date());
}

export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Semana 1-based y nombre de día para una fecha ISO dada, según el inicio del programa.
export function weekAndDayFor(dateISO) {
  const start = parseISO(CONFIG.startDate);
  const target = parseISO(dateISO);
  const diffDays = Math.round((target - start) / MS_DAY);
  const week = Math.floor(diffDays / 7) + 1;
  const dayIndex = ((diffDays % 7) + 7) % 7; // 0 = Lunes ... 6 = Domingo
  const day = CONFIG.dayOrder[dayIndex];
  return { week, day, dayIndex };
}

export function sessionFor(dateISO) {
  const { day } = weekAndDayFor(dateISO);
  return CONFIG.dayToSession[day] || null;
}

export function formatLong(dateISO) {
  const d = parseISO(dateISO);
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function addDaysISO(dateISO, days) {
  const d = parseISO(dateISO);
  d.setDate(d.getDate() + days);
  return toISO(d);
}
