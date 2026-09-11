// Catálogo de ejercicios y configuración del plan.
// Extraído 1:1 de Dashboard_Entrenamiento_V2.xlsx (hojas EJERCICIOS y CONFIG).
// No modificar el plan aquí sin justificación explícita del usuario.

export const CONFIG = {
  startDate: '2026-08-31', // Lunes, semana 1 día 1 (según CONFIG!B3 del Excel)
  weeks: 12,
  calorieTarget: 2800,
  proteinTarget: 190,
  initialWeightKg: 98,
  heightM: 1.85,
  sessionsPerWeek: 6,
  cardioInitialMinPerWeek: 60,
  sessionDurationTargetMin: 90,
  cardioPerSessionMin: 20,
  discomfortScale: 10,
  rirScale: [0, 1, 2, 3],
  cardioTypes: ['Bicicleta', 'Ergómetro brazos', 'Natación', 'Elíptica', 'Otro cómodo'],
  attendanceStates: ['Pendiente', 'Sí', 'No'],
  dayOrder: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  dayToSession: {
    Lunes: 'Push A',
    Martes: 'Pull A',
    Miércoles: 'Legs A',
    Jueves: 'Push B',
    Viernes: 'Pull B',
    Sábado: 'Legs B',
    Domingo: null,
  },
};

