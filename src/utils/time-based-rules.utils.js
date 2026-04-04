/**
 * Utilidades para reglas de activación de módulos basadas en hora del día.
 * Gestiona qué módulos y campos están habilitados según el horario actual.
 */

/**
 * Obtiene la hora actual como número decimal (ej: 14:30 = 14.5)
 * @returns {number} Hora actual en formato decimal
 */
export function getCurrentHourDecimal() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return hours + (minutes / 60)
}

/**
 * Reglas de tiempo específicas para el Sleep Module (LEGACY - Mantener por compatibilidad)
 * @param {number} currentHour - Hora actual en formato decimal (opcional, usa hora actual si no se provee)
 * @returns {object} Objeto con reglas de acceso y estado de campos
 */
export function getSleepModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // Horario sugerido: 22:00 - 04:59 (noche y madrugada)
  const isSuggestedTime = hour >= 22 || hour < 5
  
  // Advertencia: durante el día (05:00 - 21:59)
  const isWarningTime = hour >= 5 && hour < 22
  
  // Estados de cada campo según la hora
  const fields = {
    // Hora de dormir: disponible de 21:00 a 04:00
    bedtime: {
      enabled: hour >= 21 || hour < 4,
      hint: 'Disponible de 21:00 a 04:00'
    },
    
    // Hora de despertar: disponible de 05:00 a 09:00
    wake_time: {
      enabled: hour >= 5 && hour < 9,
      hint: 'Disponible de 05:00 a 09:00'
    },
    
    // Cama tendida: disponible de 05:00 a 11:00
    made_bed: {
      enabled: hour >= 5 && hour < 11,
      hint: 'Disponible de 05:00 a 11:00'
    },
    
    // Apagar dispositivos: disponible de 20:00 a 01:00
    device_off_time: {
      enabled: hour >= 20 || hour < 1,
      hint: 'Disponible de 20:00 a 01:00'
    },
    
    // Oración: siempre disponible
    prayer: {
      enabled: true,
      hint: null
    }
  }
  
  return {
    // El módulo siempre es accesible (para registros retrospectivos)
    canAccessModule: true,
    
    // Si es horario sugerido (verde)
    isSuggestedTime,
    
    // Si es horario de advertencia (naranja)
    warning: isWarningTime,
    
    // Mensaje para el banner de advertencia
    message: isWarningTime ? 'Mejor registra tu descanso por la noche' : null,
    
    // Badge motivacional para horario sugerido
    badge: isSuggestedTime ? '🌙 ¡Momento perfecto para registrar tu noche!' : null,
    
    // Estado de cada campo
    fields
  }
}

/**
 * Reglas de tiempo específicas para MorningRoutineModule
 * - IDEAL (05:00-08:59): Verde, momento perfecto
 * - ACTIVO (09:00-11:59): Sin banner, pero permitido
 * - FUERA DE HORARIO (12:00-04:59): Módulo bloqueado
 * 
 * @param {number} currentHour - Hora actual en formato decimal (opcional, usa hora actual si no se provee)
 * @returns {object} Objeto con reglas de acceso y estado de campos
 */
export function getMorningRoutineTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // Horario sugerido: 05:00 - 08:59 (mañana temprano)
  const isSuggestedTime = hour >= 5 && hour < 9
  
  // Horario activo: 05:00 - 11:59
  const isActiveTime = hour >= 5 && hour < 12
  
  // Fuera de horario: 12:00 - 04:59 (módulo bloqueado)
  const isOutOfHours = hour >= 12 || hour < 5
  
  // Determinar tipo de banner
  let bannerType = null
  let badge = null
  
  if (isSuggestedTime) {
    badge = '🌅 ¡Momento perfecto para registrar tu mañana!'
    bannerType = 'suggested'
  }
  // Si está en horario activo pero no sugerido (9-11), no hay banner
  // Si isOutOfHours, no hay banner porque se muestra ModuleBlockedScreen
  
  return {
    canAccessModule: isActiveTime,
    isSuggestedTime,
    isOutOfHours,
    availableHours: '05:00 a 11:59',
    warning: false,
    message: null,
    badge,
    bannerType,
    fields: {} // Ya no necesitamos lógica de campos
  }
}

