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

    // Limpieza al desmontar
    return () => {
      console.log('[Realtime] 🔌 Desconectando listeners globales')
      supabase.removeChannel(punishmentsChannel)
      supabase.removeChannel(redemptionsChannel)
      supabase.removeChannel(transactionsChannel)
    }
  }, [currentUser?.id, queryClient, today])

  // Este hook no retorna nada, solo escucha
  return null
}
