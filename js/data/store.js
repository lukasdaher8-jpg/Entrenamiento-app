// Capa de datos. Hoy guarda en localStorage; cuando se conecte Firebase,
// esta es la única capa que cambia (misma interfaz: get/set/subscribe por colección).

const STORAGE_KEY = 'entrenamiento_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return { setLogs: {}, dayLogs: {}, measurements: {}, substitutions: {}, ...data };
  } catch {
    return { setLogs: {}, dayLogs: {}, measurements: {}, substitutions: {} };
  }
}

let state = load();
const listeners = new Set();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn());
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// --- setLogs: progreso de series por ejercicio en un día concreto ---
// key: `${week}_${day}_${exerciseName}`
export function setLogKey(week, day, exerciseName) {
  return `${week}_${day}_${exerciseName}`;
}

export function getSetLog(week, day, exerciseName) {
  return state.setLogs[setLogKey(week, day, exerciseName)] || null;
}

export function saveSetLog(week, day, exerciseName, data) {
  state.setLogs[setLogKey(week, day, exerciseName)] = { ...data, updatedAt: Date.now() };
  persist();
}

// Última vez que se registró este ejercicio en este mismo día de la semana (semana anterior
// más reciente con datos), para "igual que antes". Se filtra por día porque el mismo nombre de
// ejercicio puede aparecer en más de una sesión (ej. "Jalón al pecho" en Pull A y Pull B).
export function lastSetLogFor(exerciseName, day, beforeWeek) {
  let best = null;
  let bestWeek = -1;
  for (const key of Object.keys(state.setLogs)) {
    const entry = state.setLogs[key];
    const parts = key.split('_');
    const keyDay = parts[1];
    const name = parts.slice(2).join('_');
    if (name !== exerciseName || keyDay !== day) continue;
    const week = Number(parts[0]);
    if (week < beforeWeek && week > bestWeek && entry.sets && entry.sets.some((s) => s.kg || s.kgR || s.kgL)) {
      bestWeek = week;
      best = entry;
    }
  }
  return best;
}

// --- dayLogs: asistencia y cierre de sesión por día ---
export function dayLogKey(week, day) {
  return `${week}_${day}`;
}

export function getDayLog(week, day) {
  return state.dayLogs[dayLogKey(week, day)] || { attendance: 'Pendiente' };
}

export function saveDayLog(week, day, data) {
  const key = dayLogKey(week, day);
  state.dayLogs[key] = { ...state.dayLogs[key], ...data, updatedAt: Date.now() };
  persist();
}

// --- measurements: medidas diarias ---
export function getMeasurement(dateISO) {
  return state.measurements[dateISO] || null;
}

export function saveMeasurement(dateISO, data) {
  state.measurements[dateISO] = { ...state.measurements[dateISO], ...data, updatedAt: Date.now() };
  persist();
}

export function allMeasurements() {
  return state.measurements;
}

export function allDayLogs() {
  return state.dayLogs;
}

export function allSetLogs() {
  return state.setLogs;
}

// --- substitutions: reemplazo de un ejercicio del catálogo por un sustituto, para un día
// concreto (no altera el plan; solo afecta qué se registra ese día en ese cupo de la sesión) ---
export function substitutionKey(week, day, originalName) {
  return `${week}_${day}_${originalName}`;
}

export function getSubstitution(week, day, originalName) {
  return state.substitutions[substitutionKey(week, day, originalName)] || null;
}

export function setSubstitution(week, day, originalName, substituteName) {
  const key = substitutionKey(week, day, originalName);
  if (substituteName) state.substitutions[key] = substituteName;
  else delete state.substitutions[key];
  persist();
}
