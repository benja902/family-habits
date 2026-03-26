import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPunishments, markPunishmentCompleted } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';

export default function usePunishments() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['punishments', currentUser?.id],
    queryFn: () => getUserPunishments(currentUser?.id),
    enabled: !!currentUser?.id,
  });

  // NOTA: El listener de realtime se movió a useRealtimeListeners (global en App.jsx)
  // Ya no necesitamos el useEffect local aquí

  const completeMutation = useMutation({
    mutationFn: (punishmentId) => markPunishmentCompleted(punishmentId),
    onSuccess: () => {
      // Actualizamos la lista de castigos
      queryClient.invalidateQueries({ queryKey: ['punishments', currentUser?.id], refetchType: 'all' });
      toast.success('¡Castigo marcado como cumplido!');
    },
    onError: (error) => {
      console.error('Error al completar castigo:', error);
      toast.error('No se pudo actualizar. Intenta de nuevo.');
    }
  });
  

  return {
    punishments: query.data || [],
    isLoading: query.isLoading,
    markCompleted: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
  };
}