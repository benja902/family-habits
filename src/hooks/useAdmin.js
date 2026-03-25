import { useEffect } from 'react'; // <-- NUEVO
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingRedemptions,
  updateRedemptionStatus,
  assignPunishment,
  cancelPunishment,
  getFamilyMembers
} from '../services/supabase';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient'; // Cliente de Supabase

export default function useAdmin() {
  const queryClient = useQueryClient();

  // 1. OBTENER DATOS (Queries)
  
  // Lista de premios esperando aprobación
  const pendingRedemptionsQuery = useQuery({
    queryKey: ['pendingRedemptions'],
    queryFn: getPendingRedemptions,
    // Refrescamos cada 2 minutos por si alguien pide un premio mientras el admin está conectado
    staleTime: 1000 * 60 * 2, 
  });

  // Lista de usuarios para el formulario de castigos
  const familyMembersQuery = useQuery({
    queryKey: ['familyMembers'],
    queryFn: getFamilyMembers,
    staleTime: 1000 * 60 * 60, // Esto casi no cambia, lo guardamos 1 hora
  });

  // ESCUCHA EN TIEMPO REAL: Si alguien pide un premio, el admin se entera al instante
  useEffect(() => {
    const channel = supabase
      .channel('admin-redemptions-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reward_redemptions' },
        (payload) => {
          // Cuando alguien inserta un pedido, le decimos a TanStack que actualice la lista
          queryClient.invalidateQueries({ queryKey: ['pendingRedemptions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Limpieza cuando el admin sale de la pantalla
    };
  }, [queryClient]);
  // 2. ACCIONES (Mutations)

  // Aprobar o rechazar un premio
  const resolveRedemptionMutation = useMutation({
    mutationFn: ({ id, newStatus }) => updateRedemptionStatus(id, newStatus),
    onSuccess: (data, variables) => {
      // Actualizamos la lista de pendientes del admin
      queryClient.invalidateQueries({ queryKey: ['pendingRedemptions'], refetchType: 'all' });
      // Actualizamos el historial y saldo del usuario afectado por si fue rechazado (se le devuelven puntos)
      queryClient.invalidateQueries({ queryKey: ['redemptions'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });
      
      if (variables.newStatus === 'aprobado') {
        toast.success('Premio aprobado y listo para entregar.');
      } else {
        toast.info('Premio rechazado. Los puntos fueron devueltos.');
      }
    },
    onError: (error) => {
      console.error('Error al resolver premio:', error);
      toast.error('Ocurrió un error. Intenta de nuevo.');
    }
  });

  // Asignar un nuevo castigo
  const assignPunishmentMutation = useMutation({
    mutationFn: (punishmentData) => assignPunishment(punishmentData),
    onSuccess: () => {
      // Actualizamos los castigos y el saldo del usuario castigado
      queryClient.invalidateQueries({ queryKey: ['punishments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });
      toast.success('Castigo asignado correctamente. Puntos descontados.');
    },
    onError: (error) => {
      console.error('Error al asignar castigo:', error);
      toast.error('No se pudo asignar el castigo.');
    }
  });

  // Cancelar/Perdonar un castigo
  const cancelPunishmentMutation = useMutation({
    mutationFn: (id) => cancelPunishment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punishments'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' });
      toast.success('Castigo cancelado. Los puntos han sido devueltos.');
    },
    onError: (error) => {
      console.error('Error al cancelar castigo:', error);
      toast.error('No se pudo cancelar el castigo.');
    }
  });

  return {
    // Datos
    pendingRedemptions: pendingRedemptionsQuery.data || [],
    isLoadingRedemptions: pendingRedemptionsQuery.isLoading,
    familyMembers: familyMembersQuery.data || [],
    isLoadingMembers: familyMembersQuery.isLoading,
    
    // Funciones
    resolveRedemption: resolveRedemptionMutation.mutate,
    isResolvingRedemption: resolveRedemptionMutation.isPending,
    
    assignPunishment: assignPunishmentMutation.mutate,
    isAssigningPunishment: assignPunishmentMutation.isPending,
    
    cancelPunishment: cancelPunishmentMutation.mutate,
    isCancelingPunishment: cancelPunishmentMutation.isPending,
  };
}