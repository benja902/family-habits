import { useQuery } from '@tanstack/react-query';
import { getRankingData } from '../services/supabase';

/**
 * Hook para obtener el ranking familiar.
 * Sigue la Regla 1: No usa onSuccess.
 */
export const useRanking = (period = 'week') => {
  return useQuery({
    queryKey: ['ranking', period],
    queryFn: () => getRankingData(period),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
    retry: 1
  });
};