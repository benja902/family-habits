import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

/**
 * QuickChecklist — Checklist rápido del Dashboard.
 * Recibe datos por props (NO hace queries propias).
 * PROMPT 3-4: Arquitectura correcta según CLAUDE.md.
 */
export default function QuickChecklist({
  sleepRecord,
  mealRecords,
  movementRecord,
  studyRecord,
  cleaningRecord,
  hasHouseholdRecord
}) {
  const navigate = useNavigate()

  // 7 items del checklist según CLAUDE.md PROMPT 3-4-1
  const checklist = [
    {
      id: 'bed',
      label: '🛏️ Cama tendida',
      isCompleted: cleaningRecord?.bed_made || false,
      color: '#6366F1', // sleep / morning routine
      route: '/habits/morning-routine'
    },
    {
      id: 'water',
      label: '💧 8 vasos de agua',
      isCompleted: (movementRecord?.water_glasses || 0) >= 8,
      color: '#F97316', // food
      route: '/habits/food'
    },
    {
      id: 'exercise',
      label: '⚡ Ejercicio',
      isCompleted: movementRecord?.did_exercise || false,
      color: '#22C55E', // movement
      route: '/habits/movement'
    },
    {
      id: 'devices',
      label: '📱 Rutina del celular',
      isCompleted: sleepRecord?.device_delivered_at != null,
      color: '#6366F1', // sleep
      route: '/habits/phone-use'
    },
    {
      id: 'study',
      label: '📚 Estudió hoy',
      isCompleted: studyRecord?.did_study || false,
      color: '#3B82F6', // study
      route: '/habits/study'
    },
    {
      id: 'room',
      label: '🧹 Cuarto limpio',
      isCompleted: cleaningRecord?.room_clean || false,
      color: '#EAB308', // cleaning
      route: '/habits/cleaning'
    },
    {
      id: 'household',
      label: '🏠 Tareas del hogar',
      isCompleted: hasHouseholdRecord,
      color: '#14B8A6', // household
      route: '/habits/household'
    }
  ]

  const completedCount = checklist.filter(item => item.isCompleted).length
  const totalCount = checklist.length
  const allCompleted = completedCount === totalCount

  return (
    <Card>
      <Header>
        <Title>Resumen del día</Title>
        <Counter $isComplete={allCompleted}>
          {completedCount} / {totalCount}
        </Counter>
      </Header>

      <List>
        {checklist.map((item, index) => (
          <ListItem
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.route)}
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
          ¡Perfecto! Completaste todas las acciones clave del día. 🌟
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
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
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
