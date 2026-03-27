import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckCircleFill, BsCircleFill, BsClock } from 'react-icons/bs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DEVICE_CURFEW, SLEEP_TARGET, WAKE_TARGET } from '../../constants/habits.constants'

dayjs.extend(customParseFormat)

/**
 * DayTimeline — Línea de tiempo del día.
 * Recibe datos por props (NO hace queries propias).
 * PROMPT 3-5: Arquitectura correcta según CLAUDE.md.
 * Detecta evento "próximo" basado en hora actual.
 */
export default function DayTimeline({
  sleepRecord,
  mealRecords,
  movementRecord,
  studyRecord
}) {
  const now = dayjs()

  const parseTodayTime = (time) => {
    if (!time) return null
    return dayjs(`${now.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm')
  }

  const hasValue = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
  }

  // Función para determinar si un evento es "próximo" (dentro de 30 min)
  const isUpcoming = (eventTime, isCompleted) => {
    if (!eventTime || isCompleted) return false

    const eventMoment = parseTodayTime(eventTime)
    if (!eventMoment || !eventMoment.isValid()) return false

    const diffMinutes = eventMoment.diff(now, 'minute')
    return diffMinutes > 0 && diffMinutes <= 30
  }

  // Función para determinar si un evento está overdue (pasó y no se completó)
  const isOverdue = (eventTime, isCompleted) => {
    if (!eventTime || isCompleted) return false

    const eventMoment = parseTodayTime(eventTime)
    if (!eventMoment || !eventMoment.isValid()) return false

    return now.isAfter(eventMoment)
  }

  // Verificar comidas: si existe el registro significa que comió
  // La tabla meal_records NO tiene campo did_eat, solo se crea registro cuando come
  const breakfastCompleted = mealRecords?.desayuno != null
  const lunchCompleted = mealRecords?.almuerzo != null
  const morningSnackCompleted = mealRecords?.merienda_manana != null
  const afternoonSnackCompleted = mealRecords?.merienda_tarde != null

  // 9 eventos fijos del timeline según PROMPT 3-5-1
  const timelineEvents = [
    {
      id: 'wake',
      time: WAKE_TARGET,
      title: 'Rutina de mañana',
      isCompleted: hasValue(sleepRecord?.wake_time),
      color: '#6366F1'
    },
    {
      id: 'breakfast',
      time: '07:30',
      title: 'Desayuno',
      isCompleted: breakfastCompleted,
      color: '#F97316'
    },
    {
      id: 'snack_morning',
      time: '10:00',
      title: 'Merienda mañana',
      isCompleted: morningSnackCompleted,
      color: '#F97316'
    },
    {
      id: 'lunch',
      time: '13:00',
      title: 'Almuerzo + caminata',
      isCompleted: lunchCompleted,
      color: '#F97316'
    },
    {
      id: 'snack_afternoon',
      time: '16:00',
      title: 'Merienda tarde',
      isCompleted: afternoonSnackCompleted,
      color: '#F97316'
    },
    {
      id: 'exercise',
      time: '19:00',
      title: 'Ejercicio',
      isCompleted: !!movementRecord?.did_exercise,
      color: '#22C55E'
    },
    {
      id: 'study',
      time: '20:00',
      title: 'Estudio',
      isCompleted: !!studyRecord?.did_study,
      color: '#3B82F6'
    },
    {
      id: 'devices',
      time: DEVICE_CURFEW,
      title: 'Rutina del celular',
      isCompleted: hasValue(sleepRecord?.device_delivered_at),
      color: '#6366F1'
    },
    {
      id: 'sleep',
      time: SLEEP_TARGET,
      title: 'Rutina de noche',
      isCompleted: sleepRecord?.slept_by_11 === true || sleepRecord?.asleep_at_11 === true,
      color: '#6366F1'
    }
  ]

  const eventsWithStatus = timelineEvents.map((event) => ({
    ...event,
    isUpcoming: isUpcoming(event.time, event.isCompleted),
    isOverdue: isOverdue(event.time, event.isCompleted)
  }))

  return (
    <Card>
      <Header>
        <Title>Tu día</Title>
        <CurrentTime>{now.format('hh:mm A')}</CurrentTime>
      </Header>

      <TimelineContainer>
        {eventsWithStatus.map((event, index) => {
          const isLast = index === eventsWithStatus.length - 1

          return (
            <TimelineItem
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LeftCol>
                <TimeText
                  $isCompleted={event.isCompleted}
                  $isUpcoming={event.isUpcoming}
                  $isOverdue={event.isOverdue}
                >
                  {event.time}
                </TimeText>
              </LeftCol>

              <CenterCol>
                <NodeWrapper>
                  <IconNode
                    $isCompleted={event.isCompleted}
                    $isUpcoming={event.isUpcoming}
                    $isOverdue={event.isOverdue}
                    $color={event.color}
                  >
                    {event.isCompleted ? (
                      <BsCheckCircleFill />
                    ) : event.isUpcoming ? (
                      <BsClock />
                    ) : (
                      <BsCircleFill size={12} />
                    )}
                  </IconNode>
                </NodeWrapper>

                {!isLast && (
                  <Line
                    $isCompleted={event.isCompleted}
                    $isUpcoming={event.isUpcoming}
                    $isOverdue={event.isOverdue}
                    $color={event.color}
                  />
                )}
              </CenterCol>

              <RightCol>
                <EventTitle
                  $isCompleted={event.isCompleted}
                  $isUpcoming={event.isUpcoming}
                  $isOverdue={event.isOverdue}
                >
                  {event.title}
                </EventTitle>
              </RightCol>
            </TimelineItem>
          )
        })}
      </TimelineContainer>
    </Card>
  )
}

// ==================== STYLED COMPONENTS ====================

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
`

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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`

const CurrentTime = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  padding: 4px 10px;
  border-radius: 8px;
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
  color: ${({ $isCompleted, $isUpcoming, $isOverdue, theme }) => {
    if ($isCompleted) return theme.colors.textPrimary
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    return theme.colors.textSecondary
  }};
  opacity: ${({ $isCompleted, $isUpcoming }) => {
    if ($isUpcoming) return 1
    if ($isCompleted) return 1
    return 0.7
  }};
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
  color: ${({ $isCompleted, $isUpcoming, $isOverdue, $color, theme }) => {
    if ($isCompleted) return $color
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    return theme.colors.border
  }};
  font-size: ${({ $isCompleted, $isUpcoming }) => {
    if ($isUpcoming) return '24px'
    if ($isCompleted) return '20px'
    return '12px'
  }};
  transition: all 0.3s ease;
  animation: ${({ $isUpcoming }) =>
    $isUpcoming ? pulse : 'none'} 2s ease-in-out infinite;
`

const Line = styled.div`
  width: 2px;
  flex-grow: 1;
  background: ${({ $isCompleted, $isUpcoming, $isOverdue, $color, theme }) => {
    if ($isCompleted) return `${$color}66`
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    return theme.colors.border
  }};
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
  font-weight: ${({ $isUpcoming }) => ($isUpcoming ? 800 : 700)};
  margin: 0;
  color: ${({ $isCompleted, $isUpcoming, $isOverdue, theme }) => {
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    if ($isCompleted) return theme.colors.textPrimary
    return theme.colors.textSecondary
  }};
  text-decoration: ${({ $isCompleted }) =>
    $isCompleted ? 'line-through' : 'none'};
  opacity: ${({ $isCompleted, $isUpcoming }) => {
    if ($isUpcoming) return 1
    if ($isCompleted) return 0.7
    return 1
  }};
  transition: all 0.3s ease;
`
