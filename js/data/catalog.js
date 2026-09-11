// Catálogo de ejercicios y configuración del plan.
// Extraído 1:1 de Dashboard_Entrenamiento_V2.xlsx (hojas EJERCICIOS y CONFIG).
// No modificar el plan aquí sin justificación explícita del usuario.
//
// substitutes: 3 alternativas realistas si la máquina/ejercicio no está disponible en el gym.
// dropSetSuggested: true en los accesorios donde el usuario ya usaba drop sets (laterales,
// bíceps, tríceps, extensión de pierna, curl femoral, pec deck, pantorrilla, remo/reverse en
// máquina). false en los levantamientos pesados de fuerza (press inclinado, remo pesado, RDL,
// prensa, dominada, hack squat) para no convertirlos en cardio, según su propia filosofía de
// entrenamiento — pero el botón de "añadir drop set" sigue disponible en todos, es su criterio.

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

const SUB = {
  pressInclinadoBarra: ['Press inclinado con mancuernas', 'Press inclinado en Smith', 'Press pecho en máquina'],
  pressHombroMaquina: ['Press militar con mancuernas sentado', 'Press de hombro en Smith', 'Press de hombro en polea'],
  pressPechoMaquina: ['Press banca con mancuernas plano', 'Press pecho en Smith', 'Pec deck / aperturas'],
  elevacionesLaterales: ['Elevaciones laterales en polea', 'Elevaciones laterales en máquina', 'Elevación lateral en banco inclinado'],
  tricepsPolea: ['Tríceps en polea con cuerda', 'Fondos en máquina asistida', 'Extensión de tríceps con mancuerna'],
  crunchCable: ['Crunch de rodillas en polea alta', 'Máquina de abdominales', 'Crunch con disco en el suelo'],
  dominadaAsistida: ['Jalón al pecho agarre ancho', 'Dominada con banda elástica', 'Pullover en polea alta'],
  remoPechoApoyado: ['Remo en máquina Hammer', 'Remo con mancuerna a una mano', 'Remo en polea baja sentado'],
  jalonAlPecho: ['Jalón unilateral en polea', 'Dominada asistida', 'Jalón tras nuca agarre neutro'],
  remoCableMaquina: ['Remo en polea con cuerda', 'Remo en máquina Hammer', 'Remo con mancuerna'],
  reversePecDeck: ['Face pull en polea', 'Aperturas invertidas con mancuernas en banco inclinado', 'Deltoide posterior en polea cruzada'],
  curlBiceps: ['Curl con barra Z', 'Curl con mancuernas alterno', 'Curl en polea baja'],
  pantorrilla: ['Pantorrilla en prensa', 'Pantorrilla sentado', 'Pantorrilla a una pierna con mancuerna'],
  prensaBilateral: ['Sentadilla en Smith', 'Hack squat', 'Sentadilla goblet con mancuerna'],
  pesoMuertoRumano: ['RDL con mancuernas', 'Buenos días con barra', 'Curl femoral + hip thrust combinados'],
  bulgaraAsistida: ['Zancada caminando', 'Prensa unilateral', 'Step-up con banco'],
  curlFemoral: ['Curl femoral de pie', 'Curl femoral sentado', 'Peso muerto rumano ligero'],
  extensionCuadriceps: ['Sentadilla en Smith a rango parcial', 'Prensa con pies bajos', 'Zancada estática'],
  pallofPress: ['Pallof press con banda elástica', 'Plancha con rotación', 'Crunch en polea'],
  pecDeck: ['Aperturas con mancuernas en plano', 'Cruce de poleas (cable crossover)', 'Press pecho máquina agarre estrecho'],
  tricepsSobreCabeza: ['Extensión de tríceps en polea alta con cuerda', 'Press francés con mancuernas', 'Fondos en banco'],
  elevacionPiernas: ['Rodillas al pecho en silla romana', 'Elevación de piernas colgado de la barra', 'Crunch inverso en banco'],
  remoUnilateral: ['Remo con mancuerna apoyado en banco', 'Remo en polea baja a un brazo', 'Remo en máquina Hammer un lado'],
  pulloverPolea: ['Pullover con mancuerna', 'Pullover en máquina', 'Jalón al pecho agarre ancho'],
  curlPredicador: ['Curl predicador con mancuerna', 'Curl Scott en polea', 'Curl concentrado'],
  curlMartillo: ['Curl martillo en polea con cuerda', 'Curl martillo alterno', 'Curl inverso con barra Z'],
  hackSquat: ['Prensa a 45°', 'Sentadilla en Smith', 'Sentadilla goblet con mancuerna'],
  prensaUnilateral: ['Búlgara asistida', 'Zancada caminando', 'Step-up con banco'],
  hipThrust: ['Puente de glúteo con barra en el suelo', 'Hip thrust en máquina', 'Patada de glúteo en polea'],
  crunchConCarga: ['Crunch en polea', 'Crunch con disco', 'Máquina de abdominales'],
};

