/**
 * Funciones de consulta a Supabase para el Panel Familiar de Hábitos.
 * Todas las operaciones de base de datos van en este archivo.
 * Los componentes NUNCA deben llamar a Supabase directamente.
 */

import { supabase } from '../lib/supabaseClient';
import { applyPunctuality, calculateProportional } from '../utils/points.utils';

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

// ==================== RANKING ====================

/**
 * Retorna el ranking familiar ordenado por puntos del día
 */
export async function getFamilyRanking(date) {
  try {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*, users(id, name, avatar_url)')
      .eq('date', date)
      .order('total_points', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener ranking familiar:', error);
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
    // Borrar transacciones anteriores de 'sleep' para evitar duplicados
    await deletePointTransactionsByCategory(userId, date, 'sleep');

    let totalPoints = 0;
    const transactions = [];

    // 1. Dispositivo entregado a tiempo
    if (formData.device_delivered && formData.device_delivered_at) {
      const points = applyPunctuality(100, formData.device_delivered_at, '22:00');
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

    // 5. Levantado a tiempo (antes de las 07:00)
    if (formData.wake_time) {
      const [hours] = formData.wake_time.split(':').map(Number);
      if (hours < 7) {
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
      sleep: !!(sleepData.data && sleepData.data.points_earned > 0),
      movement: !!(movementData.data && movementData.data.points_earned > 0),
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
    if (formData.did_exercise && formData.exercise_minutes >= 20) {
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
    } else if (formData.did_exercise && formData.exercise_minutes > 0 && formData.exercise_minutes < 20) {
      // Ejercicio parcial (< 20 minutos)
      const points = calculateProportional(formData.exercise_minutes, 20, 100);
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
      const points = calculateProportional(formData.water_glasses, 8, 100);
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
    if (formData.walk_after_lunch) {
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