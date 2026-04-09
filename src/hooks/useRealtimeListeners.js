/**
 * Hook global de listeners de Supabase Realtime.
 * Se monta UNA VEZ en App.jsx para escuchar cambios en tiempo real
 * incluso cuando el usuario navega entre páginas.
 *
 * IMPORTANTE: Este hook reemplaza los listeners locales de usePunishments y useRewards.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabaseClient'
import { getTodayString } from '../utils/dates.utils'

export default function useRealtimeListeners() {
  const queryClient = useQueryClient()
  const { currentUser } = useAuthStore()
  const today = getTodayString()

  useEffect(() => {
    if (!currentUser?.id) return

    // ==================== LISTENER 1: CASTIGOS ====================
    // Escucha cuando el admin asigna/modifica/completa castigos
    const punishmentsChannel = supabase
      .channel('global-punishments')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'punishments',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          console.log('[Realtime] 🔔 Castigo actualizado')
          queryClient.invalidateQueries({ queryKey: ['punishments', currentUser.id] })
          queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser.id] })
          queryClient.invalidateQueries({ queryKey: ['dailyRecord', currentUser.id, today] })
        }
      )
      .subscribe()

    // ==================== LISTENER 2: CANJES DE PREMIOS ====================
    // Escucha cuando el admin aprueba/rechaza canjes de dinero
    const redemptionsChannel = supabase
      .channel('global-redemptions')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE
          schema: 'public',
          table: 'reward_redemptions',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          console.log('[Realtime] 🎁 Premio actualizado')
          queryClient.invalidateQueries({ queryKey: ['redemptions', currentUser.id] })
          queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser.id] })
        }
      )
      .subscribe()

    // ==================== LISTENER 3: TRANSACCIONES DE PUNTOS ====================
    // Escucha cuando se agregan/eliminan puntos (módulos, castigos, premios)
    const transactionsChannel = supabase
      .channel('global-transactions')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'point_transactions',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          console.log('[Realtime] 💰 Puntos actualizados')
          queryClient.invalidateQueries({ queryKey: ['userPointsBalance', currentUser.id] })
          queryClient.invalidateQueries({ queryKey: ['dailyRecord', currentUser.id, today] })
        }
      )
      .subscribe()

    // ==================== LISTENER 4: HOUSEHOLD ====================
    // Escucha cambios en tareas del hogar para refrescar el horario general
    // y el registro individual sin necesidad de recargar la página.
    const householdCompletionsChannel = supabase
      .channel('global-household-completions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_task_completions',
        },
        (payload) => {
          console.log('[Realtime] 🏠 Household actualizado', payload.eventType)
          queryClient.invalidateQueries({ queryKey: ['householdGeneralSchedule'] })

          const affectedUserId = payload.new?.user_id || payload.old?.user_id
          if (affectedUserId === currentUser.id) {
            queryClient.invalidateQueries({ queryKey: ['householdRecord', currentUser.id, today] })
            queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
            queryClient.invalidateQueries({ queryKey: ['dailyRecord', currentUser.id, today] })
          }
        }
      )
      .subscribe()

    const householdAssignmentsChannel = supabase
      .channel('global-household-assignments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'household_task_assignments',
        },
        () => {
          console.log('[Realtime] 📋 Asignaciones household actualizadas')
          queryClient.invalidateQueries({ queryKey: ['householdGeneralSchedule'] })
          queryClient.invalidateQueries({ queryKey: ['householdRecord'] })
          queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
        }
      )
      .subscribe()

    // Limpieza al desmontar
    return () => {
      console.log('[Realtime] 🔌 Desconectando listeners globales')
      supabase.removeChannel(punishmentsChannel)
      supabase.removeChannel(redemptionsChannel)
      supabase.removeChannel(transactionsChannel)
      supabase.removeChannel(householdCompletionsChannel)
      supabase.removeChannel(householdAssignmentsChannel)
    }
  }, [currentUser?.id, queryClient, today])

  // Este hook no retorna nada, solo escucha
  return null
}
