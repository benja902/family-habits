import { useEffect } from 'react'; // <-- NUEVO
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRewards, getUserRedemptions, redeemReward } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';
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
  // ESCUCHA EN TIEMPO REAL: Si el admin aprueba/rechaza, el usuario se entera al instante
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('user-redemptions-listener')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'reward_redemptions',
          filter: `user_id=eq.${currentUser.id}` // ¡Solo escucha sus propios premios!
        },
        (payload) => {
          // Si hay un cambio, actualizamos su historial y sus puntos
          queryClient.invalidateQueries({ queryKey: ['redemptions', currentUser.id] });
          queryClient.invalidateQueries({ queryKey: ['userPointsBalance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, queryClient]);

  return {
    rewards: rewardsQuery.data || [],
    isLoadingRewards: rewardsQuery.isLoading,
    redemptions: redemptionsQuery.data || [],
    isLoadingRedemptions: redemptionsQuery.isLoading,
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
  };
  
}