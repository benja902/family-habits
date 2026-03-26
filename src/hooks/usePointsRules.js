/**
 * Hook para gestión de reglas de puntos (solo admin)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllPointsRules, updatePointsRule } from '../services/supabase'
import { toast } from 'sonner'

export default function usePointsRules() {
  const queryClient = useQueryClient()

  // Obtener todas las reglas
  const rulesQuery = useQuery({
    queryKey: ['pointsRules'],
    queryFn: getAllPointsRules,
    staleTime: 1000 * 60 * 10, // 10 minutos - las reglas no cambian frecuentemente
  })

  // Actualizar una regla
  const updateRuleMutation = useMutation({
    mutationFn: ({ ruleId, newPoints }) => updatePointsRule(ruleId, newPoints),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointsRules'] })
      toast.success('Regla actualizada correctamente.')
    },
    onError: (error) => {
      console.error('Error al actualizar regla:', error)
      toast.error('No se pudo actualizar la regla.')
    }
  })

  return {
    rules: rulesQuery.data || [],
    isLoading: rulesQuery.isLoading,
    updateRule: updateRuleMutation.mutate,
    isUpdating: updateRuleMutation.isPending,
  }
}
