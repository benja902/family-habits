/**
 * Constantes del sistema de puntos y recompensas.
 * Define equivalencias de moneda, umbrales de estado del día y multiplicadores.
 */

// Equivalencias de puntos a soles peruanos
export const POINTS_PER_SOL = 500; // 500 pts = S/ 1.00
export const SOL_PER_1000_POINTS = 2.0; // 1000 pts = S/ 2.00
// Escala ajustada al sistema actual de hábitos:
// la mayoría de días completos cae alrededor de 300-350 pts.
export const MAX_POINTS_PER_DAY = 350;

// Umbrales de puntaje para el estado del día
export const DAY_STATUS_THRESHOLDS = {
  sinIniciar: 0,
  crítico: 1,
  regular: 100,
  bien: 200,
  excelente: 300,
};

// Etiquetas en español para cada estado del día
export const DAY_STATUS_LABELS = {
  'sin iniciar': 'Sin iniciar',
  'crítico': 'Crítico',
  regular: 'Regular',
  bien: 'Bien',
  excelente: '¡Excelente!',
};

// Colores hex para cada estado del día
export const DAY_STATUS_COLORS = {
  'sin iniciar': '#64748B',
  'crítico': '#EF4444',
  regular: '#F59E0B',
  bien: '#3B82F6',
  excelente: '#22C55E',
};

// Multiplicadores para cálculo proporcional de puntualidad
export const PUNCTUALITY_MULTIPLIERS = {
  onTime: 1.0, // a tiempo
  slightlyLate: 0.7, // pocos minutos tarde
  veryLate: 0.3, // muy tarde
  missed: 0, // no cumplió
};
