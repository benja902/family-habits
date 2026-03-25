import { useQuery } from '@tanstack/react-query'
import { getHistoricalRanking } from '../services/supabase'
export default function useRanking() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['historicalRanking'], // Cambiamos la key
    queryFn: getHistoricalRanking,   // Usamos la función histórica
    staleTime: 1000 * 60 * 5, 
  })

  return {
    ranking: data || [],
    isLoading,
    error
  }
}