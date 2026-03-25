import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRewards, getUserRedemptions, redeemReward } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';

export default function useRewards() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // 1. Obtener catálogo de premios disponibles
  const rewardsQuery = useQuery({
    queryKey: ['rewards'],
    queryFn: getRewards,
    staleTime: 1000 * 60 * 60, // Guardar en caché por 1 hora
  });

  // 2. Obtener historial de premios que ya pidió el usuario actual
  const redemptionsQuery = useQuery({
    queryKey: ['redemptions', currentUser?.id],
    queryFn: () => getUserRedemptions(currentUser?.id),
    enabled: !!currentUser?.id, // Solo ejecutar si hay un usuario logueado
  });

  // 3. Función para comprar (canjear) un premio
  const redeemMutation = useMutation({
    mutationFn: ({ rewardId, type }) => 
      redeemReward(currentUser?.id, rewardId, type),
    onSuccess: (data, variables) => {
      // Regla 6: Invalidar las consultas para actualizar la UI inmediatamente
      queryClient.invalidateQueries({ queryKey: ['redemptions', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser?.id] });      
      // Mostrar el mensaje correcto según la Regla de aprobación
      if (variables.type === 'dinero') {
        toast.success('¡Solicitud enviada! Benjamín debe aprobarla. ⏳');
      } else {
        toast.success('¡Premio canjeado con éxito! 🎉');
      }
    },
    onError: (error) => {
      console.error('Error al canjear:', error);
      toast.error('No se pudo canjear el premio. Intenta de nuevo.');
    }
  });

  return {
    rewards: rewardsQuery.data || [],
    isLoadingRewards: rewardsQuery.isLoading,
    redemptions: redemptionsQuery.data || [],
    isLoadingRedemptions: redemptionsQuery.isLoading,
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
  };
}