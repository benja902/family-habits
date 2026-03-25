import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMealRecords, calculateAndSaveMealPoints } from '../services/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getTodayString } from '../utils/dates.utils'
import { toast } from 'sonner'

export const MEAL_TYPES = ['desayuno', 'merienda_manana', 'almuerzo', 'merienda_tarde', 'cena']

export const MEAL_LABELS = {
  desayuno: 'Desayuno',
  merienda_manana: 'Merienda',
  almuerzo: 'Almuerzo',
  merienda_tarde: 'Merienda tarde',
  cena: 'Cena',
}

export default function useFoodModule() {
  const { currentUser } = useAuthStore()
  const queryClient = useQueryClient()
  const date = getTodayString()

  const query = useQuery({
    queryKey: ['mealRecords', currentUser?.id, date],
    queryFn: () => getMealRecords(currentUser.id, date),
    enabled: !!currentUser?.id,
  })

  // Función genérica para manejar el éxito de cualquier mutación
  const handleSuccess = (result, mealType) => {
    queryClient.invalidateQueries({ queryKey: ['mealRecords'] })
    queryClient.invalidateQueries({ queryKey: ['dailyRecord'] })
    queryClient.invalidateQueries({ queryKey: ['completedHabits'] })
    toast.success(`¡+${result.pointsEarned} pts! ${MEAL_LABELS[mealType]} registrado 🍽️`)
  }

  const handleError = (error) => {
    console.error('Error guardando comida:', error)
    toast.error('No se pudo guardar. Intenta de nuevo.')
  }

  // Mutaciones explícitas por cada tipo de comida
  const mutationDesayuno = useMutation({
    mutationFn: (data) => calculateAndSaveMealPoints(currentUser.id, date, 'desayuno', data),
    onSuccess: (res) => handleSuccess(res, 'desayuno'),
    onError: handleError
  })

  const mutationMeriendaManana = useMutation({
    mutationFn: (data) => calculateAndSaveMealPoints(currentUser.id, date, 'merienda_manana', data),
    onSuccess: (res) => handleSuccess(res, 'merienda_manana'),
    onError: handleError
  })

  const mutationAlmuerzo = useMutation({
    mutationFn: (data) => calculateAndSaveMealPoints(currentUser.id, date, 'almuerzo', data),
    onSuccess: (res) => handleSuccess(res, 'almuerzo'),
    onError: handleError
  })

  const mutationMeriendaTarde = useMutation({
    mutationFn: (data) => calculateAndSaveMealPoints(currentUser.id, date, 'merienda_tarde', data),
    onSuccess: (res) => handleSuccess(res, 'merienda_tarde'),
    onError: handleError
  })

  const mutationCena = useMutation({
    mutationFn: (data) => calculateAndSaveMealPoints(currentUser.id, date, 'cena', data),
    onSuccess: (res) => handleSuccess(res, 'cena'),
    onError: handleError
  })

  const mutationsMap = {
    desayuno: mutationDesayuno,
    merienda_manana: mutationMeriendaManana,
    almuerzo: mutationAlmuerzo,
    merienda_tarde: mutationMeriendaTarde,
    cena: mutationCena
  }

  const saveMeal = (mealType, formData) => {
    mutationsMap[mealType].mutate(formData)
  }

  const isSavingMeal = (mealType) => {
    return mutationsMap[mealType]?.isPending || false
  }

  return {
    mealRecords: query.data || {},
    isLoading: query.isLoading,
    MEAL_TYPES,
    MEAL_LABELS,
    saveMeal,
    isSavingMeal
  }
}