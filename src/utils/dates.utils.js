/**
 * Utilidades para manejo de fechas y horas del Panel Familiar.
 * Usa dayjs con locale en español.
 */

import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Configurar dayjs en español
dayjs.locale('es');

/**
 * Obtiene la fecha de hoy como string 'YYYY-MM-DD'
 * @returns {string} - Ejemplo: '2025-03-22'
 */
export const getTodayString = () => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * Formatea una fecha en texto español
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} - Ejemplo: 'sábado 22 de marzo'
 */
export const formatDateES = (dateString) => {
  return dayjs(dateString).format('dddd D [de] MMMM');
};

/**
 * Retorna saludo según la hora del dispositivo
 * @returns {string} - 'Buenos días' | 'Buenas tardes' | 'Buenas noches'
 */
export const getGreeting = () => {
  const hour = dayjs().hour();

  if (hour >= 0 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 19) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
};

/**
 * Obtiene el día de la semana actual como número
 * @returns {number} - 0=domingo, 1=lunes, 2=martes ... 6=sábado
 */
export const getDayOfWeek = () => {
  return dayjs().day();
};

/**
 * Obtiene el lunes de la semana de una fecha dada
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} - Lunes de esa semana en formato 'YYYY-MM-DD'
 */
export const getWeekStart = (dateString) => {
  const date = dayjs(dateString);
  const dayOfWeek = date.day();

  // Si es domingo (0), retroceder 6 días; si no, retroceder (dayOfWeek - 1) días
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return date.subtract(daysToSubtract, 'day').format('YYYY-MM-DD');
};

/**
 * Verifica si una fecha es hoy
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {boolean} - true si es hoy
 */
export const isToday = (dateString) => {
  return dayjs(dateString).isSame(dayjs(), 'day');
};

/**
 * Formatea una hora en formato 12h español
 * @param {string} timeString - Hora en formato 'HH:mm:ss' o 'HH:mm'
 * @returns {string} - Ejemplo: '10:30 a. m.' o '10:30 p. m.'
 */
export const formatTime = (timeString) => {
  // Crear un objeto dayjs con la hora de hoy y el tiempo especificado
  const time = dayjs(`2000-01-01 ${timeString}`);

  const hour = time.hour();
  const minute = time.minute();

  // Convertir a formato 12h
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour < 12 ? 'a. m.' : 'p. m.';
  const minuteFormatted = minute.toString().padStart(2, '0');

  return `${hour12}:${minuteFormatted} ${period}`;
};

/**
 * Obtiene el domingo (fin de la semana) de una fecha dada
 * @param {string} dateString - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} - Domingo de esa semana en formato 'YYYY-MM-DD'
 */
export const getWeekEnd = (dateString) => {
  const startOfWeek = getWeekStart(dateString);
  return dayjs(startOfWeek).add(6, 'day').format('YYYY-MM-DD');
};