/**
 * Utilidades para cálculo y formateo de puntos del Panel Familiar.
 * Incluye funciones para cálculos proporcionales, puntualidad, y conversión a moneda.
 */

import {
  POINTS_PER_SOL,
  DAY_STATUS_THRESHOLDS,
} from '../constants/points.constants';

/**
 * Calcula puntos proporcionales según el valor alcanzado
 * @param {number} value - Valor alcanzado (ej: 6 vasos de agua)
 * @param {number} max - Valor máximo (ej: 8 vasos)
 * @param {number} basePoints - Puntos base del hábito (ej: 100 pts)
 * @returns {number} - Puntos proporcionales redondeados
 */
export const calculateProportional = (value, max, basePoints) => {
  if (value >= max) return basePoints;
  if (value <= 0) return 0;

  const proportion = value / max;
  return Math.round(basePoints * proportion);
};

/**
 * Calcula el multiplicador de puntualidad según la diferencia con la hora objetivo
 * @param {string} actualTime - Hora real de cumplimiento 'HH:mm'
 * @param {string} targetTime - Hora objetivo 'HH:mm'
 * @returns {number} - Multiplicador: 1.0 | 0.7 | 0.3 | 0
 */
export const calculatePunctuality = (actualTime, targetTime) => {
  if (!actualTime || !targetTime) return 0;

  // Parsear horas y minutos
  const [actualHour, actualMinute] = actualTime.split(':').map(Number);
  const [targetHour, targetMinute] = targetTime.split(':').map(Number);

  // Convertir a minutos totales desde medianoche
  const actualMinutes = actualHour * 60 + actualMinute;
  const targetMinutes = targetHour * 60 + targetMinute;

  // Calcular diferencia en minutos
  const diffMinutes = actualMinutes - targetMinutes;

  // Retornar multiplicador según la diferencia
  if (diffMinutes <= 0) {
    return 1.0; // A tiempo o antes
  } else if (diffMinutes <= 15) {
    return 0.7; // 1-15 minutos tarde
  } else if (diffMinutes <= 60) {
    return 0.3; // 16-60 minutos tarde
  } else {
    return 0; // Más de 60 minutos tarde
  }
};

/**
 * Aplica el multiplicador de puntualidad a unos puntos base
 * @param {number} basePoints - Puntos base del hábito
 * @param {string} actualTime - Hora real 'HH:mm'
 * @param {string} targetTime - Hora objetivo 'HH:mm'
 * @returns {number} - Puntos ajustados por puntualidad
 */
export const applyPunctuality = (basePoints, actualTime, targetTime) => {
  const multiplier = calculatePunctuality(actualTime, targetTime);
  return Math.round(basePoints * multiplier);
};

/**
 * Formatea puntos con separador de miles
 * @param {number} pts - Cantidad de puntos
 * @returns {string} - Ejemplo: '1,240 pts' o '-50 pts'
 */
export const formatPoints = (pts) => {
  if (pts === null || pts === undefined) return '0 pts';

  const formattedNumber = pts.toLocaleString('es-PE');
  return `${formattedNumber} pts`;
};

/**
 * Convierte puntos a soles peruanos
 * @param {number} pts - Cantidad de puntos
 * @returns {string} - Ejemplo: 'S/ 2.00'
 */
export const pointsToSoles = (pts) => {
  if (pts === null || pts === undefined || pts === 0) return 'S/ 0.00';

  const soles = pts / POINTS_PER_SOL;
  return `S/ ${soles.toFixed(2)}`;
};

/**
 * Obtiene el estado del día según el total de puntos
 * @param {number} totalPoints - Total de puntos del día
 * @returns {string} - 'sin iniciar' | 'crítico' | 'regular' | 'bien' | 'excelente'
 */
export const getDayStatus = (totalPoints) => {
  if (totalPoints === 0) {
    return 'sin iniciar';
  } else if (totalPoints >= DAY_STATUS_THRESHOLDS.excelente) {
    return 'excelente';
  } else if (totalPoints >= DAY_STATUS_THRESHOLDS.bien) {
    return 'bien';
  } else if (totalPoints >= DAY_STATUS_THRESHOLDS.regular) {
    return 'regular';
  } else {
    return 'crítico';
  }
};
