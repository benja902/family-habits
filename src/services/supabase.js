/**
 * Funciones de consulta a Supabase para el Panel Familiar de Hábitos.
 * Todas las operaciones de base de datos van en este archivo.
 * Los componentes NUNCA deben llamar a Supabase directamente.
 */

import { supabase } from '../lib/supabaseClient';
import { applyPunctuality, calculateProportional } from '../utils/points.utils';
import { isBeforeCurrentTime, isFutureTime } from '../utils/dates.utils';
import {
  DEVICE_CURFEW,
  MAX_TV_MINUTES,
  MAX_WATER_GLASSES,
  MIN_EXERCISE_MINUTES,
  MIN_WALK_AFTER_LUNCH_MINUTES,
  WAKE_TARGET,
} from '../constants/habits.constants';
// ==================== USUARIOS ====================

/**
 * Retorna todos los usuarios activos ordenados por nombre
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

/**
 * Retorna un usuario por su ID
 */
export async function getUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

/**
 * Valida el PIN del usuario
 * Retorna true si el PIN coincide, false si no
 */
export async function validatePin(userId, pin) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('pin')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.pin === pin;
  } catch (error) {
    console.error('Error al validar PIN:', error);
    throw error;
  }
}

// ==================== REGISTROS DEL DÍA ====================

/**
 * Retorna el registro diario del usuario para una fecha específica
 */
export async function getDailyRecord(userId, date) {
  try {
    const { data, error } = await supabase
      .from('daily_records')
      .select('total_points, completion_pct, day_status')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener registro diario:', error);
    throw error;
  }
}

/**
 * Inserta o actualiza el registro diario del usuario
 */
export async function upsertDailyRecord(userId, date, data) {
  try {
    const { data: result, error } = await supabase
      .from('daily_records')
      .upsert(
        {
          user_id: userId,
          date: date,
          ...data,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error al actualizar registro diario:', error);
    throw error;
  }
}

// ==================== PUNTOS ====================

/**
 * Retorna todas las transacciones de puntos del usuario para una fecha
 */
export async function getPointTransactions(userId, date) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener transacciones de puntos:', error);
    throw error;
  }
}

/**
 * Inserta una nueva transacción de puntos
 */
export async function addPointTransaction(userId, date, amount, reason, category, actionKey = null) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        date: date,
        amount: amount,
        reason: reason,
        category: category,
        action_key: actionKey,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al agregar transacción de puntos:', error);
    throw error;
  }
}

/**
 * Retorna la suma total de puntos acumulados del usuario
 */
export async function getTotalPoints(userId) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;

    const total = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return total;
  } catch (error) {
    console.error('Error al obtener total de puntos:', error);
    throw error;
  }
}

// ==================== TAREAS DEL HOGAR ====================

/**
 * Retorna las tareas asignadas al usuario para un día de la semana específico
 */
export async function getUserTasksForToday(userId, dayOfWeek) {
  try {
    const { data, error } = await supabase
      .from('household_task_assignments')
      .select('*, household_tasks(*)')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener tareas del hogar:', error);
    throw error;
  }
}

// ==================== FUNCIONES ADICIONALES DE PUNTOS ====================

/**
 * Elimina todas las transacciones de puntos de un usuario para una fecha y categoría específica
 * Se usa cuando el usuario re-guarda un módulo para evitar duplicar puntos
 */
export async function deletePointTransactionsByCategory(userId, date, category) {
  try {
    const { error } = await supabase
      .from('point_transactions')
      .delete()
      .eq('user_id', userId)
      .eq('date', date)
      .eq('category', category);

    if (error) throw error;
  } catch (error) {
    console.error('Error al eliminar transacciones de puntos:', error);
    throw error;
  }
}

/**
 * Retorna la suma total de puntos del usuario para una fecha específica
 */
export async function getTotalPointsByDate(userId, date) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;

    const total = data.reduce((sum, transaction) => sum + transaction.amount, 0);
    return total;
  } catch (error) {
    console.error('Error al obtener total de puntos por fecha:', error);
    throw error;
  }
}

/**
 * Retorna todas las transacciones de puntos del usuario para una fecha específica
 * Ordenadas por created_at ascendente (historial del día)
 */
export async function getPointTransactionsByDate(userId, date) {
  try {
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener transacciones de puntos por fecha:', error);
    throw error;
  }
}

// ==================== DESCANSO Y DISPOSITIVOS ====================

/**
 * Retorna el registro de descanso del usuario para una fecha específica
 */
