import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getCompletedHabitsToday, updateCompletionPct } from '../services/supabase'
import useAuthStore from '../stores/useAuthStore'
import useDayStore from '../stores/useDayStore'
import { getTodayString } from '../utils/dates.utils'

export default function useCompletedHabits() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { setCompletionPct } = useDayStore()
  const today = getTodayString()

  const query = useQuery({
    queryKey: ['completedHabits', currentUser?.id, today],
    queryFn: () => getCompletedHabitsToday(currentUser?.id, today),
    enabled: !!currentUser?.id,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (query.data) {
      const completedCount = Object.values(query.data)
        .filter(Boolean).length
      const pct = Math.round((completedCount / 7) * 100)
      setCompletionPct(pct)
      updateCompletionPct(currentUser?.id, today, completedCount)
    }
  }, [query.data])

  return {
    completedHabits: query.data ?? {
      sleep: false,
      movement: false,
      food: false,
      study: false,
      cleaning: false,
      coexistence: false,
      household: false,
    },
    isLoading: query.isLoading,
    completedCount: query.data
      ? Object.values(query.data).filter(Boolean).length
      : 0,
  }
}
