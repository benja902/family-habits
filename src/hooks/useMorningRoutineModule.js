import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  getCleaningRecord,
  getSleepRecord,
  saveMorningRoutineProgress,
  saveMorningRoutineBed,
} from '../services/supabase';
import useAuthStore from '../stores/useAuthStore';
import { getTodayString } from '../utils/dates.utils';
import { toast } from 'sonner';

export default function useMorningRoutineModule() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const today = getTodayString();

  const {
    data: sleepRecord,
    isLoading: isLoadingSleep,
    isError: isSleepError,
  } = useQuery({
    queryKey: ['sleepRecord', userId, today],
    queryFn: () => getSleepRecord(userId, today),
    enabled: !!userId,
  });

  const {
    data: cleaningRecord,
    isLoading: isLoadingCleaning,
    isError: isCleaningError,
  } = useQuery({
    queryKey: ['cleaningRecord', userId, today],
    queryFn: () => getCleaningRecord(userId, today),
    enabled: !!userId,
  });

  const hasRecord = !!(sleepRecord?.wake_time || cleaningRecord?.bed_made);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const [sleepResult, bedResult] = await Promise.all([
        saveMorningRoutineProgress(userId, today, formData),
        saveMorningRoutineBed(userId, today, !!formData.bed_made),
      ]);

      return {
        pointsEarned: (sleepResult?.pointsEarned ?? 0) + (bedResult?.pointsEarned ?? 0),
        transactions: sleepResult?.transactions || [],
      };
    },
    onSuccess: async (result) => {
      const pointsEarned = result?.pointsEarned ?? 0;
      const transactions = result?.transactions || [];
      const penalties = transactions.filter((transaction) => transaction.amount < 0);
      const penaltyTotal = penalties.reduce((sum, transaction) => sum + transaction.amount, 0);

      let message;
      if (pointsEarned > 0) {
        message = `¡+${pointsEarned} pts! Mañana registrada`;
      } else if (pointsEarned === 0) {
        message = 'Rutina de mañana registrada';
      } else {
        message = `Rutina de mañana registrada. ${penaltyTotal} pts en ajustes`;
      }

      if (pointsEarned > 0 && penaltyTotal < 0) {
        message = `¡+${pointsEarned + Math.abs(penaltyTotal)} pts! Mañana registrada (${penaltyTotal} pts en ajustes)`;
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
      toast.error('No se pudo guardar la rutina de mañana. Intenta de nuevo.');
    },
  });

  return {
    sleepRecord,
    cleaningRecord,
    isLoading: isLoadingSleep || isLoadingCleaning,
    isError: isSleepError || isCleaningError,
    hasRecord,
    saveMorningRoutine: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