export async function getSleepRecord(userId, date) {
  try {
    const { data, error } = await supabase
      .from('sleep_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener registro de descanso:', error);
    throw error;
  }
}

/**
 * Inserta o actualiza el registro de descanso del usuario
 */
export async function upsertSleepRecord(userId, date, data) {
  try {
    // Sanitizar campos: convertir strings vacíos a null para campos TIME
    const sanitizedData = {
      ...data,
      device_delivered_at: data.device_delivered_at || null,
      sleep_time: data.sleep_time || null,
      wake_time: data.wake_time || null,
      notes: data.notes || null,
    };

    const { data: result, error } = await supabase
      .from('sleep_records')
      .upsert(
        {
          user_id: userId,
          date: date,
          ...sanitizedData,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error al actualizar registro de descanso:', error);
    throw error;
  }
}

/**
 * Calcula los puntos del módulo de descanso y guarda el registro
 * Retorna { pointsEarned: number, transactions: array, record: object }
 */
export async function calculateAndSaveSleepPoints(userId, date, formData) {
  try {
    if (
      formData.device_delivered_at_source === 'manual' &&
      (isBeforeCurrentTime(formData.device_delivered_at) || isFutureTime(formData.device_delivered_at))
    ) {
      throw new Error('Si ingresas la hora de entrega manualmente, debe coincidir con la hora actual.');
    }

    if (isFutureTime(formData.device_delivered_at)) {
      throw new Error('La hora de entrega no puede ser posterior a la hora actual.');
    }

    if (
      formData.wake_time_source === 'manual' &&
      (isBeforeCurrentTime(formData.wake_time) || isFutureTime(formData.wake_time))
    ) {
      throw new Error('Si ingresas la hora de levantarse manualmente, debe coincidir con la hora actual.');
    }

    if (isFutureTime(formData.wake_time)) {
      throw new Error('La hora de levantarse no puede ser posterior a la hora actual.');
    }

    // Borrar transacciones anteriores de 'sleep' para evitar duplicados
    await deletePointTransactionsByCategory(userId, date, 'sleep');

    let totalPoints = 0;
    const transactions = [];

    // 1. Dispositivo entregado a tiempo
    if (formData.device_delivered && formData.device_delivered_at) {
      const points = applyPunctuality(100, formData.device_delivered_at, DEVICE_CURFEW);
      totalPoints += points;

      const transaction = await addPointTransaction(
        userId,
        date,
        points,
        'Entregó dispositivos',
        'sleep',
        'device_delivered_ontime'
      );
      transactions.push(transaction);
    }

    // 2. Dispositivo en el baño (penalización)
    if (formData.device_in_bathroom) {
      totalPoints -= 20;

      const transaction = await addPointTransaction(
        userId,
        date,
        -20,
        'Usó dispositivo en el baño',
        'sleep',
        'device_in_bathroom'
      );
      transactions.push(transaction);
    }

    // 3. Dispositivo en la cama (penalización)
    if (formData.device_in_bed) {
      totalPoints -= 20;

      const transaction = await addPointTransaction(
        userId,
        date,
        -20,
        'Usó dispositivo en la cama',
        'sleep',
        'device_in_bed'
      );
      transactions.push(transaction);
    }

    // 4. Dormido antes de las 11pm
    if (formData.slept_by_11) {
      totalPoints += 50;

      const transaction = await addPointTransaction(
        userId,
        date,
        50,
        'Dormido antes de las 11pm',
        'sleep',
        'slept_by_11'
      );
      transactions.push(transaction);
    }

    // 5. Levantado a tiempo (antes o a la hora objetivo)
    if (formData.wake_time && formData.wake_time <= WAKE_TARGET) {
        totalPoints += 50;

        const transaction = await addPointTransaction(
          userId,
          date,
          50,
          'Se levantó a tiempo',
          'sleep',
          'wake_on_time'
        );
        transactions.push(transaction);
    }

    // Guardar el registro con los puntos calculados
    const sleepRecord = await upsertSleepRecord(userId, date, {
      ...formData,
      points_earned: totalPoints,
    });

    return {
      pointsEarned: totalPoints,
      transactions,
      record: sleepRecord,
    };
  } catch (error) {
    console.error('Error al calcular y guardar puntos de descanso:', error);
    throw error;
  }
}

// ==================== HÁBITOS COMPLETADOS ====================

/**
 * Retorna qué hábitos ha completado el usuario hoy
 * Consulta las 7 tablas de hábitos en paralelo
 * Retorna un objeto con boolean para cada hábito
 */
export async function getCompletedHabitsToday(userId, date) {
  try {
    const [
      sleepData,
      movementData,
      foodData,
      studyData,
      cleaningData,
      coexistenceData,
      householdData,
    ] = await Promise.all([
      // Sleep
      supabase
        .from('sleep_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      // Movement
      supabase
        .from('movement_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      // Food - buscar al menos una comida con points_earned > 0
      supabase
        .from('meal_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .gt('points_earned', 0)
        .limit(1),
      // Study
      supabase
        .from('study_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      // Cleaning
      supabase
        .from('cleaning_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      // Coexistence
      supabase
        .from('coexistence_records')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle(),
      // Household
      supabase
        .from('household_task_completions')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('date', date)
        .gt('points_earned', 0)
        .limit(1),
    ]);

    return {
      sleep: !!sleepData.data,
      movement: !!movementData.data,
      food: !!(foodData.data && foodData.data.length > 0),
      study: !!(studyData.data && studyData.data.points_earned > 0),
      cleaning: !!(cleaningData.data && cleaningData.data.points_earned > 0),
      coexistence: !!(coexistenceData.data && coexistenceData.data.points_earned > 0),
      household: !!(householdData.data && householdData.data.length > 0),
    };
  } catch (error) {
    console.error('Error al obtener hábitos completados:', error);
    throw error;
  }
}

/**
 * Actualiza el porcentaje de completitud en daily_records
 */
export async function updateCompletionPct(userId, date, completedCount) {
  try {
    const completionPct = Math.round((completedCount / 7) * 100);

    const { error } = await supabase
      .from('daily_records')
      .update({
        completion_pct: completionPct,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('date', date);

    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar completion_pct:', error);
    throw error;
  }
}

// ==================== MOVIMIENTO Y SALUD FÍSICA ====================

/**
 * Retorna el registro de movimiento del usuario para una fecha específica
 */
export async function getMovementRecord(userId, date) {
  try {
    const { data, error } = await supabase
      .from('movement_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener registro de movimiento:', error);
    throw error;
  }
}

/**
 * Inserta o actualiza el registro de movimiento del usuario
 */
export async function upsertMovementRecord(userId, date, data) {
  try {
    const { data: result, error } = await supabase
      .from('movement_records')
      .upsert(
        {
          user_id: userId,
          date: date,
          ...data,
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error al actualizar registro de movimiento:', error);
    throw error;
  }
}

/**
 * Calcula los puntos del módulo de movimiento y guarda el registro
 * Retorna { pointsEarned: number }
 */
export async function calculateAndSaveMovementPoints(userId, date, formData) {
  try {
    // REGLA 4: Borrar transacciones anteriores de 'movement' para evitar duplicados
    await deletePointTransactionsByCategory(userId, date, 'movement');

    let totalPoints = 0;

    // 1. Ejercicio
    if (formData.did_exercise && formData.exercise_minutes >= MIN_EXERCISE_MINUTES) {
      // Ejercicio completo (>= 20 minutos)
      totalPoints += 100;
      await addPointTransaction(
        userId,
        date,
        100,
        'Ejercicio completado',
        'movement',
        'exercise_completed'
      );
    } else if (
      formData.did_exercise &&
      formData.exercise_minutes > 0 &&
      formData.exercise_minutes < MIN_EXERCISE_MINUTES
    ) {
      // Ejercicio parcial (< 20 minutos)
      const points = calculateProportional(formData.exercise_minutes, MIN_EXERCISE_MINUTES, 100);
      totalPoints += points;
      await addPointTransaction(
        userId,
        date,
        points,
        'Ejercicio parcial',
        'movement',
        'exercise_completed'
      );
    }

    // 2. Agua
    if (formData.water_glasses > 0) {
      const points = calculateProportional(formData.water_glasses, MAX_WATER_GLASSES, 100);
      totalPoints += points;
      await addPointTransaction(
        userId,
        date,
        points,
        'Hidratación del día',
        'movement',
        'water_glasses'
      );
    }

    // 3. Caminata después del almuerzo
    if (formData.walk_after_lunch && formData.walk_minutes >= MIN_WALK_AFTER_LUNCH_MINUTES) {
      totalPoints += 50;
      await addPointTransaction(
        userId,
        date,
        50,
        'Caminata después del almuerzo',
        'movement',
        'walk_after_lunch'
      );
    }

    // Guardar el registro con los puntos calculados
    await upsertMovementRecord(userId, date, {
      ...formData,
      points_earned: totalPoints,
    });

    return {
      pointsEarned: totalPoints,
    };
  } catch (error) {
    console.error('Error al calcular y guardar puntos de movimiento:', error);
    throw error;
  }
}

// ==================== FOOD MODULE (ALIMENTACIÓN DETALLADA) ====================

export const getMealRecords = async (userId, date) => {
  const { data, error } = await supabase
    .from('meal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw error

  // Transformar el array en un objeto con la key siendo el meal_type
  const recordsObj = {
    desayuno: null,
    merienda_manana: null,
    almuerzo: null,
    merienda_tarde: null,
    cena: null,
  }

  if (data) {
    data.forEach(record => {
      recordsObj[record.meal_type] = record
    })
  }

  return recordsObj
}

export const getMealRecord = async (userId, date, mealType) => {
  const { data, error } = await supabase
    .from('meal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('meal_type', mealType)
    .maybeSingle()

  if (error) throw error
  return data
}

export const upsertMealRecord = async (userId, date, mealType, data) => {
  const { data: result, error } = await supabase
    .from('meal_records')
    .upsert({
      user_id: userId,
      date: date,
      meal_type: mealType,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, date, meal_type'
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export const calculateAndSaveMealPoints = async (userId, date, mealType, formData) => {
  // PRIMERA LÍNEA OBLIGATORIA (Regla 4)
  const categoryKey = `food_${mealType}`
  await deletePointTransactionsByCategory(userId, date, categoryKey)

  let totalPoints = 0

  // 1. Comió a tiempo
  if (formData.ate_on_time) {
    await addPointTransaction(userId, date, 30, 'Comió a tiempo', categoryKey, 'meal_on_time')
    totalPoints += 30
  }

  // 2. Ensalada (solo almuerzo)
  if (mealType === 'almuerzo' && formData.had_salad) {
    await addPointTransaction(userId, date, 30, 'Incluyó ensalada', categoryKey, 'had_salad')
    totalPoints += 30
  }

  // 3. Variedad
  if (formData.variety) {
    await addPointTransaction(userId, date, 20, 'Buena variedad', categoryKey, 'good_variety')
    totalPoints += 20
  }

  // 4. Sin TV (solo almuerzo)
  if (mealType === 'almuerzo' && formData.watched_tv === false) {
    await addPointTransaction(userId, date, 30, 'Sin TV en el almuerzo', categoryKey, 'no_tv_lunch')
    totalPoints += 30
  }

  // 5. Carbohidratos (Penalización)
  if (formData.carb_count >= 2) {
    await addPointTransaction(userId, date, -25, 'Doble carbohidrato', categoryKey, 'extra_carbs')
    totalPoints -= 25
  }

  // 6. Calidad
  if (formData.quality) {
    let qualityPts = 0
    if (formData.quality === 'excelente') qualityPts = 20
    if (formData.quality === 'buena') qualityPts = 0
    if (formData.quality === 'regular') qualityPts = -10
    if (formData.quality === 'mala') qualityPts = -20

    if (qualityPts !== 0) {
      await addPointTransaction(userId, date, qualityPts, `Calidad de comida: ${formData.quality}`, categoryKey)
      totalPoints += qualityPts
    }
  }

  // Asegurar que el total no sea negativo para la tabla general
  totalPoints = Math.max(0, totalPoints)

  // Guardar en base de datos
  // NOTA: La tabla meal_records NO tiene campo did_eat
  // Si existe el registro, significa que el usuario comió
  const savedRecord = await upsertMealRecord(userId, date, mealType, {
    meal_time: formData.meal_time,
    food_description: formData.food_description,
    quality: formData.quality,
    had_salad: formData.had_salad || false,
    variety: formData.variety || false,
    carb_count: formData.carb_count || 0,
    watched_tv: formData.watched_tv || false,
    ate_on_time: formData.ate_on_time || false,
    points_earned: totalPoints
  })

  return { pointsEarned: totalPoints, savedRecord }
}

// ==================== STUDY MODULE (ESTUDIO Y CRECIMIENTO) ====================

export const getStudyRecord = async (userId, date) => {
  const { data, error } = await supabase
    .from('study_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export const upsertStudyRecord = async (userId, date, data) => {
  const { data: result, error } = await supabase
    .from('study_records')
    .upsert({
      user_id: userId,
      date: date,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, date'
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export const calculateAndSaveStudyPoints = async (userId, date, formData) => {
  // PRIMERA LÍNEA OBLIGATORIA (Regla 4)
  const categoryKey = 'study'
  await deletePointTransactionsByCategory(userId, date, categoryKey)

  let totalPoints = 0

  // 1. Estudio (Tiempo)
  if (formData.did_study && formData.duration_minutes > 0) {
    if (formData.duration_minutes >= 30) {
      await addPointTransaction(userId, date, 100, 'Sesión de estudio completa', categoryKey, 'study_completed')
      totalPoints += 100
    } else {
      const propPts = calculateProportional(formData.duration_minutes, 30, 100)
      await addPointTransaction(userId, date, propPts, 'Sesión de estudio parcial', categoryKey, 'study_completed')
      totalPoints += propPts
    }
  }

  // 2. Nota de aprendizaje
  if (formData.learning_note && formData.learning_note.length > 10) {
    await addPointTransaction(userId, date, 20, 'Registró nota de aprendizaje', categoryKey, 'learning_note')
    totalPoints += 20
  }

  // 3. Espacio limpio
  if (formData.clean_space) {
    await addPointTransaction(userId, date, 30, 'Espacio limpio al estudiar', categoryKey, 'clean_study_space')
    totalPoints += 30
  }

  // Guardar en tabla
  const savedRecord = await upsertStudyRecord(userId, date, {
    did_study: formData.did_study || false,
    subject: formData.subject || null,
    activity_type: formData.activity_type || null,
    duration_minutes: formData.duration_minutes || 0,
    sessions_count: formData.sessions_count || 0,
    learning_note: formData.learning_note || null,
    clean_space: formData.clean_space || false,
    points_earned: totalPoints
  })

  return { pointsEarned: totalPoints, savedRecord }
}


// ==================== CLEANING MODULE (ORDEN Y LIMPIEZA) ====================

export const getCleaningRecord = async (userId, date) => {
  const { data, error } = await supabase
    .from('cleaning_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export const upsertCleaningRecord = async (userId, date, data) => {
  const { data: result, error } = await supabase
    .from('cleaning_records')
    .upsert({
      user_id: userId,
      date: date,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, date'
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export const calculateAndSaveCleaningPoints = async (userId, date, formData) => {
  // PRIMERA LÍNEA OBLIGATORIA (Regla 4)
  await deletePointTransactionsByCategory(userId, date, 'cleaning')

  let total = 0

  // 1. Cama tendida
  if (formData.bed_made) {
    await addPointTransaction(userId, date, 50, 'Tendió la cama', 'cleaning', 'bed_made')
    total += 50
  }

  // 2. Cuarto limpio
  if (formData.room_clean) {
    await addPointTransaction(userId, date, 50, 'Cuarto limpio', 'cleaning', 'room_clean')
    total += 50
  }

  // 3. Espacio ordenado
  if (formData.space_ordered) {
    await addPointTransaction(userId, date, 30, 'Espacio general ordenado', 'cleaning', 'space_ordered')
    total += 30
  }

  // Guardar en tabla
  const savedRecord = await upsertCleaningRecord(userId, date, {
    bed_made: formData.bed_made || false,
    room_clean: formData.room_clean || false,
    space_ordered: formData.space_ordered || false,
    notes: formData.notes || null,
    points_earned: total
  })

  return { pointsEarned: total, savedRecord }
}

// ==================== COEXISTENCE MODULE (RESPETO Y CONVIVENCIA) ====================

export const getCoexistenceRecord = async (userId, date) => {
  const { data, error } = await supabase
    .from('coexistence_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (error) throw error
  return data
}

export const upsertCoexistenceRecord = async (userId, date, data) => {
  const { data: result, error } = await supabase
    .from('coexistence_records')
    .upsert({
      user_id: userId,
      date: date,
      ...data,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id, date'
    })
    .select()
    .single()

  if (error) throw error
  return result
}

export const calculateAndSaveCoexistencePoints = async (userId, date, formData) => {
  // 1. Borrar transacciones previas (Regla 4)
  await deletePointTransactionsByCategory(userId, date, 'coexistence')

  let total = 0

  // 2. Respetó las normas (+60 pts)
  if (formData.respected_rules) {
    await addPointTransaction(userId, date, 60, 'Respetó las normas del día', 'coexistence', 'respected_rules')
    total += 60
  }

  // 3. No tomó cosas ajenas (+40 pts si es false)
  if (formData.took_others_things === false) {
    await addPointTransaction(userId, date, 40, 'No tomó cosas ajenas', 'coexistence', 'no_others_things')
    total += 40
  }

  // 4. Penalización por TV (asumimos límite de 120 min)
  if (formData.tv_minutes > 120) {
    await addPointTransaction(userId, date, -30, 'Excedió tiempo de TV (penalización)', 'coexistence', 'tv_overtime')
    total -= 30
  }

  // Guardar en la tabla
  const savedRecord = await upsertCoexistenceRecord(userId, date, {
    tv_minutes: formData.tv_minutes || 0,
    took_others_things: formData.took_others_things || false,
    respected_rules: formData.respected_rules !== undefined ? formData.respected_rules : true,
    incidents: formData.incidents || null,
    respect_score: formData.respect_score || 5,
    notes: formData.notes || null,
    points_earned: total
  })

  return { pointsEarned: total, savedRecord }
}
// ==================== HOUSEHOLD MODULE (TAREAS DEL HOGAR) ====================

export const getHouseholdData = async (userId, date) => {
  // 1. Obtener el día de la semana (0 = Domingo, ..., 6 = Sábado)
  // Usamos T12:00:00 para evitar saltos de día por la zona horaria
  const dateObj = new Date(date + 'T12:00:00')
  const dayOfWeek = dateObj.getDay()

  // 2. Buscar tareas asignadas a este usuario para este día
  const { data: assignments, error: asgError } = await supabase
    .from('household_task_assignments')
    .select(`
      task_id,
      household_tasks ( name, description, estimated_minutes )
    `)
    .eq('user_id', userId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)

  if (asgError) throw asgError

  // 3. Buscar si ya completó alguna hoy
  const { data: completions, error: compError } = await supabase
    .from('household_task_completions')
    .select('task_id, completed, points_earned')
    .eq('user_id', userId)
    .eq('date', date)

  if (compError) throw compError

  return { assignments: assignments || [], completions: completions || [] }
}

export const calculateAndSaveHouseholdPoints = async (userId, date, taskCompletionsData) => {
  // taskCompletionsData es un objeto: { [task_id]: boolean }
  await deletePointTransactionsByCategory(userId, date, 'household')

  let totalPts = 0
  const completionsToUpsert = []

  for (const [taskId, isCompleted] of Object.entries(taskCompletionsData)) {
    let pts = 0
    if (isCompleted) {
      pts = 80 // La regla dice 80 fijos por tarea completada
      totalPts += 80
      await addPointTransaction(
        userId, 
        date, 
        80, 
        'Completó tarea asignada del hogar', 
        'household', 
        'task_completed'
      )
    }

    completionsToUpsert.push({
      user_id: userId,
      task_id: taskId,
      date: date,
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      points_earned: pts
    })
  }

  // Guardar todas las tareas en la base de datos (si tiene asignaciones)
  if (completionsToUpsert.length > 0) {
    const { error } = await supabase
      .from('household_task_completions')
      .upsert(completionsToUpsert, { onConflict: 'user_id, task_id, date' })
      
    if (error) throw error
  }

  return { pointsEarned: totalPts }
}



// ==================== POINTS SYSTEM (SISTEMA DE PUNTOS GLOBALES) ====================

// ==================== POINTS SYSTEM ====================

export const getUserPointsBalance = async (userId) => {
  // 1. Puntos ganados (daily_records)
  const { data: earnedData, error: earnedError } = await supabase
    .from('daily_records')
    .select('total_points')
    .eq('user_id', userId)

  if (earnedError) throw earnedError
  const totalEarned = earnedData.reduce((sum, record) => sum + (record.total_points || 0), 0)

  // 2. Puntos gastados en premios (reward_redemptions)
  const { data: spentData, error: spentError } = await supabase
    .from('reward_redemptions')
    .select('rewards(points_required)')
    .eq('user_id', userId)
    .in('status', ['pendiente', 'aprobado', 'entregado'])

  const totalSpent = spentError ? 0 : spentData.reduce((sum, record) => sum + (record.rewards?.points_required || 0), 0)

  // 3. 👇 NUEVO: Puntos descontados por multas (punishments) 👇
  const { data: punishmentData, error: punishmentError } = await supabase
    .from('punishments')
    .select('points_deducted')
    .eq('user_id', userId)
    .in('status', ['pendiente', 'cumplido']) // Ignoramos los cancelados por el admin

  // Sumamos todas las multas
  const totalPenalized = punishmentError ? 0 : punishmentData.reduce((sum, record) => sum + (record.points_deducted || 0), 0)

  // 4. Calculamos el saldo final real
  const currentBalance = totalEarned - totalSpent - totalPenalized

  return { totalEarned, totalSpent, totalPenalized, currentBalance }
}
// ==================== RANKING GLOBAL (HISTÓRICO) ====================

export const getHistoricalRanking = async () => {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, avatar_url, role')

  if (usersError) throw usersError

  const { data: records, error: recordsError } = await supabase
    .from('daily_records')
    .select('user_id, total_points')

  if (recordsError) throw recordsError

  const ranking = users.map(user => {
    const userRecords = records.filter(r => r.user_id === user.id)
    const totalEarned = userRecords.reduce((sum, r) => sum + (r.total_points || 0), 0)
    return { ...user, totalEarned }
  })

  return ranking.sort((a, b) => b.totalEarned - a.totalEarned)
}

export const getDailyRanking = async (date) => {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, avatar_url, role')

  if (usersError) throw usersError

  const { data: records, error: recordsError } = await supabase
    .from('daily_records')
    .select('user_id, total_points')
    .eq('date', date)

  if (recordsError) throw recordsError

  const ranking = users.map(user => {
    // Solo buscamos el registro de este usuario para hoy
    const record = records.find(r => r.user_id === user.id)
    return { ...user, totalEarned: record?.total_points || 0 }
  })

  return ranking.sort((a, b) => b.totalEarned - a.totalEarned)
}

export const getWeeklyRanking = async (startDate, endDate) => {
  // 1. Obtenemos a todos los usuarios
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, avatar_url, role')

  if (usersError) throw usersError

  // 2. Obtenemos los registros de la semana (entre startDate y endDate)
  const { data: records, error: recordsError } = await supabase
    .from('daily_records')
    .select('user_id, total_points')
    .gte('date', startDate) // Greater than or equal (Desde el lunes)
    .lte('date', endDate)   // Less than or equal (Hasta el domingo)

  if (recordsError) throw recordsError

  // 3. Sumamos los puntos de toda la semana por cada usuario
  const ranking = users.map(user => {
    // Filtramos todos los días de la semana para este usuario
    const userRecords = records.filter(r => r.user_id === user.id)
    // Sumamos el total
    const totalEarned = userRecords.reduce((sum, r) => sum + (r.total_points || 0), 0)
    
    return { ...user, totalEarned }
  })

  // 4. Ordenamos de mayor a menor puntaje
  return ranking.sort((a, b) => b.totalEarned - a.totalEarned)
}

// ==================== PREMIOS (REWARDS) ====================

/**
 * Retorna el catálogo completo de premios disponibles
 */
export async function getRewards() {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      // Asumimos que tienes una columna is_active, si no la tienes, puedes borrar esta línea
      .eq('is_active', true) 
      .order('points_required', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener el catálogo de premios:', error);
    throw error;
  }
}

/**
 * Retorna el historial de premios canjeados por el usuario
 */
export async function getUserRedemptions(userId) {
  try {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select('*, rewards(*)') // Traemos también los datos del premio (nombre, tipo)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener el historial de canjes:', error);
    throw error;
  }
}

/**
 * Registra el canje de un premio por parte del usuario
 */
export async function redeemReward(userId, rewardId, type) {
  try {
    // REGLA CLAUDE.md: Los canjes de tipo 'dinero' requieren aprobación del admin
    // Los demás tipos se aprueban automáticamente
    const initialStatus = type === 'dinero' ? 'pendiente' : 'aprobado';

    const { data, error } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        status: initialStatus
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al registrar el canje del premio:', error);
    throw error;
  }
}


// ==================== CASTIGOS (PUNISHMENTS) ====================

export async function getUserPunishments(userId) {
  try {
    const { data, error } = await supabase
      .from('punishments')
      .select(`
        *,
        assigned_by_user:users!punishments_assigned_by_fkey(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener los castigos:', error);
    throw error;
  }
}

export async function markPunishmentCompleted(punishmentId) {
  try {
    const { data, error } = await supabase
      .from('punishments')
      .update({ 
        status: 'cumplido',
        completed_at: new Date().toISOString(), // Usamos tu campo
        updated_at: new Date().toISOString()
      })
      .eq('id', punishmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar el castigo:', error);
    throw error;
  }
}
// ============================================================================
// ==================== FASE 4: PANEL DE ADMINISTRADOR ========================
// ============================================================================

// -------------------- 1. GESTIÓN DE PREMIOS (ADMIN) --------------------

/**
 * Retorna todas las solicitudes de premios que están pendientes de aprobación
 */
export async function getPendingRedemptions() {
  try {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select(`
        *,
        users!reward_redemptions_user_id_fkey (name, avatar_url),
        rewards (name, type, points_required)
      `)
      .eq('status', 'pendiente')
      .order('created_at', { ascending: true }); // Los más antiguos primero

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    throw error;
  }
}

/**
 * Cambia el estado de una solicitud (ej. de 'pendiente' a 'aprobado' o 'rechazado')
 */
export async function updateRedemptionStatus(redemptionId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('reward_redemptions')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', redemptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error al cambiar estado a ${newStatus}:`, error);
    throw error;
  }
}

// -------------------- 2. GESTIÓN DE CASTIGOS (ADMIN) --------------------

/**
 * Inserta un nuevo castigo asignado a un usuario
 */
export async function assignPunishment(punishmentData) {
  try {
    const { data, error } = await supabase
      .from('punishments')
      .insert([{
        user_id: punishmentData.userId,
        assigned_by: punishmentData.assignedBy,
        reason: punishmentData.reason,
        points_deducted: punishmentData.pointsDeducted || 0,
        extra_task: punishmentData.extraTask || null,
        due_date: punishmentData.dueDate || null,
        // Si hay tarea, queda pendiente. Si no hay tarea, se da por cumplido al instante.
        status: 'pendiente' // TODO castigo nace pendiente para que el usuario lo vea
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al asignar el castigo:', error);
    throw error;
  }
}

/**
 * Cancela un castigo injusto o erróneo (Devuelve los puntos al usuario)
 */
export async function cancelPunishment(punishmentId) {
  try {
    const { data, error } = await supabase
      .from('punishments')
      .update({ 
        status: 'cancelado',
        updated_at: new Date().toISOString()
      })
      .eq('id', punishmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al cancelar el castigo:', error);
    throw error;
  }
}

// -------------------- 3. UTILIDADES DEL ADMIN --------------------

/**
 * Obtiene la lista de todos los miembros de la familia para el selector de castigos
 */
export async function getFamilyMembers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener la familia:', error);
    throw error;
  }
}

// ==================== ADMIN: GESTIÓN DE USUARIOS ====================

/**
 * Obtiene todos los usuarios con información completa para el admin
 * Incluye: id, name, avatar_url, role, is_active, pin, created_at
 */
export async function getAllUsersForAdmin() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, role, is_active, pin, created_at')
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener usuarios para admin:', error);
    throw error;
  }
}

/**
 * Actualiza los datos de un usuario (nombre, avatar, PIN)
 * @param {string} userId - ID del usuario
 * @param {object} updates - Campos a actualizar { name?, avatar_url?, pin? }
 */
export async function updateUserDetails(userId, updates) {
  try {
    // Filtrar solo los campos permitidos
    const allowedFields = ['name', 'avatar_url', 'pin'];
    const filteredUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

/**
 * Activa o desactiva un usuario
 * @param {string} userId - ID del usuario
 * @param {boolean} isActive - true = activo, false = inactivo
 */
export async function toggleUserActive(userId, isActive) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw error;
  }
}

/**
 * Crea un nuevo usuario
 * @param {object} userData - { name, pin, avatar_url?, role? }
 */
export async function createUser(userData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        pin: userData.pin,
        avatar_url: userData.avatar_url || null,
        role: userData.role || 'usuario',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

// ==================== ADMIN: GESTIÓN DE REGLAS DE PUNTOS ====================

/**
 * Obtiene todas las reglas de puntos organizadas por categoría
 * Para el panel de administración
 */
export async function getAllPointsRules() {
  try {
    const { data, error } = await supabase
      .from('points_rules')
      .select('*')
      .order('category', { ascending: true })
      .order('action_key', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener reglas de puntos:', error);
    throw error;
  }
}

/**
 * Actualiza el valor de puntos de una regla específica
 * @param {string} ruleId - ID de la regla
 * @param {number} newPoints - Nuevo valor de puntos
 */
export async function updatePointsRule(ruleId, newPoints) {
  try {
    const { data, error } = await supabase
      .from('points_rules')
      .update({ points: newPoints })
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al actualizar regla de puntos:', error);
    throw error;
  }
}

// ==================== ADMIN: ESTADÍSTICAS ====================

/**
 * Obtiene todos los analytics del panel admin en una sola RPC.
 * La agregación vive en PostgreSQL para evitar múltiples roundtrips
 * y trabajo innecesario en JavaScript.
 */
export async function getAdminDashboardAnalytics() {
  try {
    const { data, error } = await supabase.rpc('get_admin_dashboard_analytics');

    if (error) throw error;

    return {
      stats: data?.stats || {
        activeUsers: 0,
        totalPointsToday: 0,
        pendingRewards: 0,
        pendingPunishments: 0,
        habitsCompletedToday: 0,
      },
      weeklyRanking: data?.weeklyRanking || [],
      pointsActivity: data?.pointsActivity || [],
      habitsStats: data?.habitsStats || [],
    };
  } catch (error) {
    console.error('Error al obtener analytics del panel admin:', error);
    throw error;
  }
}
