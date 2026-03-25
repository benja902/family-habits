import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserPunishments, markPunishmentCompleted } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function usePunishments() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['punishments', currentUser?.id],
    queryFn: () => getUserPunishments(currentUser?.id),
    enabled: !!currentUser?.id,
  });
  // 👇 EL OÍDO MÁGICO DE TIEMPO REAL 👇
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = supabase
      .channel('realtime-punishments')
      .on(
        'postgres_changes',
        { 
          event: '*', // Escucha TODO (cuando el admin inserta, o cuando tú actualizas a cumplido)
          schema: 'public', 
          table: 'punishments',
          filter: `user_id=eq.${currentUser.id}` // Solo escucha los castigos de este usuario
        },
        () => {
          // ¡BOOM! Alerta a React para que actualice la pantalla al instante
          queryClient.invalidateQueries({ queryKey: ['punishments', currentUser.id] });
          queryClient.invalidateQueries({ queryKey: ['userPointsBalance'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Limpieza al salir
    };
  }, [currentUser?.id, queryClient]);

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