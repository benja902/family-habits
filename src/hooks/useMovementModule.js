import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMovementRecord, calculateAndSaveMovementPoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function useMovementModule() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const today = getTodayString()

  // Query para cargar el registro de movimiento de hoy
  const {
    data: movementRecord,
    isLoading,
  } = useQuery({
    queryKey: ['movementRecord', currentUser?.id, today],
    queryFn: () => getMovementRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  // Determinar si ya hay un registro guardado
  const hasRecord = movementRecord && movementRecord.points_earned > 0

  // Mutation para guardar el registro
  const mutation = useMutation({
    mutationFn: (formData) => calculateAndSaveMovementPoints(currentUser?.id, today, formData),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['movementRecord'] })

      const points = result?.pointsEarned ?? 0
      let message = '¡+' + points + ' pts! Movimiento registrado 💪'
      if (variables.water_glasses >= 8) {
        message += ' · ¡Meta de agua cumplida! 💧'
      }
      toast.success(message)

      navigate('/dashboard')
    },
    onError: () => {
      toast.error('No se pudo guardar. Intenta de nuevo.')
    },
  })

  return {
    movementRecord,
    isLoading,
    hasRecord,
    saveMovement: mutation.mutate,
    isSaving: mutation.isPending,
  }
}