/**
 * Reglas de tiempo específicas para NightRoutineModule
 * Sistema de 3 niveles:
 * - IDEAL (21:00-22:24): Verde, puntos completos si duerme a tiempo
 * - TARDE (22:25-23:59): Naranja advertencia, penalización de puntos
 * - FUERA DE HORARIO (00:00-20:59): Módulo bloqueado
 * 
 * @param {number} currentHour - Hora actual en formato decimal (opcional, usa hora actual si no se provee)
 * @returns {object} Objeto con reglas de acceso y estado de campos
 */
export function getNightRoutineTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // 3 NIVELES DE TIEMPO:
  // Ideal: 21:00 - 22:24 (22.4 en decimal = 22:24)
  const isIdealTime = hour >= 21 && hour < 22.4
  
  // Tarde: 22:25 - 23:59 (penalización de puntos)
  const isLateTime = hour >= 22.4 && hour < 24
  
  // Fuera de horario: 00:00 - 20:59 (módulo bloqueado)
  const isOutOfHours = hour >= 0 && hour < 21
  
  // Determinar tipo de banner y mensaje
  let badge = null
  let warning = false
  let message = null
  let bannerType = null
  
  if (isIdealTime) {
    badge = '🌙 ¡Momento ideal para registrar tu rutina de noche!'
    bannerType = 'suggested'
  } else if (isLateTime) {
    warning = true
    message = '⚠️ Ya pasaron las 22:25. Registrar hora de dormir tarde afectará tus puntos.'
    bannerType = 'warning'
  }
  // Si isOutOfHours, no hay banner porque se muestra ModuleBlockedScreen
  
  return {
    canAccessModule: !isOutOfHours,
    isSuggestedTime: isIdealTime,
    isLateTime,
    isOutOfHours,
    availableHours: '21:00 a 23:59',
    warning,
    message,
    badge,
    bannerType,
    fields: {} // Ya no necesitamos lógica de campos
  }
}

/**
 * Reglas de tiempo específicas para PhoneUseModule
 * Sistema de 3 niveles:
 * - IDEAL (20:00-21:59): Verde, +20 pts si entrega
 * - TARDE (22:00-23:59): Naranja advertencia, -10 pts si entrega (ya pasó toque de queda)
 * - FUERA DE HORARIO (00:00-19:59): Módulo bloqueado
 * 
 * @param {number} currentHour - Hora actual en formato decimal (opcional, usa hora actual si no se provee)
 * @returns {object} Objeto con reglas de acceso y estado de campos
 */
export function getPhoneUseTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // 3 NIVELES DE TIEMPO:
  // Ideal: 20:00 - 21:59 (antes del toque de queda de 22:00)
  const isIdealTime = hour >= 20 && hour < 22
  
  // Tarde: 22:00 - 23:59 (después del toque de queda, penalización)
  const isLateTime = hour >= 22 && hour < 24
  
  // Fuera de horario: 00:00 - 19:59 (módulo bloqueado)
  const isOutOfHours = hour >= 0 && hour < 20
  
  // Determinar tipo de banner y mensaje
  let badge = null
  let warning = false
  let message = null
  let bannerType = null
  
  if (isIdealTime) {
    badge = '📱 ¡Momento ideal para entregar tu celular!'
    bannerType = 'suggested'
  } else if (isLateTime) {
    warning = true
    message = '⚠️ Ya pasaron las 22:00. Entregar el celular ahora restará 10 puntos en lugar de sumar 20.'
    bannerType = 'warning'
  }
  // Si isOutOfHours, no hay banner porque se muestra ModuleBlockedScreen
  
  return {
    canAccessModule: !isOutOfHours,
    isSuggestedTime: isIdealTime,
    isLateTime,
    isOutOfHours,
    availableHours: '20:00 a 23:59',
    warning,
    message,
    badge,
    bannerType,
    fields: {} // Ya no necesitamos lógica de campos
  }
}

/**
 * Obtiene las reglas de tiempo para cualquier módulo
 * @param {string} moduleKey - Clave del módulo ('sleep', 'morning', 'night', 'phone', etc.)
 * @returns {object} Reglas del módulo
 */
