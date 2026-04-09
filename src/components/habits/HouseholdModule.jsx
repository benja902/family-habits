import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCheck2Square, BsClockHistory, BsHouseDoorFill, BsHouseFill, BsPeopleFill } from 'react-icons/bs'
import useHouseholdModule from '../../hooks/useHouseholdModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import { HOUSEHOLD_TASK_POINTS } from '../../constants/habits.constants'
import { getModuleTimeRules } from '../../utils/time-based-rules.utils'
import { TimeBasedBanner } from '../ui/TimeBasedBanner'
import { ModuleBlockedScreen } from '../ui/ModuleBlockedScreen'

const MODULE_COLOR = '#14B8A6' // Amarillo oscuro / Marrón (theme.HABIT_COLORS.household)

const GENERAL_STATUS_META = {
  completed: {
    label: 'Completada',
    bg: '#DCFCE7',
    color: '#166534',
    border: '#86EFAC'
  },
  pending: {
    label: 'Aún no marcado',
    bg: '#FEF3C7',
    color: '#92400E',
    border: '#FCD34D'
  },
  unregistered: {
    label: 'Sin registrar',
    bg: '#E5E7EB',
    color: '#374151',
    border: '#D1D5DB'
  }
}

export default function HouseholdModule() {
  // ========== REGLAS DE TIEMPO ==========
  const timeRules = getModuleTimeRules('household')
  
  // Si está completamente fuera de horario, mostrar pantalla de bloqueo
  if (timeRules.isOutOfHours) {
    return (
      <ModuleBlockedScreen
        moduleName="Responsabilidades del hogar"
        availableHours={timeRules.availableHours}
        icon={<BsHouseFill />}
        accentColor={MODULE_COLOR}
      />
    )
  }
  
  const { householdData, generalSchedule, isLoading, hasRecord, saveHousehold, isSaving } = useHouseholdModule()
  const { assignments, completions } = householdData

  const { handleSubmit, watch, reset, setValue } = useForm()

  // Cargar valores dinámicos
  useEffect(() => {
    if (assignments.length > 0) {
      const defaultData = {}
      assignments.forEach((asg) => {
        // Buscar si ya completó esta tarea
        const completion = completions.find(c => c.task_id === asg.task_id)
        defaultData[asg.task_id] = completion ? completion.completed : false
      })
      reset(defaultData)
    }
  }, [assignments, completions, reset])

  const formValues = watch()

  const onSubmit = (data) => {
    // data es un objeto con keys = task_id, values = boolean
    saveHousehold(data)
  }

  if (isLoading) return <LoadingText>Cargando tareas asignadas...</LoadingText>

  // Generar resumen dinámico de puntos
  const pointsSummary = assignments.map(asg => ({
    label: asg.household_tasks.name,
    points: formValues[asg.task_id] ? HOUSEHOLD_TASK_POINTS : 0,
    color: MODULE_COLOR
  }))

  const totalPoints = pointsSummary.reduce((sum, item) => sum + item.points, 0)

  return (
    <Container>
      {/* Banner de tiempo */}
      {timeRules.bannerType === 'suggested' && (
        <TimeBasedBanner type="suggested" badge={timeRules.badge} />
      )}
      
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            ✓ Ya registraste tareas hoy
          </Banner>
        )}
      </AnimatePresence>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <SectionTitle>🏠 Tus tareas asignadas de hoy</SectionTitle>
        <SectionSubtitle>
          {assignments.length > 0
            ? 'Marca las que ya completaste.'
            : 'Hoy no te tocaron tareas, pero aquí abajo puedes revisar la distribución general del hogar.'}
        </SectionSubtitle>

        {assignments.length > 0 ? (
          <>
            {assignments.map((asg) => {
              const task = asg.household_tasks
              const isCompleted = formValues[asg.task_id]

              return (
                <LargeToggleCard
                  key={asg.task_id}
                  $isOn={isCompleted}
                  onClick={() => setValue(asg.task_id, !isCompleted)}
                  whileTap={{ scale: 0.97 }}
                  animate={{ scale: isCompleted ? [1, 1.03, 0.98, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <TextContent>
                    <CardTitle>{task.name}</CardTitle>
                    <CardDesc>{task.description}</CardDesc>
                    <MetaInfo $isOn={isCompleted}>
                      <BsClockHistory /> {task.estimated_minutes} min
                    </MetaInfo>
                  </TextContent>
                  <RightAction>
                    {isCompleted && <Badge>+{HOUSEHOLD_TASK_POINTS} pts</Badge>}
                    <ToggleSwitch $isOn={isCompleted}>
                      <ToggleThumb $isOn={isCompleted} />
                    </ToggleSwitch>
                  </RightAction>
                </LargeToggleCard>
              )
            })}

            <PointsSummaryCard
              pointsSummary={pointsSummary}
              totalPoints={totalPoints}
              accentColor={MODULE_COLOR}
            />
          </>
        ) : (
          <EmptyStateContainer>
            <EmptyIcon><BsHouseDoorFill /></EmptyIcon>
            <EmptyTitle>¡Día libre de limpieza!</EmptyTitle>
            <EmptyText>No tienes tareas del hogar asignadas para hoy.</EmptyText>
          </EmptyStateContainer>
        )}

        <GeneralScheduleSection>
          <GeneralScheduleHeader>
            <GeneralScheduleTitle>
              <BsPeopleFill />
              Horario general del hogar
            </GeneralScheduleTitle>
            <GeneralScheduleMeta>
              Vista completa de tareas asignadas para todos los usuarios activos.
            </GeneralScheduleMeta>
          </GeneralScheduleHeader>

          <FamilyScheduleGrid>
            {generalSchedule.map((user) => {
              const assignedMinutes = user.assignments.reduce(
                (sum, assignment) => sum + (assignment.household_tasks?.estimated_minutes || 0),
                0
              )
              const completedCount = user.assignments.filter(
                (assignment) => assignment.completionStatus === 'completed'
              ).length
              const progressPct = user.assignments.length > 0
                ? Math.round((completedCount / user.assignments.length) * 100)
                : 0
              const pendingMinutes = user.assignments
                .filter((assignment) => assignment.completionStatus !== 'completed')
                .reduce((sum, assignment) => sum + (assignment.household_tasks?.estimated_minutes || 0), 0)

              return (
                <FamilyScheduleCard key={user.id}>
                  <FamilyScheduleUserRow>
                    <AvatarCircle>
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                      ) : (
                        user.name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </AvatarCircle>
                    <div>
                      <FamilyScheduleUserName>{user.name}</FamilyScheduleUserName>
                      <FamilyScheduleUserMeta>
                        {user.assignments.length > 0
                          ? `${user.assignments.length} tarea${user.assignments.length === 1 ? '' : 's'} · ${assignedMinutes} min`
                          : 'Sin tareas asignadas hoy'}
                      </FamilyScheduleUserMeta>
                    </div>
                  </FamilyScheduleUserRow>

                  {user.assignments.length > 0 ? (
                    <>
                      <ProgressSummary>
                        <ProgressHeaderRow>
                          <ProgressText>
                            {completedCount} de {user.assignments.length} tareas completadas
                          </ProgressText>
                          <ProgressPercent>{progressPct}%</ProgressPercent>
                        </ProgressHeaderRow>
                        <ProgressBarTrack>
                          <ProgressBarFill style={{ width: `${progressPct}%` }} />
                        </ProgressBarTrack>
                        <ProgressHint>
                          {pendingMinutes > 0
                            ? `${pendingMinutes} min pendientes o sin registrar`
                            : 'Todo el bloque del día ya quedó registrado'}
                        </ProgressHint>
                      </ProgressSummary>

                      <GeneralTaskList>
                        {user.assignments.map((assignment) => {
                          const statusMeta = GENERAL_STATUS_META[assignment.completionStatus] || GENERAL_STATUS_META.unregistered

                          return (
                            <GeneralTaskItem key={`${user.id}-${assignment.task_id}`}>
                              <div>
                                <GeneralTaskHeader>
                                  <GeneralTaskName>{assignment.household_tasks?.name || 'Tarea del hogar'}</GeneralTaskName>
                                  <TaskStatusBadge
                                    $bg={statusMeta.bg}
                                    $color={statusMeta.color}
                                    $border={statusMeta.border}
                                  >
                                    {statusMeta.label}
                                  </TaskStatusBadge>
                                </GeneralTaskHeader>
                                {assignment.household_tasks?.description && (
                                  <GeneralTaskDescription>{assignment.household_tasks.description}</GeneralTaskDescription>
                                )}
                              </div>
                              <GeneralTaskMinutes>
                                <BsClockHistory />
                                {assignment.household_tasks?.estimated_minutes || 0} min
                              </GeneralTaskMinutes>
                            </GeneralTaskItem>
                          )
                        })}
                      </GeneralTaskList>
                    </>
                  ) : (
                    <NoTasksText>Hoy no tiene responsabilidades del hogar asignadas.</NoTasksText>
                  )}
                </FamilyScheduleCard>
              )
            })}
          </FamilyScheduleGrid>
        </GeneralScheduleSection>
        <FooterSpacer />
      </Form>

      {assignments.length > 0 && (
        <ModuleSaveButton
          onSave={handleSubmit(onSubmit)}
          isSaving={isSaving}
          label="Guardar tareas"
          color={MODULE_COLOR}
          icon={<BsCheck2Square />}
        />
      )}
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div` padding-bottom: 80px; min-height: 100vh; `
const Form = styled.form` padding: 24px 16px; display: flex; flex-direction: column; gap: 16px; `
const Banner = styled(motion.div)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`
const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: -8px;
  margin-bottom: 8px;
`
const LargeToggleCard = styled(motion.div)`
  padding: 16px 20px;
  background: ${({ $isOn, theme }) => ($isOn ? `${MODULE_COLOR}15` : theme.colors.surface)};
  border: ${({ $isOn, theme }) => ($isOn ? `2px solid ${MODULE_COLOR}` : `2px solid ${theme.colors.border}`)};
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.card};
  user-select: none;
  -webkit-tap-highlight-color: transparent;
`
const TextContent = styled.div` flex: 1; `
const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 4px 0;
`
const CardDesc = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 8px 0;
`
const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $isOn, theme }) => ($isOn ? MODULE_COLOR : theme.colors.textSecondary)};
`
const RightAction = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`
const Badge = styled.span`
  background: ${MODULE_COLOR};
  color: white;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
`
const ToggleSwitch = styled.div`
  width: 52px;
  height: 28px;
  background: ${({ $isOn, theme }) => ($isOn ? MODULE_COLOR : theme.colors.border)};
  border-radius: 14px;
  position: relative;
  transition: background 0.3s ease;
`
const ToggleThumb = styled.div`
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: ${({ $isOn }) => ($isOn ? '28px' : '4px')};
  transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  margin-top: 40px;
  text-align: center;
`
const EmptyIcon = styled.div`
  font-size: 64px;
  color: ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;
`
const EmptyTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
`
const EmptyText = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`
const GeneralScheduleSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
`
const GeneralScheduleHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const GeneralScheduleTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const GeneralScheduleMeta = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const FamilyScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
`
const FamilyScheduleCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
`
const FamilyScheduleUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`
const AvatarCircle = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${MODULE_COLOR}22;
  color: ${MODULE_COLOR};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  overflow: hidden;
  flex-shrink: 0;
`
const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
const FamilyScheduleUserName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const FamilyScheduleUserMeta = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ProgressSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const ProgressHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
const ProgressText = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const ProgressPercent = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${MODULE_COLOR};
`
const ProgressBarTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`
const ProgressBarFill = styled.div`
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, ${MODULE_COLOR} 0%, #34D399 100%);
  transition: width 0.3s ease;
`
const ProgressHint = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const GeneralTaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const GeneralTaskItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${MODULE_COLOR}10;
  border: 1px solid ${MODULE_COLOR}22;
`
const GeneralTaskHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`
const GeneralTaskName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const TaskStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
  white-space: nowrap;
`
const GeneralTaskDescription = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const GeneralTaskMinutes = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  color: ${MODULE_COLOR};
`
const NoTasksText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `
