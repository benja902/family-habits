import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRewards, getUserRedemptions, redeemReward } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';

export default function useRewards() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const redeemInFlightRef = useRef(false);

  const rewardsQuery = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
    staleTime: 1000 * 60 * 60,
  });

  const redemptionsQuery = useQuery({
    queryKey: ['redemptions', currentUser?.id],
    queryFn: () => getUserRedemptions(currentUser?.id),
    enabled: !!currentUser?.id,
  });

  const redeemMutation = useMutation({
    mutationFn: ({ rewardId }) => redeemReward(currentUser?.id, rewardId),
    onMutate: async ({ rewardCost = 0 }) => {
      const balanceQueryKey = ['userPointsBalance', currentUser?.id];

      await queryClient.cancelQueries({ queryKey: balanceQueryKey });

      const previousBalance = queryClient.getQueryData(balanceQueryKey);

      queryClient.setQueryData(balanceQueryKey, (current) => {
        if (!current) return current;

        return {
          ...current,
          totalSpent: (current.totalSpent || 0) + rewardCost,
          currentBalance: Math.max(0, (current.currentBalance || 0) - rewardCost),
        };
      });

      return { previousBalance, balanceQueryKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', currentUser?.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser?.id], refetchType: 'all' });
      toast.success('¡Solicitud enviada! Espera la aprobación del admin.');
    },
    onError: (error, _variables, context) => {
      if (context?.previousBalance) {
        queryClient.setQueryData(context.balanceQueryKey, context.previousBalance);
      }

      console.error('Error al canjear:', error);
      toast.error(error?.message || 'No se pudo canjear el premio. Intenta de nuevo.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser?.id], refetchType: 'all' });
      redeemInFlightRef.current = false;
    },
  });

  const handleRedeemReward = async ({ rewardId, rewardCost }) => {
    if (!currentUser?.id || redeemInFlightRef.current) return;

    redeemInFlightRef.current = true;

    try {
      await redeemMutation.mutateAsync({ rewardId, rewardCost });
    } catch {
      // El feedback se maneja dentro del mutation lifecycle.
    }
  };

  // NOTA: El listener de realtime se movió a useRealtimeListeners (global en App.jsx)

  return {
    rewards: rewardsQuery.data || [],
    isLoadingRewards: rewardsQuery.isLoading,
    redemptions: redemptionsQuery.data || [],
    isLoadingRedemptions: redemptionsQuery.isLoading,
    redeemReward: handleRedeemReward,
    isRedeeming: redeemMutation.isPending,
  };
  
}