// Series: { session, day, order, name, muscle, focus, sets, repsTarget, rir, rest, initialLoad, notes }
export const EXERCISES = [
  // Push A - Lunes
  { session: 'Push A', day: 'Lunes', order: 1, name: 'Press inclinado barra', muscle: 'Pecho', focus: 'Fuerza', sets: 3, repsTarget: '5-7', rir: '1-2', rest: '3:00-4:00', initialLoad: '60', notes: 'Sin fallo sin spotter' },
  { session: 'Push A', day: 'Lunes', order: 2, name: 'Press hombro máquina', muscle: 'Hombro', focus: 'Fuerza', sets: 3, repsTarget: '6-8', rir: '1-2', rest: '2:30-3:00', initialLoad: '', notes: '' },
  { session: 'Push A', day: 'Lunes', order: 3, name: 'Press pecho máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-2:30', initialLoad: '', notes: '' },
  { session: 'Push A', day: 'Lunes', order: 4, name: 'Elevaciones laterales', muscle: 'Hombro', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '12-14', notes: 'Última: drop set' },
  { session: 'Push A', day: 'Lunes', order: 5, name: 'Tríceps polea', muscle: 'Tríceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },
  { session: 'Push A', day: 'Lunes', order: 6, name: 'Crunch cable/máquina', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: 'Con carga progresiva' },

  // Pull A - Martes
  { session: 'Pull A', day: 'Martes', order: 1, name: 'Dominada asistida', muscle: 'Espalda', focus: 'Fuerza', sets: 3, repsTarget: '5-8', rir: '1-2', rest: '3:00', initialLoad: '', notes: 'Reducir asistencia gradualmente' },
  { session: 'Pull A', day: 'Martes', order: 2, name: 'Remo pecho apoyado', muscle: 'Espalda', focus: 'Fuerza', sets: 3, repsTarget: '5-8', rir: '1-2', rest: '3:00', initialLoad: '', notes: '' },
  { session: 'Pull A', day: 'Martes', order: 3, name: 'Jalón al pecho', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-3:00', initialLoad: '60', notes: 'Referencia principal de espalda' },
  { session: 'Pull A', day: 'Martes', order: 4, name: 'Remo cable/máquina', muscle: 'Espalda', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Pull A', day: 'Martes', order: 5, name: 'Reverse pec deck', muscle: 'Hombro posterior', focus: 'Hipertrofia', sets: 3, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Pull A', day: 'Martes', order: 6, name: 'Curl bíceps', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },
  { session: 'Pull A', day: 'Martes', order: 7, name: 'Pantorrilla de pie', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: 'Pausa y estiramiento controlado' },

  // Legs A - Miércoles
  { session: 'Legs A', day: 'Miércoles', order: 1, name: 'Prensa bilateral', muscle: 'Cuádriceps/glúteo', focus: 'Fuerza controlada', sets: 3, repsTarget: '6-8', rir: '2', rest: '3:00-4:00', initialLoad: '120', notes: '3 discos de 20 por lado; rango constante' },
  { session: 'Legs A', day: 'Miércoles', order: 2, name: 'Peso muerto rumano', muscle: 'Femoral/glúteo', focus: 'Fuerza', sets: 3, repsTarget: '6-10', rir: '1-2', rest: '3:00', initialLoad: '', notes: '' },
  { session: 'Legs A', day: 'Miércoles', order: 3, name: 'Búlgara asistida', muscle: 'Unilateral', focus: 'Control/estabilidad', sets: 2, repsTarget: '8-10 c/lado', rir: '2', rest: '2:00', initialLoad: '', notes: 'Apoyo ligero; lado débil primero' },
  { session: 'Legs A', day: 'Miércoles', order: 4, name: 'Curl femoral', muscle: 'Femoral', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Legs A', day: 'Miércoles', order: 5, name: 'Extensión cuádriceps', muscle: 'Cuádriceps', focus: 'Hipertrofia controlada', sets: 2, repsTarget: '10-15', rir: '1-2', rest: '1:30-2:00', initialLoad: '70-80', notes: 'Sin fallo agresivo en pierna afectada' },
  { session: 'Legs A', day: 'Miércoles', order: 6, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },
  { session: 'Legs A', day: 'Miércoles', order: 7, name: 'Pallof press / crunch', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '1', rest: '1:00-1:30', initialLoad: '', notes: '' },

  // Push B - Jueves
  { session: 'Push B', day: 'Jueves', order: 1, name: 'Press inclinado Smith/máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-2:30', initialLoad: '', notes: '' },
  { session: 'Push B', day: 'Jueves', order: 2, name: 'Press pecho máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Push B', day: 'Jueves', order: 3, name: 'Elevaciones laterales', muscle: 'Hombro', focus: 'Hipertrofia', sets: 4, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '12-14', notes: 'Última drop set opcional' },
  { session: 'Push B', day: 'Jueves', order: 4, name: 'Pec deck / cable fly', muscle: 'Pecho', focus: 'Hipertrofia', sets: 2, repsTarget: '12-15', rir: '0', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Push B', day: 'Jueves', order: 5, name: 'Press hombro máquina', muscle: 'Hombro', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Push B', day: 'Jueves', order: 6, name: 'Tríceps sobre cabeza', muscle: 'Tríceps', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Push B', day: 'Jueves', order: 7, name: 'Elevación de piernas/rodillas', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: '' },

  // Pull B - Viernes
  { session: 'Pull B', day: 'Viernes', order: 1, name: 'Jalón al pecho', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '60', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 2, name: 'Remo pecho apoyado', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 3, name: 'Remo unilateral', muscle: 'Espalda', focus: 'Hipertrofia/control', sets: 2, repsTarget: '10-15 c/lado', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 4, name: 'Pullover polea', muscle: 'Espalda', focus: 'Hipertrofia', sets: 2, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 5, name: 'Reverse pec deck', muscle: 'Hombro posterior', focus: 'Hipertrofia', sets: 3, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 6, name: 'Curl predicador', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 7, name: 'Curl martillo', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 2, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '' },
  { session: 'Pull B', day: 'Viernes', order: 8, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },

  // Legs B - Sábado
  { session: 'Legs B', day: 'Sábado', order: 1, name: 'Hack squat / prensa', muscle: 'Cuádriceps/glúteo', focus: 'Hipertrofia controlada', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:30-3:00', initialLoad: '', notes: 'Control > carga' },
  { session: 'Legs B', day: 'Sábado', order: 2, name: 'Prensa unilateral', muscle: 'Unilateral', focus: 'Control/estabilidad', sets: 2, repsTarget: '10-12 c/lado', rir: '2', rest: '2:00', initialLoad: '', notes: 'Lado débil primero' },
  { session: 'Legs B', day: 'Sábado', order: 3, name: 'Curl femoral', muscle: 'Femoral', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Legs B', day: 'Sábado', order: 4, name: 'Extensión cuádriceps', muscle: 'Cuádriceps', focus: 'Hipertrofia controlada', sets: 2, repsTarget: '10-15', rir: '1-2', rest: '1:30-2:00', initialLoad: '70-80', notes: '' },
  { session: 'Legs B', day: 'Sábado', order: 5, name: 'Hip thrust', muscle: 'Glúteo', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '' },
  { session: 'Legs B', day: 'Sábado', order: 6, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '' },
  { session: 'Legs B', day: 'Sábado', order: 7, name: 'Crunch con carga', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: '' },
];

export function exercisesForSession(session) {
  return EXERCISES.filter((e) => e.session === session).sort((a, b) => a.order - b.order);
}
