export const FOOD_MIN_GLASSES_FOR_COMPLETION = 8

export const getFoodStatus = (mealRecords, hydrationRecord) => {
  const lunchCompleted = mealRecords?.almuerzo != null
  const hydrationGlasses = Number(hydrationRecord?.water_glasses) || 0
  const hydrationStarted = hydrationGlasses > 0
  const hasMinimumHydration = hydrationGlasses >= FOOD_MIN_GLASSES_FOR_COMPLETION
  const hydrationProgressPct = Math.min(
    100,
    Math.round((hydrationGlasses / FOOD_MIN_GLASSES_FOR_COMPLETION) * 100)
  )
  const completedSteps =
    (lunchCompleted ? 1 : 0) +
    (hasMinimumHydration ? 1 : 0)
  const totalSteps = 2
  const progressPct = Math.round(
    ((lunchCompleted ? 1 : 0) + (hydrationProgressPct / 100)) / totalSteps * 100
  )

  if (lunchCompleted && hasMinimumHydration) {
    return {
      status: 'completed',
      isCompleted: true,
      isInProgress: false,
      hydrationGlasses,
      completedSteps,
      totalSteps,
      progressPct: 100,
      label: '✓ Listo',
      detail: `${hydrationGlasses}/8 vasos · Almuerzo registrado`,
      checklistLabel: `Almuerzo + hidratación mínima · ${hydrationGlasses}/8 vasos`,
      progressLabel: `${completedSteps}/${totalSteps} pasos completados`,
    }
  }

  if (lunchCompleted || hydrationStarted) {
    const detail = lunchCompleted
      ? `${hydrationGlasses}/8 vasos · Falta llegar a ${FOOD_MIN_GLASSES_FOR_COMPLETION} vasos`
      : `${hydrationGlasses}/8 vasos · Falta almuerzo`

    return {
      status: 'in_progress',
      isCompleted: false,
      isInProgress: true,
      hydrationGlasses,
      completedSteps,
      totalSteps,
      progressPct,
      label: 'En progreso',
      detail,
      checklistLabel: detail,
      progressLabel: `${completedSteps}/${totalSteps} pasos completados`,
    }
  }

  return {
    status: 'pending',
    isCompleted: false,
    isInProgress: false,
    hydrationGlasses: 0,
    completedSteps: 0,
    totalSteps: 2,
    progressPct: 0,
    label: 'Pendiente',
    detail: 'Sin hidratación ni almuerzo registrados',
    checklistLabel: 'Aún no registras hidratación ni almuerzo',
    progressLabel: '0/2 pasos completados',
  }
}
