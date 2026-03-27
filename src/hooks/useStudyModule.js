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

  const query = useQuery({
    queryKey: ['studyRecord', currentUser?.id, date],
    queryFn: () => getStudyRecord(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const mutation = useMutation({
    mutationFn: (formData) => 
      calculateAndSaveStudyPoints(currentUser.id, date, formData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['studyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['ranking'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['userPointsBalance'], refetchType: 'all' })

      const pts = result?.pointsEarned ?? 0
      toast.success(`¡+${pts} pts! Estudio registrado 📚`)
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Error guardando estudio:', error)
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  })

  return {
    studyRecord: query.data || null,
    isLoading: query.isLoading,
    hasRecord: !!(query.data?.did_study || query.data?.clean_space),
    saveStudy: mutation.mutate,
    isSaving: mutation.isPending
  }
}