export function getModuleTimeRules(moduleKey) {
  const rules = {
    sleep: getSleepModuleTimeRules,           // Legacy - mantener por compatibilidad
    morning: getMorningRoutineTimeRules,      // MorningRoutineModule
    night: getNightRoutineTimeRules,          // NightRoutineModule
    phone: getPhoneUseTimeRules,              // PhoneUseModule
    movement: getMovementModuleTimeRules,     // MovementModule
    food: getFoodModuleTimeRules,             // FoodModule
    study: getStudyModuleTimeRules,           // StudyModule
    cleaning: getCleaningModuleTimeRules,     // CleaningModule
    coexistence: getCoexistenceModuleTimeRules, // CoexistenceModule
    household: getHouseholdModuleTimeRules,   // HouseholdModule
  }
  
  const getRules = rules[moduleKey]
  return getRules ? getRules() : { canAccessModule: true, isOutOfHours: false }
}

/**
 * Reglas de tiempo para MovementModule
 * - Bloqueado: 00:00-12:59 y 23:00-23:59
 * - Activo: 13:00-22:59
 * - Banner ideal: 17:00-19:00
 */
export function getMovementModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // Activo de 13:00 a 22:59
  const isActiveTime = hour >= 13 && hour < 23
  const isOutOfHours = !isActiveTime
  
  // Momento ideal: 17:00 - 19:00
  const isIdealTime = hour >= 17 && hour < 19
  
  return {
    canAccessModule: isActiveTime,
    isOutOfHours,
    isSuggestedTime: isIdealTime,
    availableHours: '13:00 a 22:59',
    bannerType: isIdealTime ? 'suggested' : null,
    badge: isIdealTime ? '🏃 ¡Momento ideal para ejercitarte!' : null,
    warning: false,
    message: null,
    fields: {}
  }
}

/**
 * Reglas de tiempo para FoodModule
 * CASO ESPECIAL: dos horarios diferentes
 * - Hidratación: 10:00-22:59
 * - Alimento + TV + Guardar: 13:00-22:59
 */
export function getFoodModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  // Módulo accesible desde las 10:00 (para hidratación)
  const isModuleActive = hour >= 10 && hour < 23
  const isOutOfHours = !isModuleActive
  
  // Campos de comida activos desde las 13:00
  const isFoodActive = hour >= 13 && hour < 23
  
  // Momento ideal para almuerzo: 13:00-14:59
  const isLunchIdealTime = hour >= 13 && hour < 15
  
  // Solo hidratación disponible: 10:00-12:59
  const isHydrationOnlyTime = hour >= 10 && hour < 13
  
  // Determinar banner y mensaje
  let bannerType = null
  let badge = null
  let warning = false
  let message = null
  
  if (isHydrationOnlyTime) {
    warning = true
    message = '💧 Ahora solo puedes registrar hidratación. Alimento disponible desde las 13:00.'
    bannerType = 'warning'
  } else if (isLunchIdealTime) {
    badge = '🍽️ ¡Momento ideal para registrar tu almuerzo!'
    bannerType = 'suggested'
  }
  
  return {
    canAccessModule: isModuleActive,
    isOutOfHours,
    isSuggestedTime: isLunchIdealTime,
    isHydrationOnlyTime,
    isFoodActive,
    availableHours: '10:00 a 22:59',
    bannerType,
    badge,
    warning,
    message,
    fields: {
      // Hidratación: disponible desde las 10:00
      water_glasses: {
        enabled: isModuleActive,
        hint: 'Disponible de 10:00 a 22:59'
      },
      // Campos de comida: disponibles desde las 13:00
      food_description: {
        enabled: isFoodActive,
        hint: 'Disponible de 13:00 a 22:59'
      },
      no_tv_during_lunch: {
        enabled: isFoodActive,
        hint: 'Disponible de 13:00 a 22:59'
      },
      save_lunch: {
        enabled: isFoodActive,
        hint: 'Disponible de 13:00 a 22:59'
      }
    }
  }
}

