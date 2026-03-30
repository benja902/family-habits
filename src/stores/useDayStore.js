/**
 * Store del estado del día actual del usuario.
 * Maneja los puntos, el porcentaje de completitud y el estado del día.
 * No persiste: el estado se recarga desde Supabase al entrar.
 */

import { create } from 'zustand';
import { getDayStatus } from '../utils/points.utils';

// Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export const useDayStore = create((set) => ({
  // Estado
  today: getTodayDate(),
  dayPoints: 0,
  dayStatus: 'sin iniciar',
  completionPct: 0,

  // Acciones
  setDayPoints: (points) =>
    set({
      dayPoints: points,
      dayStatus: getDayStatus(points),
    }),

  setCompletionPct: (pct) =>
    set({ completionPct: pct }),

  resetDay: () =>
    set({
      today: getTodayDate(),
      dayPoints: 0,
      dayStatus: 'sin iniciar',
      completionPct: 0,
    }),
}));

export default useDayStore;
