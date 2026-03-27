/**
 * Hook para el módulo de descanso y dispositivos
 * Maneja el estado y lógica de guardado del registro de sueño
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSleepRecord, getCleaningRecord, calculateAndSaveSleepPoints, saveMorningRoutineBed } from '../services/supabase';
import useAuthStore from '../stores/useAuthStore';
import { getTodayString } from '../utils/dates.utils';
import { toast } from 'sonner';

export default function useSleepModule() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const today = getTodayString();

  // Query para obtener el registro de descanso de hoy
  const {
    data: sleepRecord,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sleepRecord', userId, today],
    queryFn: () => getSleepRecord(userId, today),
    enabled: !!userId,
  });

  const { data: cleaningRecord } = useQuery({
    queryKey: ['cleaningRecord', userId, today],
    queryFn: () => getCleaningRecord(userId, today),
    enabled: !!userId,
  });

  // Determinar si ya existe un registro guardado
  const hasRecord = !!sleepRecord || !!cleaningRecord?.bed_made;

  // Mutación para guardar el registro de descanso
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const { bed_made, ...sleepData } = formData;

      const [sleepResult, bedResult] = await Promise.all([
        calculateAndSaveSleepPoints(userId, today, sleepData),
        saveMorningRoutineBed(userId, today, !!bed_made),
      ]);

      return {
        pointsEarned: sleepResult.pointsEarned + bedResult.pointsEarned,
        transactions: sleepResult.transactions,
        sleepRecord: sleepResult.record,
        cleaningRecord: bedResult.savedRecord,
      };
    },
    onSuccess: async (result) => {
      const { pointsEarned, transactions } = result;

      // Contar penalizaciones
      const penalties = transactions.filter((t) => t.amount < 0);
      const penaltyTotal = penalties.reduce((sum, t) => sum + t.amount, 0);

      // Construir mensaje de toast
      let message;
      if (pointsEarned > 0) {
        message = `¡+${pointsEarned} pts! Rutina registrada`;
      } else if (pointsEarned === 0) {
        message = 'Rutina registrada';
      } else {
        message = `Rutina registrada. ${penaltyTotal} pts en ajustes`;
      }

      // Si hay puntos positivos pero también penalizaciones, incluirlas
      if (pointsEarned > 0 && penaltyTotal < 0) {
        message = `¡+${pointsEarned + Math.abs(penaltyTotal)} pts! Rutina registrada (${penaltyTotal} pts en ajustes)`;
      }

      toast.success(message);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dailyRecord'] }),
        queryClient.invalidateQueries({ queryKey: ['completedHabits'] }),
      ]);

      queryClient.invalidateQueries({ queryKey: ['sleepRecord'] });
      queryClient.invalidateQueries({ queryKey: ['cleaningRecord'] });
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });
      navigate('/dashboard');

    },
    onError: () => {
      toast.error('No se pudo guardar. Intenta de nuevo.');
    },
  });

  return {
    // Estado de la query
    sleepRecord,
    cleaningRecord,
    isLoading,
    isError,

    // Estado del formulario
    hasRecord,

    // Mutación para guardar
    saveSleep: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
