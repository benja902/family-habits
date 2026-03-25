import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCoexistenceRecord, calculateAndSaveCoexistencePoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function useCoexistenceModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const date = getTodayString()

  const query = useQuery({
    queryKey: ['coexistenceRecord', currentUser?.id, date],
    queryFn: () => getCoexistenceRecord(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  const mutation = useMutation({
    mutationFn: (formData) => calculateAndSaveCoexistencePoints(currentUser.id, date, formData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
      queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
      queryClient.invalidateQueries({ queryKey: ['coexistenceRecord'] })
      
      const pts = result?.pointsEarned ?? 0
      toast.success(`¡+${pts} pts! Convivencia registrada 🤝`)
      navigate('/dashboard')
    },
    onError: (error) => {
      console.error('Error guardando convivencia:', error)
      toast.error('No se pudo guardar. Intenta de nuevo.')
    }
  })

  return {
    coexistenceRecord: query.data || null,
    isLoading: query.isLoading,
    hasRecord: !!query.data && query.data.points_earned > 0,
    saveCoexistence: mutation.mutate,
    isSaving: mutation.isPending
  }
}