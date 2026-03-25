import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStudyRecord, calculateAndSaveStudyPoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function useStudyModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const date = getTodayString()

  // 1. Cargar registro (Regla 1: sin onSuccess)
  const query = useQuery({
    queryKey: ['studyRecord', currentUser?.id, date],
    queryFn: () => getStudyRecord(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  // 2. Mutación para guardar
  const mutation = useMutation({
    mutationFn: (formData) => 
      calculateAndSaveStudyPoints(currentUser.id, date, formData),
    onSuccess: (res) => {
      // Regla 6: Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['studyRecord', currentUser?.id, date] })
      
      toast.success(`¡+${res.pointsEarned} pts! Sesión de estudio guardada 📚`)
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Error guardando estudio:', error)
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  })

  return {
    studyRecord: query.data,
    isLoading: query.isLoading,
    hasRecord: !!query.data,
    saveStudy: mutation.mutate,
    isSaving: mutation.isPending
  }
}