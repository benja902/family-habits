import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckCircleFill, BsCircleFill } from 'react-icons/bs'

// Importamos los hooks específicos para leer la granularidad de cada acción
import useSleepModule from '../../hooks/useSleepModule'
import useFoodModule from '../../hooks/useFoodModule'
import useMovementModule from '../../hooks/useMovementModule'
import useStudyModule from '../../hooks/useStudyModule'

export default function DayTimeline() {
  const { sleepRecord } = useSleepModule()
  const { mealRecords } = useFoodModule()
  const { movementRecord } = useMovementModule()
  const { studyRecord } = useStudyModule()

  // Definimos los hitos del día con los nombres EXACTOS de tu base de datos
  const timelineEvents = [
    {
      id: 'wake',
      time: '06:30 a. m.',
      title: 'Levantarse',
      isCompleted: sleepRecord?.wake_time != null,
      color: '#6366F1' // sleep
    },
    {
      id: 'breakfast',
      time: '07:00 a. m.',
      title: 'Desayuno',
      isCompleted: mealRecords?.desayuno?.did_eat || false,
      color: '#F97316' // food
    },
    {
      id: 'snack',
      time: '10:00 a. m.',
      title: 'Merienda',
      isCompleted: mealRecords?.merienda?.did_eat || false,
      color: '#F97316' // food
    },
    {
      id: 'lunch',
      time: '13:00 p. m.',
      title: 'Almuerzo',
      isCompleted: mealRecords?.almuerzo?.did_eat || false,
      color: '#F97316' // food
    },
    {
      id: 'movement',
      time: 'Tarde',
      title: 'Caminata / Ejercicio',
      isCompleted: movementRecord?.did_exercise || (movementRecord?.walk_minutes || 0) >= 15,
      color: '#22C55E' // movement
    },
    {
      id: 'study',
      time: 'Tarde',
      title: 'Estudio y aprendizaje',
      isCompleted: studyRecord?.did_study || false,
      color: '#3B82F6' // study
    },
    {
      id: 'devices',
      time: '10:00 p. m.',
      title: 'Entregar aparatos e ir a cama',
      // CORRECCIÓN APLICADA AQUÍ: device_delivered_at
      isCompleted: sleepRecord?.device_delivered_at != null && sleepRecord?.bed_time != null,
      color: '#6366F1' // sleep
    },
    {
      id: 'asleep',
      time: '11:00 p. m.',
      title: 'Ya dormía',
      isCompleted: sleepRecord?.asleep_at_11 === true,
      color: '#6366F1' // sleep
    }
  ]

  return (
    <Card>
      <Title>Línea del día</Title>
      <TimelineContainer>
        {timelineEvents.map((event, index) => {
          const isLast = index === timelineEvents.length - 1

          return (
            <TimelineItem 
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <LeftCol>
                <TimeText $isCompleted={event.isCompleted}>{event.time}</TimeText>
              </LeftCol>

              <CenterCol>
                <NodeWrapper>
                  <IconNode $isCompleted={event.isCompleted} $color={event.color}>
                    {event.isCompleted ? <BsCheckCircleFill /> : <BsCircleFill size={12} />}
                  </IconNode>
                </NodeWrapper>
                {/* Línea conectora vertical */}
                {!isLast && <Line $isCompleted={event.isCompleted} $color={event.color} />}
              </CenterCol>

              <RightCol>
                <EventTitle $isCompleted={event.isCompleted}>{event.title}</EventTitle>
              </RightCol>
            </TimelineItem>
          )
        })}
      </TimelineContainer>
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

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`

const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const TimelineItem = styled(motion.div)`
  display: flex;
  min-height: 56px;
`

const LeftCol = styled.div`
  width: 75px;
  flex-shrink: 0;
  text-align: right;
  padding-right: 12px;
  padding-top: 2px;
`

const TimeText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ $isCompleted, theme }) => $isCompleted ? theme.colors.textPrimary : theme.colors.textSecondary};
  opacity: ${({ $isCompleted }) => $isCompleted ? 1 : 0.7};
`

const CenterCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
`

const NodeWrapper = styled.div`
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background: ${({ theme }) => theme.colors.surface};
`

const IconNode = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $isCompleted, $color, theme }) => $isCompleted ? $color : theme.colors.border};
  font-size: ${({ $isCompleted }) => $isCompleted ? '20px' : '12px'};
  transition: all 0.3s ease;
`

const Line = styled.div`
  width: 2px;
  flex-grow: 1;
  background: ${({ $isCompleted, $color, theme }) => $isCompleted ? `${$color}66` : theme.colors.border};
  margin-top: -4px;
  margin-bottom: -4px;
  transition: background 0.3s ease;
`

const RightCol = styled.div`
  flex-grow: 1;
  padding-left: 12px;
  padding-top: 2px;
  padding-bottom: 24px;
`

const EventTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: ${({ $isCompleted, theme }) => $isCompleted ? theme.colors.textPrimary : theme.colors.textSecondary};
  text-decoration: ${({ $isCompleted }) => $isCompleted ? 'line-through' : 'none'};
  opacity: ${({ $isCompleted }) => $isCompleted ? 0.7 : 1};
  transition: all 0.3s ease;
`