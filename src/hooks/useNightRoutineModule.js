import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getSleepRecord, saveNightRoutineProgress } from '../services/supabase';
import useAuthStore from '../stores/useAuthStore';
import { getTodayString } from '../utils/dates.utils';
import { toast } from 'sonner';

export default function useNightRoutineModule() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id;
  const today = getTodayString();

  const {
    data: sleepRecord,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sleepRecord', userId, today],
    queryFn: () => getSleepRecord(userId, today),
    enabled: !!userId,
  });

  const hasRecord = !!(sleepRecord?.sleep_time || sleepRecord?.slept_by_11);

  const mutation = useMutation({
    mutationFn: (formData) => saveNightRoutineProgress(userId, today, formData),
    onSuccess: async (result) => {
      const pointsEarned = result?.pointsEarned ?? 0;
      const transactions = result?.transactions || [];
      const penalties = transactions.filter((transaction) => transaction.amount < 0);
      const penaltyTotal = penalties.reduce((sum, transaction) => sum + transaction.amount, 0);

      let message;
      if (pointsEarned > 0) {
        message = `¡+${pointsEarned} pts! Noche registrada`;
      } else if (pointsEarned === 0) {
        message = 'Rutina de noche registrada';
      } else {
        message = `Rutina de noche registrada. ${penaltyTotal} pts en ajustes`;
      }

      if (pointsEarned > 0 && penaltyTotal < 0) {
        message = `¡+${pointsEarned + Math.abs(penaltyTotal)} pts! Noche registrada (${penaltyTotal} pts en ajustes)`;
      }

      toast.success(message);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dailyRecord'] }),
        queryClient.invalidateQueries({ queryKey: ['completedHabits'] }),
      ]);

      queryClient.invalidateQueries({ queryKey: ['sleepRecord'] });
      queryClient.invalidateQueries({ queryKey: ['pointTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('No se pudo guardar la rutina de noche. Intenta de nuevo.');
    },
  });

  return {
    sleepRecord,
    isLoading,
    isError,
    hasRecord,
    saveNightRoutine: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
