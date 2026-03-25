import { useQuery } from '@tanstack/react-query'
// Importamos correctamente las funciones de supabase
import { getHistoricalRanking, getDailyRanking, getWeeklyRanking } from '../services/supabase'
// Importamos las utilidades de fecha, incluyendo la nueva de getWeekEnd
import { getTodayString, getWeekStart, getWeekEnd } from '../utils/dates.utils'

export default function useRanking(mode = 'general') {
  const today = getTodayString()

  const { data, isLoading, error } = useQuery({
    queryKey: ['ranking', mode, today],
    queryFn: () => {
      // Si el modo es 'daily', pedimos el de hoy
      if (mode === 'daily') {
        return getDailyRanking(today)
      }
      
      // Si el modo es 'weekly', calculamos el lunes y el domingo, y se los pasamos a supabase
      if (mode === 'weekly') {
        const monday = getWeekStart(today)
        const sunday = getWeekEnd(today)
        return getWeeklyRanking(monday, sunday) // ¡Aquí estaba el error antes! Ahora sí tiene fechas
      }
      
      // Si no es ninguno de los anteriores, pedimos el histórico general
      return getHistoricalRanking() 
    },
    staleTime: 1000 * 60 * 5, 
  })

  return {
    ranking: data || [],
    isLoading,
    error
  }
}