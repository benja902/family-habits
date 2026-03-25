import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getHouseholdData, calculateAndSaveHouseholdPoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function useHouseholdModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const date = getTodayString()

  const query = useQuery({
    queryKey: ['householdRecord', currentUser?.id, date],
    queryFn: () => getHouseholdData(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const mutation = useMutation({
    mutationFn: (formData) => 
      calculateAndSaveHouseholdPoints(currentUser.id, date, formData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['householdRecord'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' })

      const pts = result?.pointsEarned ?? 0
      toast.success(`¡+${pts} pts! Tareas guardadas 🏠`)
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Error guardando tareas del hogar:', error)
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  })

  // Detectar si tiene al menos una tarea completada
  const hasCompletedAny = query.data?.completions?.some(c => c.completed) || false

  return {
    householdData: query.data || { assignments: [], completions: [] },
    isLoading: query.isLoading,
    hasRecord: hasCompletedAny,
    saveHousehold: mutation.mutate,
    isSaving: mutation.isPending
  }
}