/**
 * Reglas de tiempo para StudyModule
 * Bloqueado: 00:00-09:59
 * Activo: 10:00-22:59
 * Ideal: 14:00-16:59 (horario típico de estudio post-almuerzo)
 */
export function getStudyModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  const isActiveTime = hour >= 10 && hour < 23
  const isOutOfHours = !isActiveTime
  const isIdealTime = hour >= 14 && hour < 17
  
  return {
    canAccessModule: isActiveTime,
    isOutOfHours,
    isSuggestedTime: isIdealTime,
    availableHours: '10:00 a 22:59',
    bannerType: isOutOfHours ? 'blocked' : (isIdealTime ? 'suggested' : null),
    badge: isIdealTime ? '📚 ¡Momento ideal para estudiar!' : null,
    warning: false,
    message: null,
    fields: {}
  }
}

/**
 * Reglas de tiempo para CleaningModule
 * Bloqueado: 00:00-09:59
 * Activo: 10:00-22:59
 * Ideal: 10:00-11:59 (mañana temprano)
 */
export function getCleaningModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  const isActiveTime = hour >= 10 && hour < 23
  const isOutOfHours = !isActiveTime
  const isIdealTime = hour >= 10 && hour < 12
  
  return {
    canAccessModule: isActiveTime,
    isOutOfHours,
    isSuggestedTime: isIdealTime,
    availableHours: '10:00 a 22:59',
    bannerType: isOutOfHours ? 'blocked' : (isIdealTime ? 'suggested' : null),
    badge: isIdealTime ? '✨ ¡Momento ideal para ordenar!' : null,
    warning: false,
    message: null,
    fields: {}
  }
}

/**
 * Reglas de tiempo para CoexistenceModule
 * SIEMPRE disponible - no tiene restricción de horario
 */
export function getCoexistenceModuleTimeRules(currentHour = null) {
  return {
    canAccessModule: true,
    isOutOfHours: false,
    isSuggestedTime: true,
    availableHours: 'Todo el día',
    bannerType: null,
    badge: null,
    warning: false,
    message: null,
    fields: {}
  }
}

/**
 * Reglas de tiempo para HouseholdModule
 * Bloqueado: 00:00-05:59 y 23:00-23:59
 * Activo: 06:00-22:59
 * Ideal: 17:00-19:59 (tarde - cuando la familia está en casa)
 */
export function getHouseholdModuleTimeRules(currentHour = null) {
  const hour = currentHour ?? getCurrentHourDecimal()
  
  const isActiveTime = hour >= 6 && hour < 23
  const isOutOfHours = !isActiveTime
  const isIdealTime = hour >= 17 && hour < 20
  
  return {
    canAccessModule: isActiveTime,
    isOutOfHours,
    isSuggestedTime: isIdealTime,
    availableHours: '06:00 a 22:59',
    bannerType: isOutOfHours ? 'blocked' : (isIdealTime ? 'suggested' : null),
    badge: isIdealTime ? '🏠 ¡Momento ideal para tareas del hogar!' : null,
    warning: false,
    message: null,
    fields: {}
  }
}

/**
 * Verifica si un campo específico está habilitado según la hora
 * @param {string} moduleKey - Clave del módulo
 * @param {string} fieldName - Nombre del campo
 * @returns {boolean} True si el campo está habilitado
 */
export function isFieldEnabled(moduleKey, fieldName) {
  const rules = getModuleTimeRules(moduleKey)
  return rules.fields?.[fieldName]?.enabled ?? true
}

/**
 * Obtiene el mensaje de hint para un campo bloqueado
 * @param {string} moduleKey - Clave del módulo
 * @param {string} fieldName - Nombre del campo
 * @returns {string|null} Mensaje de hint o null si no hay
 */
export function getFieldHint(moduleKey, fieldName) {
  const rules = getModuleTimeRules(moduleKey)
  return rules.fields?.[fieldName]?.hint ?? null
}

/**
 * Verifica si es horario sugerido para un módulo
 * @param {string} moduleKey - Clave del módulo
 * @returns {boolean} True si es horario sugerido
 */
export function isSuggestedTime(moduleKey) {
  const rules = getModuleTimeRules(moduleKey)
  return rules.isSuggestedTime ?? false
}
