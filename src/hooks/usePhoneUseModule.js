import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getPointTransactionsByCategory, getSleepRecord, savePhoneUseProgress } from '../services/supabase';
import useAuthStore from '../stores/useAuthStore';
import { getTodayString } from '../utils/dates.utils';
import { toast } from 'sonner';

export default function usePhoneUseModule() {
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

  const { data: phoneUseTransactions } = useQuery({
    queryKey: ['phoneUseTransactions', userId, today],
    queryFn: () => getPointTransactionsByCategory(userId, today, 'phone_use'),
    enabled: !!userId,
  });

  const hasRecord = (phoneUseTransactions?.length || 0) > 0;

  const mutation = useMutation({
    mutationFn: (formData) => savePhoneUseProgress(userId, today, formData),
    onSuccess: async (result) => {
      const pointsEarned = result?.pointsEarned ?? 0;
      const transactions = result?.transactions || [];
      const penalties = transactions.filter((transaction) => transaction.amount < 0);
      const penaltyTotal = penalties.reduce((sum, transaction) => sum + transaction.amount, 0);

      let message;
      if (pointsEarned > 0) {
        message = `¡+${pointsEarned} pts! Celular registrado`;
      } else if (pointsEarned === 0) {
        message = 'Rutina del celular registrada';
      } else {
        message = `Rutina del celular registrada. ${penaltyTotal} pts en ajustes`;
      }

      if (pointsEarned > 0 && penaltyTotal < 0) {
        message = `¡+${pointsEarned + Math.abs(penaltyTotal)} pts! Celular registrado (${penaltyTotal} pts en ajustes)`;
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
      toast.error('No se pudo guardar la rutina del celular. Intenta de nuevo.');
    },
  });

  return {
    sleepRecord,
    isLoading,
    isError,
    hasRecord,
    savePhoneUse: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
