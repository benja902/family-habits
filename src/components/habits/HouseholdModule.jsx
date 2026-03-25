import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCheck2Square, BsHouseDoorFill, BsClockHistory } from 'react-icons/bs'
import useHouseholdModule from '../../hooks/useHouseholdModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
const MODULE_COLOR = '#14B8A6' // Amarillo oscuro / Marrón (theme.HABIT_COLORS.household)

export default function HouseholdModule() {
  const { householdData, isLoading, hasRecord, saveHousehold, isSaving } = useHouseholdModule()
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
    points: formValues[asg.task_id] ? 80 : 0,
    color: MODULE_COLOR
  }))

  const totalPoints = pointsSummary.reduce((sum, item) => sum + item.points, 0)

  // Estado vacío: si no tiene tareas asignadas
  if (assignments.length === 0) {
    return (
      <Container>
        <EmptyStateContainer>
          <EmptyIcon><BsHouseDoorFill /></EmptyIcon>
          <EmptyTitle>¡Día libre de limpieza!</EmptyTitle>
          <EmptyText>No tienes tareas del hogar asignadas para hoy.</EmptyText>
        </EmptyStateContainer>
      </Container>
    )
  }

  return (
    <Container>
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
        <SectionSubtitle>Marca las que ya completaste.</SectionSubtitle>

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
                {isCompleted && <Badge>+80 pts</Badge>}
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
        <FooterSpacer />
      </Form>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar tareas"
        color={MODULE_COLOR}
        icon={<BsCheck2Square />}
      />
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
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `