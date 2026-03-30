export const buildProgressMeta = ({
  completedSteps,
  totalSteps,
  completeLabel = '✓ Listo',
  inProgressLabel = 'En progreso',
  pendingLabel = 'Pendiente',
  progressLabel,
}) => {
  const safeTotalSteps = totalSteps > 0 ? totalSteps : 1
  const progressPct = Math.round((completedSteps / safeTotalSteps) * 100)
  const isCompleted = completedSteps === safeTotalSteps
  const isInProgress = completedSteps > 0 && !isCompleted

  return {
    isCompleted,
    isInProgress,
    completedSteps,
    totalSteps: safeTotalSteps,
    progressPct,
    statusLabel: isCompleted
      ? completeLabel
      : isInProgress
        ? inProgressLabel
        : pendingLabel,
    progressLabel:
      progressLabel ??
      `${completedSteps}/${safeTotalSteps} ${safeTotalSteps === 1 ? 'paso' : 'pasos'} completados`,
  }
}

export const getMorningRoutineStatus = (sleepRecord, cleaningRecord) =>
  buildProgressMeta({
    completedSteps: (sleepRecord?.wake_time ? 1 : 0) + (cleaningRecord?.bed_made ? 1 : 0),
    totalSteps: 2,
  })

export const getMovementStatus = (movementRecord) =>
  buildProgressMeta({
    completedSteps: (movementRecord?.did_exercise ? 1 : 0) + (movementRecord?.walk_after_lunch ? 1 : 0),
    totalSteps: 2,
  })

export const getStudyStatus = (studyRecord) =>
  buildProgressMeta({
    completedSteps: (studyRecord?.did_study ? 1 : 0) + (studyRecord?.clean_space ? 1 : 0),
    totalSteps: 2,
  })

export const getHouseholdStatus = (householdData) => {
  const assignments = householdData?.assignments || []
  const completedSteps = (householdData?.completions || []).filter((item) => item.completed).length

  if (assignments.length === 0) {
    return {
      isCompleted: true,
      isInProgress: false,
      completedSteps: 1,
      totalSteps: 1,
      progressPct: 100,
      statusLabel: '✓ Listo',
      progressLabel: 'Sin tareas asignadas hoy',
    }
  }

  return buildProgressMeta({
    completedSteps,
    totalSteps: assignments.length,
  })
}

export const getCleaningStatus = (cleaningRecord) => {
  const ordered = !!(cleaningRecord?.room_clean || cleaningRecord?.space_ordered)

  return {
    isCompleted: ordered,
    isInProgress: false,
    completedSteps: ordered ? 1 : 0,
    totalSteps: 1,
    progressPct: ordered ? 100 : 0,
    statusLabel: ordered ? '✓ Listo' : 'Pendiente',
    progressLabel: ordered ? '1/1 paso completado' : undefined,
  }
}

export const getPhoneUseStatus = (sleepRecord) => {
  const hasPhoneRecord = !!(
    sleepRecord?.device_delivered ||
    sleepRecord?.device_delivered_at ||
    sleepRecord?.device_in_bathroom ||
    sleepRecord?.device_in_bed
  )

  if (!hasPhoneRecord) {
    return buildProgressMeta({
      completedSteps: 0,
      totalSteps: 3,
    })
  }

  return buildProgressMeta({
    completedSteps:
      (sleepRecord?.device_delivered && sleepRecord?.device_delivered_at ? 1 : 0) +
      (!sleepRecord?.device_in_bathroom ? 1 : 0) +
      (!sleepRecord?.device_in_bed ? 1 : 0),
    totalSteps: 3,
  })
}

export const getNightRoutineStatus = (sleepRecord) =>
  buildProgressMeta({
    completedSteps: (sleepRecord?.sleep_time ? 1 : 0) + (sleepRecord?.slept_by_11 ? 1 : 0),
    totalSteps: 2,
  })

export const getCoexistenceStatus = (coexistenceRecord) => {
  if (!coexistenceRecord) {
    return {
      isCompleted: false,
      isInProgress: false,
      completedSteps: 0,
      totalSteps: 1,
      progressPct: 0,
      statusLabel: 'Pendiente',
      progressLabel: undefined,
    }
  }

  if (!coexistenceRecord.took_others_things) {
    return {
      isCompleted: true,
      isInProgress: false,
      completedSteps: 1,
      totalSteps: 1,
      progressPct: 100,
      statusLabel: '✓ Listo',
      progressLabel: '1/1 paso completado',
    }
  }

  return {
    isCompleted: false,
    isInProgress: true,
    completedSteps: 0,
    totalSteps: 1,
    progressPct: 50,
    statusLabel: 'Registrado',
    progressLabel: 'Incidente registrado',
  }
}
