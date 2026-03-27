/**
 * Constantes de los 7 ámbitos de hábitos del Panel Familiar.
 * Define keys, labels, íconos, colores y metas para cada categoría.
 */

// Array con los 7 keys de ámbitos en orden
export const HABIT_KEYS = [
  'sleep',
  'movement',
  'food',
  'study',
  'cleaning',
  'coexistence',
  'household',
];

// Nombres cortos en español (para cards y navegación)
export const HABIT_LABELS = {
  sleep: 'Descanso',
  movement: 'Movimiento',
  food: 'Alimentación',
  study: 'Estudio',
  cleaning: 'Orden',
  coexistence: 'Convivencia',
  household: 'Hogar',
};

// Nombres completos en español (para headers de módulos)
export const HABIT_LABELS_FULL = {
  sleep: 'Descanso y dispositivos',
  movement: 'Movimiento y salud física',
  food: 'Alimentación',
  study: 'Estudio y crecimiento',
  cleaning: 'Orden y limpieza',
  coexistence: 'Respeto y convivencia',
  household: 'Responsabilidades del hogar',
};

// Íconos de react-icons/bs (Bootstrap Icons)
export const HABIT_ICONS = {
  sleep: 'BsMoonStarsFill',
  movement: 'BsLightningChargeFill',
  food: 'BsEggFried',
  study: 'BsBookFill',
  cleaning: 'BsStars',
  coexistence: 'BsPeopleFill',
  household: 'BsHouseFill',
};

// Colores hex de cada ámbito (sincronizados con theme.HABIT_COLORS)
export const HABIT_COLORS = {
  sleep: '#6366F1',
  movement: '#22C55E',
  food: '#F97316',
  study: '#3B82F6',
  cleaning: '#EAB308',
  coexistence: '#EC4899',
  household: '#14B8A6',
};

// Constantes de metas diarias
export const MAX_WATER_GLASSES = 8;
export const MAX_TV_MINUTES = 120;
export const DEVICE_CURFEW = '22:00';
export const SLEEP_TARGET = '23:00';
export const WAKE_TARGET = '06:30';
export const MIN_EXERCISE_MINUTES = 20;
export const MIN_WALK_AFTER_LUNCH_MINUTES = 1;
export const MIN_STUDY_MINUTES = 30;
