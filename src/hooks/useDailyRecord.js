import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getDailyRecord } from '../services/supabase'
import useAuthStore from '../stores/useAuthStore'
import useDayStore from '../stores/useDayStore'
import { getTodayString } from '../utils/dates.utils'

export default function useDailyRecord() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { setDayPoints } = useDayStore()
  const today = getTodayString()

  const query = useQuery({
    queryKey: ['dailyRecord', currentUser?.id, today],
    queryFn: () => getDailyRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
    refetchOnWindowFocus: true, 
    refetchInterval: 30000,
  })

  useEffect(() => {
    if (query.data) {
      // Los puntos del día sí vienen de daily_records.
      // El completionPct se calcula en vivo desde useCompletedHabits
      // para no pisar el progreso parcial con un valor viejo de la BD.
      setDayPoints(query.data.total_points ?? 0)
    } else {
      setDayPoints(0)
    }
  }, [query.data, setDayPoints])


  return {
    dailyRecord: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
