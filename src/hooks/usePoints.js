import { useQuery } from '@tanstack/react-query'
import { getUserPointsBalance } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { pointsToSoles } from '../utils/points.utils'

export default function usePoints() {
  const { currentUser } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['userPointsBalance', currentUser?.id],
    queryFn: () => getUserPointsBalance(currentUser.id),
    enabled: !!currentUser?.id,
    // Refrescamos los puntos en background frecuentemente para que siempre estén al día
    staleTime: 1000 * 60 * 5, 
  })

  // Valores por defecto mientras carga
  const balance = data?.currentBalance || 0
  const totalEarned = data?.totalEarned || 0

  // --- LÓGICA DE GAMIFICACIÓN Y RECOMPENSAS ---

  // 1. Progreso hacia el próximo premio (Meta de 1000 en 1000)
  const GOAL_STEP = 1000
  // Ej: Si tengo 1200 puntos, mi progreso hacia los 2000 es 200, y mi meta actual es 2000
  const currentProgressInStep = balance % GOAL_STEP
  const nextGoal = Math.floor(balance / GOAL_STEP) * GOAL_STEP + GOAL_STEP
  const pointsToNextGoal = nextGoal - balance
  const progressPercentage = (currentProgressInStep / GOAL_STEP) * 100

  return {
    balance,
    totalEarned,
    nextGoal,
    pointsToNextGoal,
    progressPercentage,
    isLoading,
    error,
    // Funciones de formateo rápido para usar en el UI
    formattedMoney: pointsToSoles(balance),
    formattedBalance: balance.toLocaleString('es-PE'),
  }
}