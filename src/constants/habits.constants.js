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
  sleep: 'Rutina',
  movement: 'Movimiento',
  food: 'Alimentación',
  study: 'Estudio',
  cleaning: 'Orden',
  coexistence: 'Convivencia',
  household: 'Hogar',
};

// Nombres completos en español (para headers de módulos)
export const HABIT_LABELS_FULL = {
  sleep: 'Rutina, celular y noche',
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
export const SLEEP_TARGET = '22:25';
export const WAKE_TARGET = '06:30';
export const MIN_EXERCISE_MINUTES = 30;
export const MIN_WALK_AFTER_LUNCH_MINUTES = 10;
export const MOVEMENT_EXERCISE_FULL_POINTS = 45;
export const MOVEMENT_HYDRATION_FULL_POINTS = 35;
export const MOVEMENT_WALK_POINTS = 15;
export const MIN_STUDY_MINUTES = 30;
export const STUDY_FULL_POINTS = 30;
export const STUDY_NOTE_POINTS = 0;
export const STUDY_CLEAN_SPACE_POINTS = 15;
export const STUDY_NOTE_MIN_CHARS = 10;
export const CLEANING_BED_POINTS = 15;
export const CLEANING_ROOM_POINTS = 20;
export const CLEANING_SPACE_POINTS = 0;
export const COEXISTENCE_RULES_POINTS = 0;
export const COEXISTENCE_NO_OTHERS_THINGS_POINTS = 5;
export const COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY = -10;
export const COEXISTENCE_TV_WITHIN_LIMIT_POINTS = 0;
export const COEXISTENCE_TV_OVERTIME_PENALTY = 0;
export const COEXISTENCE_RESPECT_SCORE_POINTS = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};
export const HOUSEHOLD_TASK_POINTS = 80;

export const FOOD_ON_TIME_POINTS = 0;
export const FOOD_VARIETY_POINTS = 0;
export const FOOD_SALAD_POINTS = 0;
export const FOOD_NO_TV_LUNCH_POINTS = 20;
export const FOOD_TV_LUNCH_PENALTY = -35;
export const FOOD_HYDRATION_FULL_POINTS = 35;
export const FOOD_EXTRA_CARBS_PENALTY = 0;
export const FOOD_QUALITY_POINTS = {
  excelente: 0,
  buena: 0,
  regular: 0,
  mala: 0,
};
