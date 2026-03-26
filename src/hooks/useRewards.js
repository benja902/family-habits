import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRewards, getUserRedemptions, redeemReward } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';

export default function useRewards() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

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
    // 👇 AQUÍ ESTABA EL ERROR: Ahora empatamos perfectamente los datos 👇
    mutationFn: ({ rewardId, type }) => redeemReward(currentUser?.id, rewardId, type),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', currentUser?.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });

      if (variables.type === 'dinero') {
        toast.success('¡Solicitud enviada! Benjamín debe aprobarla.');
      } else {
        toast.success('¡Premio canjeado con éxito!');
      }
    },
    onError: (error) => {
      console.error('Error al canjear:', error);
      toast.error('No se pudo canjear el premio. Intenta de nuevo.');
    }
  });

  // NOTA: El listener de realtime se movió a useRealtimeListeners (global en App.jsx)

  return {
    rewards: rewardsQuery.data || [],
    isLoadingRewards: rewardsQuery.isLoading,
    redemptions: redemptionsQuery.data || [],
    isLoadingRedemptions: redemptionsQuery.isLoading,
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
  };
  
}