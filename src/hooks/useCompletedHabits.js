import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  getCleaningRecord,
  getCompletedHabitsToday,
  getSleepRecord,
  updateCompletionPct,
} from '../services/supabase'
import useAuthStore from '../stores/useAuthStore'
import useDayStore from '../stores/useDayStore'
import { getTodayString } from '../utils/dates.utils'

const MAIN_FLOW_DEFAULTS = {
  'morning-routine': false,
  movement: false,
  food: false,
  study: false,
  cleaning: false,
  'phone-use': false,
  coexistence: false,
  'night-routine': false,
  household: false,
}

export default function useCompletedHabits() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const { setCompletionPct } = useDayStore()
  const today = getTodayString()

  const completedHabitsQuery = useQuery({
    queryKey: ['completedHabits', currentUser?.id, today],
    queryFn: () => getCompletedHabitsToday(currentUser?.id, today),
    enabled: !!currentUser?.id,
    refetchOnWindowFocus: true,
  })

  const sleepRecordQuery = useQuery({
    queryKey: ['sleepRecord', currentUser?.id, today],
    queryFn: () => getSleepRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const cleaningRecordQuery = useQuery({
    queryKey: ['cleaningRecord', currentUser?.id, today],
    queryFn: () => getCleaningRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const legacyCompletedHabits = completedHabitsQuery.data ?? {
    sleep: false,
    movement: false,
    food: false,
    study: false,
    cleaning: false,
    coexistence: false,
    household: false,
  }

  const sleepRecord = sleepRecordQuery.data ?? null
  const cleaningRecord = cleaningRecordQuery.data ?? null

  const completedHabits = {
    'morning-routine': !!sleepRecord?.wake_time || !!cleaningRecord?.bed_made,
    movement: !!legacyCompletedHabits.movement,
    food: !!legacyCompletedHabits.food,
    study: !!legacyCompletedHabits.study,
    cleaning: !!(cleaningRecord?.room_clean || cleaningRecord?.space_ordered),
    'phone-use': !!(
      sleepRecord?.device_delivered ||
      sleepRecord?.device_delivered_at ||
      sleepRecord?.device_in_bathroom ||
      sleepRecord?.device_in_bed
    ),
    coexistence: !!legacyCompletedHabits.coexistence,
    'night-routine': !!(sleepRecord?.sleep_time || sleepRecord?.slept_by_11),
    household: !!legacyCompletedHabits.household,
  }

  const completedCount = Object.values(completedHabits).filter(Boolean).length
  const totalHabits = Object.keys(MAIN_FLOW_DEFAULTS).length

  useEffect(() => {
    if (completedHabitsQuery.data && !sleepRecordQuery.isLoading && !cleaningRecordQuery.isLoading) {
      const pct = Math.round((completedCount / totalHabits) * 100)
      setCompletionPct(pct)
      updateCompletionPct(currentUser?.id, today, pct)
    }
  }, [
    completedHabitsQuery.data,
    sleepRecordQuery.isLoading,
    cleaningRecordQuery.isLoading,
    completedCount,
    totalHabits,
    setCompletionPct,
    currentUser?.id,
    today,
  ])

  return {
    completedHabits: completedHabitsQuery.data ? completedHabits : MAIN_FLOW_DEFAULTS,
    isLoading:
      completedHabitsQuery.isLoading ||
      sleepRecordQuery.isLoading ||
      cleaningRecordQuery.isLoading,
    completedCount,
  }
}
