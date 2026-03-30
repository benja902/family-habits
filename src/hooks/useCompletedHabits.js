import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  getCleaningRecord,
  getCompletedHabitsToday,
  getCoexistenceRecord,
  getHouseholdData,
  getMealRecords,
  getMovementRecord,
  getSleepRecord,
  getStudyRecord,
  updateCompletionPct,
} from '../services/supabase'
import useAuthStore from '../stores/useAuthStore'
import useDayStore from '../stores/useDayStore'
import { getTodayString } from '../utils/dates.utils'
import { getFoodStatus } from '../utils/food-status.utils'
import {
  getCleaningStatus,
  getCoexistenceStatus,
  getHouseholdStatus,
  getMorningRoutineStatus,
  getMovementStatus,
  getNightRoutineStatus,
  getPhoneUseStatus,
  getStudyStatus,
} from '../utils/habit-progress.utils'

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

  const movementRecordQuery = useQuery({
    queryKey: ['movementRecord', currentUser?.id, today],
    queryFn: () => getMovementRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const mealRecordsQuery = useQuery({
    queryKey: ['mealRecords', currentUser?.id, today],
    queryFn: () => getMealRecords(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const studyRecordQuery = useQuery({
    queryKey: ['studyRecord', currentUser?.id, today],
    queryFn: () => getStudyRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const householdRecordQuery = useQuery({
    queryKey: ['householdRecord', currentUser?.id, today],
    queryFn: () => getHouseholdData(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const coexistenceRecordQuery = useQuery({
    queryKey: ['coexistenceRecord', currentUser?.id, today],
    queryFn: () => getCoexistenceRecord(currentUser?.id, today),
    enabled: !!currentUser?.id,
  })

  const sleepRecord = sleepRecordQuery.data ?? null
  const cleaningRecord = cleaningRecordQuery.data ?? null
  const movementRecord = movementRecordQuery.data ?? null
  const mealRecords = mealRecordsQuery.data ?? null
  const studyRecord = studyRecordQuery.data ?? null
  const householdRecord = householdRecordQuery.data ?? { assignments: [], completions: [] }
  const coexistenceRecord = coexistenceRecordQuery.data ?? null
  const foodStatus = getFoodStatus(mealRecords, movementRecord)
  const morningStatus = getMorningRoutineStatus(sleepRecord, cleaningRecord)
  const movementStatus = getMovementStatus(movementRecord)
  const studyStatus = getStudyStatus(studyRecord)
  const householdStatus = getHouseholdStatus(householdRecord)
  const cleaningStatus = getCleaningStatus(cleaningRecord)
  const phoneUseStatus = getPhoneUseStatus(sleepRecord)
  const coexistenceStatus = getCoexistenceStatus(coexistenceRecord)
  const nightRoutineStatus = getNightRoutineStatus(sleepRecord)

  const completedHabits = {
    'morning-routine': morningStatus.isCompleted,
    movement: movementStatus.isCompleted,
    food: foodStatus.isCompleted,
    study: studyStatus.isCompleted,
    cleaning: cleaningStatus.isCompleted,
    'phone-use': phoneUseStatus.isCompleted,
    coexistence: coexistenceStatus.isCompleted,
    'night-routine': nightRoutineStatus.isCompleted,
    household: householdStatus.isCompleted,
  }

  const habitProgress = {
    'morning-routine': morningStatus.progressPct,
    movement: movementStatus.progressPct,
    food: foodStatus.progressPct,
    study: studyStatus.progressPct,
    cleaning: cleaningStatus.progressPct,
    'phone-use': phoneUseStatus.progressPct,
    coexistence: coexistenceStatus.progressPct,
    'night-routine': nightRoutineStatus.progressPct,
    household: householdStatus.progressPct,
  }
  const totalProgress = Object.values(habitProgress).reduce((sum, value) => sum + value, 0)

  const completedCount = Object.values(completedHabits).filter(Boolean).length
  const totalHabits = Object.keys(MAIN_FLOW_DEFAULTS).length

  useEffect(() => {
    if (
      completedHabitsQuery.data &&
      !sleepRecordQuery.isLoading &&
      !cleaningRecordQuery.isLoading &&
      !movementRecordQuery.isLoading &&
      !mealRecordsQuery.isLoading &&
      !studyRecordQuery.isLoading &&
      !householdRecordQuery.isLoading &&
      !coexistenceRecordQuery.isLoading
    ) {
      const pct = Math.round(totalProgress / totalHabits)
      setCompletionPct(pct)
      updateCompletionPct(currentUser?.id, today, pct)
    }
  }, [
    completedHabitsQuery.data,
    sleepRecordQuery.isLoading,
    cleaningRecordQuery.isLoading,
    movementRecordQuery.isLoading,
    mealRecordsQuery.isLoading,
    studyRecordQuery.isLoading,
    householdRecordQuery.isLoading,
    coexistenceRecordQuery.isLoading,
    totalProgress,
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
      cleaningRecordQuery.isLoading ||
      movementRecordQuery.isLoading ||
      mealRecordsQuery.isLoading ||
      studyRecordQuery.isLoading ||
      householdRecordQuery.isLoading ||
      coexistenceRecordQuery.isLoading,
    completedCount,
  }
}
