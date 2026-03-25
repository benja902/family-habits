import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCleaningRecord, calculateAndSaveCleaningPoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function useCleaningModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const date = getTodayString()

  const query = useQuery({
    queryKey: ['cleaningRecord', currentUser?.id, date],
    queryFn: () => getCleaningRecord(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const mutation = useMutation({
    mutationFn: (formData) => 
      calculateAndSaveCleaningPoints(currentUser.id, date, formData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['cleaningRecord'] })
      
      const pts = result?.pointsEarned ?? 0
      toast.success(`¡+${pts} pts! Orden registrado ✨`)
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Error guardando limpieza:', error)
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  })

  return {
    cleaningRecord: query.data || null,
    isLoading: query.isLoading,
    hasRecord: !!query.data && query.data.points_earned > 0,
    saveCleaning: mutation.mutate,
    isSaving: mutation.isPending
  }
}