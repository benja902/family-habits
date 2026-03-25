import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs'

// Importamos los hooks centralizados para leer datos precisos del día
import useSleepModule from '../../hooks/useSleepModule'
import useFoodModule from '../../hooks/useFoodModule'
import useMovementModule from '../../hooks/useMovementModule'
import useStudyModule from '../../hooks/useStudyModule'
import useHouseholdModule from '../../hooks/useHouseholdModule'
import useCleaningModule from '../../hooks/useCleaningModule'

export default function QuickChecklist() {
  // Consultamos los registros específicos del día
  const { sleepRecord } = useSleepModule()
  const { mealRecords } = useFoodModule()
  const { movementRecord } = useMovementModule()
  const { studyRecord } = useStudyModule()
  const { hasRecord: hasHouseholdRecord } = useHouseholdModule()
  const { cleaningRecord } = useCleaningModule()

  // Rediseñamos el checklist para que sea único y no redundante
  const checklist = [
    {
      id: 'bed',
      label: 'Cama matutina (Tendida)',
      // Vigilamos si limpieza está completado (points > 0), pero mostramos etiqueta de Cama
      isCompleted: (cleaningRecord?.points_earned || 0) > 0,
      color: '#EAB308' // cleaning
    },
    {
      id: 'breakfast',
      label: 'Nutrición (Desayuno)',
      isCompleted: mealRecords?.desayuno?.did_eat || false,
      color: '#F97316' // food
    },
    {
      id: 'water',
      label: 'Hidratación (8 vasos)',
      isCompleted: (movementRecord?.water_glasses || 0) >= 8,
      color: '#22C55E' // movement
    },
    {
      id: 'studyNote',
      label: 'Crecimiento (Nota Estudio)',
      // ÚNICO: Vigilamos si escribió una nota de aprendizaje, no si solo estudió
      isCompleted: (studyRecord?.learning_note?.length || 0) > 10,
      color: '#3B82F6' // study
    },
    {
      id: 'exercise',
      label: 'Actividad Física (Ejercicio)',
      // ÚNICO: Vigilamos el ejercicio intenso, no la caminata
      isCompleted: movementRecord?.did_exercise || false,
      color: '#22C55E' // movement
    },
    {
      id: 'household',
      label: 'Tareas del Hogar Completas',
      // Vigilamos que el módulo Hogar esté listo, pero con un nombre más claro
      isCompleted: hasHouseholdRecord,
      color: '#D97706' // household
    },
    {
      id: 'devices',
      label: 'Descanso Digital (Celular)',
      // Vigilamos específicamente que entregó el dispositivo (device_delivered_at en Supabase)
      isCompleted: sleepRecord?.device_delivered_at != null,
      color: '#6366F1' // sleep
    }
  ]

  const completedCount = checklist.filter(item => item.isCompleted).length
  const totalCount = checklist.length
  const allCompleted = completedCount === totalCount

  return (
    <Card>
      <Header>
        <Title>Checklist de Acciones Clave</Title>
        <Counter $isComplete={allCompleted}>
          {completedCount}/{totalCount}
        </Counter>
      </Header>

      <List>
        {checklist.map((item, index) => (
          <ListItem 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <IconWrapper $isCompleted={item.isCompleted} $color={item.color}>
              {item.isCompleted ? <BsCheckCircleFill /> : <BsCircle />}
            </IconWrapper>
            <Label $isCompleted={item.isCompleted}>{item.label}</Label>
          </ListItem>
        ))}
      </List>
      
      {allCompleted && (
        <MotivationalText
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ¡Perfecto, David! Superaste tus micro-metas de hoy. 🌟
        </MotivationalText>
      )}
    </Card>
  )
}

// ==================== STYLED COMPONENTS ====================

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`

const Counter = styled.div`
  background: ${({ $isComplete, theme }) => $isComplete ? `${theme.colors.success}20` : theme.colors.background};
  color: ${({ $isComplete, theme }) => $isComplete ? theme.colors.success : theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ListItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${({ $isCompleted, $color, theme }) => $isCompleted ? $color : theme.colors.border};
  transition: color 0.3s ease;
`

const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $isCompleted, theme }) => $isCompleted ? theme.colors.textPrimary : theme.colors.textSecondary};
  text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
  opacity: ${({ $isCompleted }) => $isCompleted ? 0.7 : 1};
  transition: all 0.3s ease;
`

const MotivationalText = styled(motion.p)`
  margin: 16px 0 0 0;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.success};
`