// Series: { session, day, order, name, muscle, focus, sets, repsTarget, rir, rest, initialLoad, notes, substitutes, dropSetSuggested }
export const EXERCISES = [
  // Push A - Lunes
  { session: 'Push A', day: 'Lunes', order: 1, name: 'Press inclinado barra', muscle: 'Pecho', focus: 'Fuerza', sets: 3, repsTarget: '5-7', rir: '1-2', rest: '3:00-4:00', initialLoad: '60', notes: 'Sin fallo sin spotter', substitutes: SUB.pressInclinadoBarra, dropSetSuggested: false },
  { session: 'Push A', day: 'Lunes', order: 2, name: 'Press hombro máquina', muscle: 'Hombro', focus: 'Fuerza', sets: 3, repsTarget: '6-8', rir: '1-2', rest: '2:30-3:00', initialLoad: '', notes: '', substitutes: SUB.pressHombroMaquina, dropSetSuggested: false },
  { session: 'Push A', day: 'Lunes', order: 3, name: 'Press pecho máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-2:30', initialLoad: '', notes: '', substitutes: SUB.pressPechoMaquina, dropSetSuggested: true },
  { session: 'Push A', day: 'Lunes', order: 4, name: 'Elevaciones laterales', muscle: 'Hombro', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '12-14', notes: 'Última: drop set', substitutes: SUB.elevacionesLaterales, dropSetSuggested: true },
  { session: 'Push A', day: 'Lunes', order: 5, name: 'Tríceps polea', muscle: 'Tríceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.tricepsPolea, dropSetSuggested: true },
  { session: 'Push A', day: 'Lunes', order: 6, name: 'Crunch cable/máquina', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: 'Con carga progresiva', substitutes: SUB.crunchCable, dropSetSuggested: false },

  // Pull A - Martes
  { session: 'Pull A', day: 'Martes', order: 1, name: 'Dominada asistida', muscle: 'Espalda', focus: 'Fuerza', sets: 3, repsTarget: '5-8', rir: '1-2', rest: '3:00', initialLoad: '', notes: 'Reducir asistencia gradualmente', substitutes: SUB.dominadaAsistida, dropSetSuggested: false },
  { session: 'Pull A', day: 'Martes', order: 2, name: 'Remo pecho apoyado', muscle: 'Espalda', focus: 'Fuerza', sets: 3, repsTarget: '5-8', rir: '1-2', rest: '3:00', initialLoad: '', notes: '', substitutes: SUB.remoPechoApoyado, dropSetSuggested: false },
  { session: 'Pull A', day: 'Martes', order: 3, name: 'Jalón al pecho', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-3:00', initialLoad: '60', notes: 'Referencia principal de espalda', substitutes: SUB.jalonAlPecho, dropSetSuggested: false },
  { session: 'Pull A', day: 'Martes', order: 4, name: 'Remo cable/máquina', muscle: 'Espalda', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.remoCableMaquina, dropSetSuggested: true },
  { session: 'Pull A', day: 'Martes', order: 5, name: 'Reverse pec deck', muscle: 'Hombro posterior', focus: 'Hipertrofia', sets: 3, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.reversePecDeck, dropSetSuggested: true },
  { session: 'Pull A', day: 'Martes', order: 6, name: 'Curl bíceps', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.curlBiceps, dropSetSuggested: true },
  { session: 'Pull A', day: 'Martes', order: 7, name: 'Pantorrilla de pie', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: 'Pausa y estiramiento controlado', substitutes: SUB.pantorrilla, dropSetSuggested: true },

  // Legs A - Miércoles
  { session: 'Legs A', day: 'Miércoles', order: 1, name: 'Prensa bilateral', muscle: 'Cuádriceps/glúteo', focus: 'Fuerza controlada', sets: 3, repsTarget: '6-8', rir: '2', rest: '3:00-4:00', initialLoad: '120', notes: '3 discos de 20 por lado; rango constante', substitutes: SUB.prensaBilateral, dropSetSuggested: false },
  { session: 'Legs A', day: 'Miércoles', order: 2, name: 'Peso muerto rumano', muscle: 'Femoral/glúteo', focus: 'Fuerza', sets: 3, repsTarget: '6-10', rir: '1-2', rest: '3:00', initialLoad: '', notes: '', substitutes: SUB.pesoMuertoRumano, dropSetSuggested: false },
  { session: 'Legs A', day: 'Miércoles', order: 3, name: 'Búlgara asistida', muscle: 'Unilateral', focus: 'Control/estabilidad', sets: 2, repsTarget: '8-10 c/lado', rir: '2', rest: '2:00', initialLoad: '', notes: 'Apoyo ligero; lado débil primero', substitutes: SUB.bulgaraAsistida, dropSetSuggested: false },
  { session: 'Legs A', day: 'Miércoles', order: 4, name: 'Curl femoral', muscle: 'Femoral', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.curlFemoral, dropSetSuggested: true },
  { session: 'Legs A', day: 'Miércoles', order: 5, name: 'Extensión cuádriceps', muscle: 'Cuádriceps', focus: 'Hipertrofia controlada', sets: 2, repsTarget: '10-15', rir: '1-2', rest: '1:30-2:00', initialLoad: '70-80', notes: 'Sin fallo agresivo en pierna afectada', substitutes: SUB.extensionCuadriceps, dropSetSuggested: true },
  { session: 'Legs A', day: 'Miércoles', order: 6, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.pantorrilla, dropSetSuggested: true },
  { session: 'Legs A', day: 'Miércoles', order: 7, name: 'Pallof press / crunch', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '1', rest: '1:00-1:30', initialLoad: '', notes: '', substitutes: SUB.pallofPress, dropSetSuggested: false },

  // Push B - Jueves
  { session: 'Push B', day: 'Jueves', order: 1, name: 'Press inclinado Smith/máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00-2:30', initialLoad: '', notes: '', substitutes: SUB.pressInclinadoBarra, dropSetSuggested: false },
  { session: 'Push B', day: 'Jueves', order: 2, name: 'Press pecho máquina', muscle: 'Pecho', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.pressPechoMaquina, dropSetSuggested: true },
  { session: 'Push B', day: 'Jueves', order: 3, name: 'Elevaciones laterales', muscle: 'Hombro', focus: 'Hipertrofia', sets: 4, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '12-14', notes: 'Última drop set opcional', substitutes: SUB.elevacionesLaterales, dropSetSuggested: true },
  { session: 'Push B', day: 'Jueves', order: 4, name: 'Pec deck / cable fly', muscle: 'Pecho', focus: 'Hipertrofia', sets: 2, repsTarget: '12-15', rir: '0', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.pecDeck, dropSetSuggested: true },
  { session: 'Push B', day: 'Jueves', order: 5, name: 'Press hombro máquina', muscle: 'Hombro', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.pressHombroMaquina, dropSetSuggested: false },
  { session: 'Push B', day: 'Jueves', order: 6, name: 'Tríceps sobre cabeza', muscle: 'Tríceps', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.tricepsSobreCabeza, dropSetSuggested: true },
  { session: 'Push B', day: 'Jueves', order: 7, name: 'Elevación de piernas/rodillas', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '8-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: '', substitutes: SUB.elevacionPiernas, dropSetSuggested: false },

  // Pull B - Viernes
  { session: 'Pull B', day: 'Viernes', order: 1, name: 'Jalón al pecho', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '60', notes: '', substitutes: SUB.jalonAlPecho, dropSetSuggested: false },
  { session: 'Pull B', day: 'Viernes', order: 2, name: 'Remo pecho apoyado', muscle: 'Espalda', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.remoPechoApoyado, dropSetSuggested: false },
  { session: 'Pull B', day: 'Viernes', order: 3, name: 'Remo unilateral', muscle: 'Espalda', focus: 'Hipertrofia/control', sets: 2, repsTarget: '10-15 c/lado', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.remoUnilateral, dropSetSuggested: false },
  { session: 'Pull B', day: 'Viernes', order: 4, name: 'Pullover polea', muscle: 'Espalda', focus: 'Hipertrofia', sets: 2, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.pulloverPolea, dropSetSuggested: true },
  { session: 'Pull B', day: 'Viernes', order: 5, name: 'Reverse pec deck', muscle: 'Hombro posterior', focus: 'Hipertrofia', sets: 3, repsTarget: '12-20', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.reversePecDeck, dropSetSuggested: true },
  { session: 'Pull B', day: 'Viernes', order: 6, name: 'Curl predicador', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.curlPredicador, dropSetSuggested: true },
  { session: 'Pull B', day: 'Viernes', order: 7, name: 'Curl martillo', muscle: 'Bíceps', focus: 'Hipertrofia', sets: 2, repsTarget: '10-15', rir: '0-1', rest: '1:30', initialLoad: '', notes: '', substitutes: SUB.curlMartillo, dropSetSuggested: true },
  { session: 'Pull B', day: 'Viernes', order: 8, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.pantorrilla, dropSetSuggested: true },

  // Legs B - Sábado
  { session: 'Legs B', day: 'Sábado', order: 1, name: 'Hack squat / prensa', muscle: 'Cuádriceps/glúteo', focus: 'Hipertrofia controlada', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:30-3:00', initialLoad: '', notes: 'Control > carga', substitutes: SUB.hackSquat, dropSetSuggested: false },
  { session: 'Legs B', day: 'Sábado', order: 2, name: 'Prensa unilateral', muscle: 'Unilateral', focus: 'Control/estabilidad', sets: 2, repsTarget: '10-12 c/lado', rir: '2', rest: '2:00', initialLoad: '', notes: 'Lado débil primero', substitutes: SUB.prensaUnilateral, dropSetSuggested: false },
  { session: 'Legs B', day: 'Sábado', order: 3, name: 'Curl femoral', muscle: 'Femoral', focus: 'Hipertrofia', sets: 3, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.curlFemoral, dropSetSuggested: true },
  { session: 'Legs B', day: 'Sábado', order: 4, name: 'Extensión cuádriceps', muscle: 'Cuádriceps', focus: 'Hipertrofia controlada', sets: 2, repsTarget: '10-15', rir: '1-2', rest: '1:30-2:00', initialLoad: '70-80', notes: '', substitutes: SUB.extensionCuadriceps, dropSetSuggested: true },
  { session: 'Legs B', day: 'Sábado', order: 5, name: 'Hip thrust', muscle: 'Glúteo', focus: 'Hipertrofia', sets: 2, repsTarget: '8-12', rir: '1-2', rest: '2:00', initialLoad: '', notes: '', substitutes: SUB.hipThrust, dropSetSuggested: false },
  { session: 'Legs B', day: 'Sábado', order: 6, name: 'Pantorrilla', muscle: 'Pantorrilla', focus: 'Hipertrofia', sets: 3, repsTarget: '10-20', rir: '0-1', rest: '1:30-2:00', initialLoad: '', notes: '', substitutes: SUB.pantorrilla, dropSetSuggested: true },
  { session: 'Legs B', day: 'Sábado', order: 7, name: 'Crunch con carga', muscle: 'Abdomen', focus: 'Hipertrofia', sets: 3, repsTarget: '10-15', rir: '0-1', rest: '1:00-1:30', initialLoad: '', notes: '', substitutes: SUB.crunchConCarga, dropSetSuggested: false },
];

export function exercisesForSession(session) {
  return EXERCISES.filter((e) => e.session === session).sort((a, b) => a.order - b.order);
}
