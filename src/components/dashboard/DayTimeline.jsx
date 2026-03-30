import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import {
  BsCheckCircleFill,
  BsCircleFill,
  BsClock,
  BsDashCircleFill,
  BsXCircleFill,
} from 'react-icons/bs'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { DEVICE_CURFEW, SLEEP_TARGET, WAKE_TARGET } from '../../constants/habits.constants'

dayjs.extend(customParseFormat)

const TASK_STATUS = {
  DONE: 'done',
  TODO: 'todo',
  FAILED: 'failed',
  PROGRESS: 'progress',
}

const hasValue = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

const getModuleStatus = (tasks) => {
  const doneCount = tasks.filter((task) => task.status === TASK_STATUS.DONE).length
  const touchedCount = tasks.filter((task) => task.status !== TASK_STATUS.TODO).length

  if (doneCount === tasks.length && tasks.length > 0) {
    return 'completed'
  }

  if (touchedCount > 0) {
    return 'in_progress'
  }

  return 'pending'
}

export default function DayTimeline({
  sleepRecord,
  mealRecords,
  hydrationRecord,
  movementRecord,
  studyRecord,
  cleaningRecord,
  coexistenceRecord,
  householdData,
}) {
  const now = dayjs()

  const parseTodayTime = (time) => {
    if (!time) return null
    return dayjs(`${now.format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm')
  }

  const isUpcoming = (eventTime, moduleStatus) => {
    if (!eventTime || moduleStatus === 'completed') return false

    const eventMoment = parseTodayTime(eventTime)
    if (!eventMoment || !eventMoment.isValid()) return false

    const diffMinutes = eventMoment.diff(now, 'minute')
    return diffMinutes > 0 && diffMinutes <= 30
  }

  const isOverdue = (eventTime, moduleStatus) => {
    if (!eventTime || moduleStatus === 'completed') return false

    const eventMoment = parseTodayTime(eventTime)
    if (!eventMoment || !eventMoment.isValid()) return false

    return now.isAfter(eventMoment)
  }

  const phoneActivityStarted = !!(
    sleepRecord?.device_delivered ||
    hasValue(sleepRecord?.device_delivered_at) ||
    sleepRecord?.device_in_bed ||
    sleepRecord?.device_in_bathroom
  )

  const householdTasks = (householdData?.assignments || []).map((assignment) => {
    const completion = (householdData?.completions || []).find((item) => item.task_id === assignment.task_id)

    return {
      label: assignment.household_tasks?.name || 'Tarea del hogar',
      status: completion?.completed ? TASK_STATUS.DONE : TASK_STATUS.TODO,
    }
  })

  const modules = [
    {
      id: 'morning',
      time: WAKE_TARGET,
      title: 'Rutina de mañana',
      color: '#6366F1',
      tasks: [
        {
          label: 'Despertarse',
          status: hasValue(sleepRecord?.wake_time) ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
        {
          label: 'Tender la cama',
          status: cleaningRecord?.bed_made ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'food',
      time: '13:00',
      title: 'Alimentación',
      color: '#F97316',
      tasks: [
        {
          label: 'Almuerzo registrado',
          status: mealRecords?.almuerzo ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
        {
          label: `Completar 8 vasos (${Number(hydrationRecord?.water_glasses) || 0}/8)`,
          status: (Number(hydrationRecord?.water_glasses) || 0) >= 8
            ? TASK_STATUS.DONE
            : (Number(hydrationRecord?.water_glasses) || 0) > 0
              ? TASK_STATUS.PROGRESS
              : TASK_STATUS.TODO,
        },
        ...(mealRecords?.almuerzo
          ? [{
              label: 'Sin TV en almuerzo',
              status: mealRecords.almuerzo.watched_tv ? TASK_STATUS.FAILED : TASK_STATUS.DONE,
            }]
          : []),
      ],
    },
    {
      id: 'movement',
      time: '18:00',
      title: 'Movimiento',
      color: '#22C55E',
      tasks: [
        {
          label: 'Ejercicio',
          status: movementRecord?.did_exercise ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
        {
          label: 'Caminata después del almuerzo',
          status: movementRecord?.walk_after_lunch ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'study',
      time: '20:00',
      title: 'Estudio',
      color: '#3B82F6',
      tasks: [
        {
          label: 'Estudiar',
          status: studyRecord?.did_study ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
        {
          label: 'Espacio limpio',
          status: studyRecord?.clean_space ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'cleaning',
      time: '18:30',
      title: 'Orden',
      color: '#EAB308',
      tasks: [
        {
          label: 'Cuarto ordenado',
          status: cleaningRecord?.room_clean || cleaningRecord?.space_ordered ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'household',
      time: '20:30',
      title: 'Hogar',
      color: '#14B8A6',
      tasks: householdTasks.length > 0
        ? householdTasks
        : [{ label: 'Sin tareas asignadas hoy', status: TASK_STATUS.DONE }],
    },
    {
      id: 'coexistence',
      time: '21:00',
      title: 'Convivencia',
      color: '#EC4899',
      tasks: [
        {
          label: 'Respetar cosas ajenas',
          status: coexistenceRecord
            ? (coexistenceRecord.took_others_things ? TASK_STATUS.FAILED : TASK_STATUS.DONE)
            : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'phone',
      time: DEVICE_CURFEW,
      title: 'Rutina del celular',
      color: '#6366F1',
      tasks: [
        {
          label: 'Entrega del celular',
          status: hasValue(sleepRecord?.device_delivered_at) ? TASK_STATUS.DONE : TASK_STATUS.TODO,
        },
        {
          label: 'No usar en la cama',
          status: phoneActivityStarted
            ? (sleepRecord?.device_in_bed ? TASK_STATUS.FAILED : TASK_STATUS.DONE)
            : TASK_STATUS.TODO,
        },
        {
          label: 'No usar en el baño',
          status: phoneActivityStarted
            ? (sleepRecord?.device_in_bathroom ? TASK_STATUS.FAILED : TASK_STATUS.DONE)
            : TASK_STATUS.TODO,
        },
      ],
    },
    {
      id: 'night',
      time: SLEEP_TARGET,
      title: 'Rutina de noche',
      color: '#6366F1',
      tasks: [
        {
          label: 'Dormir a tiempo',
          status:
            sleepRecord?.slept_by_11 === true || sleepRecord?.asleep_at_11 === true
              ? TASK_STATUS.DONE
              : hasValue(sleepRecord?.sleep_time)
                ? TASK_STATUS.FAILED
                : TASK_STATUS.TODO,
        },
      ],
    },
  ]

  const modulesWithStatus = modules.map((module) => {
    const moduleStatus = getModuleStatus(module.tasks)

    return {
      ...module,
      moduleStatus,
      isUpcoming: isUpcoming(module.time, moduleStatus),
      isOverdue: isOverdue(module.time, moduleStatus),
    }
  })

  return (
    <Card>
      <Header>
        <Title>Tu día</Title>
        <CurrentTime>{now.format('hh:mm A')}</CurrentTime>
      </Header>

      <TimelineContainer>
        {modulesWithStatus.map((module, index) => {
          const isLast = index === modulesWithStatus.length - 1

          return (
            <TimelineItem
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LeftCol>
                <TimeText
                  $moduleStatus={module.moduleStatus}
                  $isUpcoming={module.isUpcoming}
                  $isOverdue={module.isOverdue}
                >
                  {module.time}
                </TimeText>
              </LeftCol>

              <CenterCol>
                <NodeWrapper>
                  <IconNode
                    $moduleStatus={module.moduleStatus}
                    $isUpcoming={module.isUpcoming}
                    $isOverdue={module.isOverdue}
                    $color={module.color}
                  >
                    {module.moduleStatus === 'completed' ? (
                      <BsCheckCircleFill />
                    ) : module.isUpcoming ? (
                      <BsClock />
                    ) : (
                      <BsCircleFill size={12} />
                    )}
                  </IconNode>
                </NodeWrapper>

                {!isLast && (
                  <Line
                    $moduleStatus={module.moduleStatus}
                    $isUpcoming={module.isUpcoming}
                    $isOverdue={module.isOverdue}
                    $color={module.color}
                  />
                )}
              </CenterCol>

              <RightCol>
                <ModuleHeader>
                  <EventTitle
                    $moduleStatus={module.moduleStatus}
                    $isUpcoming={module.isUpcoming}
                    $isOverdue={module.isOverdue}
                  >
                    {module.title}
                  </EventTitle>
                  <ModuleBadge $moduleStatus={module.moduleStatus} $color={module.color}>
                    {module.moduleStatus === 'completed'
                      ? 'Listo'
                      : module.moduleStatus === 'in_progress'
                        ? 'En progreso'
                        : 'Pendiente'}
                  </ModuleBadge>
                </ModuleHeader>

                <TaskList>
                  {module.tasks.map((task) => (
                    <TaskItem key={`${module.id}-${task.label}`}>
                      <TaskIcon $status={task.status}>
                        {task.status === TASK_STATUS.DONE ? (
                          <BsCheckCircleFill size={13} />
                        ) : task.status === TASK_STATUS.PROGRESS ? (
                          <BsClock size={13} />
                        ) : task.status === TASK_STATUS.FAILED ? (
                          <BsXCircleFill size={13} />
                        ) : (
                          <BsDashCircleFill size={13} />
                        )}
                      </TaskIcon>
                      <TaskLabel $status={task.status}>{task.label}</TaskLabel>
                    </TaskItem>
                  ))}
                </TaskList>
              </RightCol>
            </TimelineItem>
          )
        })}
      </TimelineContainer>
    </Card>
  )
}

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
  min-height: 82px;
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
  color: ${({ $moduleStatus, $isUpcoming, $isOverdue, theme }) => {
    if ($moduleStatus === 'completed') return theme.colors.textPrimary
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    if ($moduleStatus === 'in_progress') return '#F59E0B'
    return theme.colors.textSecondary
  }};
  opacity: 0.9;
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
  color: ${({ $moduleStatus, $isUpcoming, $isOverdue, $color, theme }) => {
    if ($moduleStatus === 'completed') return $color
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    if ($moduleStatus === 'in_progress') return $color
    return theme.colors.border
  }};
  font-size: ${({ $moduleStatus, $isUpcoming }) => {
    if ($isUpcoming) return '24px'
    if ($moduleStatus === 'completed') return '20px'
    return '12px'
  }};
  transition: all 0.3s ease;
  animation: ${({ $isUpcoming }) => ($isUpcoming ? pulse : 'none')} 2s ease-in-out infinite;
`

const Line = styled.div`
  width: 2px;
  flex-grow: 1;
  background: ${({ $moduleStatus, $isUpcoming, $isOverdue, $color, theme }) => {
    if ($moduleStatus === 'completed') return `${$color}66`
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    if ($moduleStatus === 'in_progress') return `${$color}40`
    return theme.colors.border
  }};
  margin-top: -4px;
  margin-bottom: -4px;
  transition: background 0.3s ease;
`

const RightCol = styled.div`
  flex-grow: 1;
  padding-left: 12px;
  padding-top: 0;
  padding-bottom: 24px;
`

const ModuleHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const EventTitle = styled.h4`
  font-size: 14px;
  font-weight: 800;
  margin: 0;
  color: ${({ $moduleStatus, $isUpcoming, $isOverdue, theme }) => {
    if ($isUpcoming) return theme.colors.primary
    if ($isOverdue) return theme.colors.danger
    if ($moduleStatus === 'completed' || $moduleStatus === 'in_progress') return theme.colors.textPrimary
    return theme.colors.textSecondary
  }};
`

const ModuleBadge = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ $moduleStatus, $color, theme }) => {
    if ($moduleStatus === 'completed') return `${$color}16`
    if ($moduleStatus === 'in_progress') return `${$color}12`
    return theme.colors.background
  }};
  color: ${({ $moduleStatus, $color, theme }) => {
    if ($moduleStatus === 'completed' || $moduleStatus === 'in_progress') return $color
    return theme.colors.textSecondary
  }};
  border: 1px solid ${({ $moduleStatus, $color, theme }) => {
    if ($moduleStatus === 'completed') return `${$color}44`
    if ($moduleStatus === 'in_progress') return `${$color}33`
    return theme.colors.border
  }};
`

const TaskList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TaskIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $status, theme }) => {
    if ($status === TASK_STATUS.DONE) return theme.colors.success
    if ($status === TASK_STATUS.PROGRESS) return theme.colors.primary
    if ($status === TASK_STATUS.FAILED) return theme.colors.danger
    return theme.colors.border
  }};
  flex-shrink: 0;
`

const TaskLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $status, theme }) => {
    if ($status === TASK_STATUS.DONE) return theme.colors.textPrimary
    if ($status === TASK_STATUS.PROGRESS) return theme.colors.textPrimary
    if ($status === TASK_STATUS.FAILED) return theme.colors.danger
    return theme.colors.textSecondary
  }};
  text-decoration: ${({ $status }) => ($status === TASK_STATUS.DONE ? 'line-through' : 'none')};
  opacity: ${({ $status }) => ($status === TASK_STATUS.DONE ? 0.75 : 1)};
`
