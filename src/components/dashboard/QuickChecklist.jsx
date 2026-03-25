import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs'
import useCompletedHabits from '../../hooks/useCompletedHabits'
import { HABIT_LABELS, HABIT_COLORS } from '../../constants/habits.constants'

export default function QuickChecklist() {
  const { completedHabits, completedCount, isLoading } = useCompletedHabits()

  // Mapeo de los 7 hábitos principales
  const checklist = [
    {
      id: 'sleep',
      label: HABIT_LABELS.sleep,
      isCompleted: completedHabits.sleep,
      color: HABIT_COLORS.sleep
    },
    {
      id: 'movement',
      label: HABIT_LABELS.movement,
      isCompleted: completedHabits.movement,
      color: HABIT_COLORS.movement
    },
    {
      id: 'food',
      label: HABIT_LABELS.food,
      isCompleted: completedHabits.food,
      color: HABIT_COLORS.food
    },
    {
      id: 'study',
      label: HABIT_LABELS.study,
      isCompleted: completedHabits.study,
      color: HABIT_COLORS.study
    },
    {
      id: 'cleaning',
      label: HABIT_LABELS.cleaning,
      isCompleted: completedHabits.cleaning,
      color: HABIT_COLORS.cleaning
    },
    {
      id: 'coexistence',
      label: HABIT_LABELS.coexistence,
      isCompleted: completedHabits.coexistence,
      color: HABIT_COLORS.coexistence
    },
    {
      id: 'household',
      label: HABIT_LABELS.household,
      isCompleted: completedHabits.household,
      color: HABIT_COLORS.household
    }
  ]

  const totalCount = 7
  const allCompleted = completedCount === totalCount

  if (isLoading) {
    return (
      <Card>
        <Header>
          <Title>Checklist rápido</Title>
          <Counter>Cargando...</Counter>
        </Header>
      </Card>
    )
  }

  return (
    <Card>
      <Header>
        <Title>Checklist rápido</Title>
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
          ¡Excelente! Completaste las tareas clave de hoy. 🌟
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