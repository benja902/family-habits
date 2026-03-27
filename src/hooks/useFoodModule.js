import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMealRecords, calculateAndSaveMealPoints, getMovementRecord, saveFoodHydration } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  merienda_manana: 'Merienda',
  almuerzo: 'Almuerzo',
  merienda_tarde: 'Merienda tarde',
  cena: 'Cena',
}

export default function useFoodModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const date = getTodayString()
  const navigate = useNavigate()

  const query = useQuery({
    queryKey: ['mealRecords', currentUser?.id, date],
    queryFn: () => getMealRecords(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const hydrationQuery = useQuery({
    queryKey: ['foodHydration', currentUser?.id, date],
    queryFn: () => getMovementRecord(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const handleError = (error) => {
    console.error('Error guardando comida:', error)
    toast.error('No se pudo guardar. Intenta de nuevo.')
  }

  const foodMutation = useMutation({
    mutationFn: async ({ mealType = 'almuerzo', mealData, waterGlasses, shouldSaveMeal }) => {
      const hydrationResult = await saveFoodHydration(currentUser.id, date, waterGlasses)
      let mealResult = null

      if (shouldSaveMeal) {
        mealResult = await calculateAndSaveMealPoints(currentUser.id, date, mealType, mealData)
      }

      return {
        hydrationResult,
        mealResult,
        totalPointsEarned:
          (hydrationResult?.pointsEarned || 0) +
          (mealResult?.pointsEarned || 0),
        shouldSaveMeal,
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['foodHydration'] })
      queryClient.invalidateQueries({ queryKey: ['movementRecord'] })
      queryClient.invalidateQueries({ queryKey: ['mealRecords'] })
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' })

      const glasses = result.hydrationResult?.savedRecord?.water_glasses || 0
      const message = result.shouldSaveMeal
        ? `¡+${result.totalPointsEarned} pts! Alimentación registrada · ${glasses}/8 vasos`
        : `¡+${result.totalPointsEarned} pts! Hidratación registrada · ${glasses}/8 vasos`
      toast.success(message)
      navigate('/dashboard')
    },
    onError: handleError,
  })

  return {
    mealRecords: query.data || {},
    isLoading: query.isLoading,
    MEAL_LABELS,
    hydrationRecord: hydrationQuery.data || null,
    isLoadingHydration: hydrationQuery.isLoading,
    saveFoodModule: foodMutation.mutate,
    isSavingFoodModule: foodMutation.isPending,
  }
}
