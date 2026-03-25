import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsBookFill } from 'react-icons/bs'
import useStudyModule from '../../hooks/useStudyModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import { MIN_STUDY_MINUTES } from '../../constants/habits.constants'

const MODULE_COLOR = '#3B82F6' // theme.HABIT_COLORS.study
const STUDY_TOPICS = ['UNHEVAL / CEPREVAL', 'Inglés', 'Programación / IA', 'Proyectos Univ.', 'Otro']

export default function StudyModule() {
  const { studyRecord, isLoading, hasRecord, saveStudy, isSaving } = useStudyModule()

  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
    defaultValues: {
      did_study: false,
      study_minutes: 0,
      topic: '',
      active_practice: false,
      distraction_free: false,
      notes: '',
    },
  })

  useEffect(() => {
    if (studyRecord) {
      reset({
        did_study: true,
        study_minutes: studyRecord.study_minutes || 0,
        topic: studyRecord.topic || '',
        active_practice: studyRecord.active_practice || false,
        distraction_free: studyRecord.distraction_free || false,
        notes: studyRecord.notes || '',
      })
    }
  }, [studyRecord, reset])

  const formValues = watch()

  const calculatePoints = () => {
    let basePts = 0
    if (formValues.study_minutes > 0) {
      basePts = Math.min(100, Math.round((formValues.study_minutes / MIN_STUDY_MINUTES) * 100))
    }
    const practicePts = formValues.active_practice ? 40 : 0
    const focusPts = formValues.distraction_free ? 30 : 0

    return { basePts, practicePts, focusPts, total: basePts + practicePts + focusPts }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    if (!data.did_study) return

    const cleanData = {
      ...data,
      study_minutes: Number(data.study_minutes) || 0,
      topic: data.topic || null,
      notes: data.notes || null,
    }
    saveStudy(cleanData)
  }

  if (isLoading) return <LoadingText>Cargando información...</LoadingText>

  return (
    <Container>
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            ✓ Ya registraste tu estudio hoy — puedes editar
          </Banner>
        )}
      </AnimatePresence>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <ToggleCard $isActive={formValues.did_study} $color={MODULE_COLOR}>
          <ToggleLabel>¿Estudiaste o leíste hoy?</ToggleLabel>
          <ToggleSwitch
            type="button"
            $isActive={formValues.did_study}
            $color={MODULE_COLOR}
            onClick={() => setValue('did_study', !formValues.did_study)}
          >
            <ToggleThumb $isActive={formValues.did_study} />
          </ToggleSwitch>
        </ToggleCard>

        <AnimatePresence>
          {formValues.did_study && (
            <DetailsContainer
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <Label>Minutos dedicados</Label>
                <Input type="number" min="1" max="600" {...register('study_minutes')} />
                
                <ProgressBarContainer>
                  <ProgressBar
                    $progress={Math.min((formValues.study_minutes / MIN_STUDY_MINUTES) * 100, 100)}
                    $isComplete={formValues.study_minutes >= MIN_STUDY_MINUTES}
                  />
                </ProgressBarContainer>
                <ProgressText $isComplete={formValues.study_minutes >= MIN_STUDY_MINUTES}>
                  {formValues.study_minutes >= MIN_STUDY_MINUTES
                    ? `¡Meta de ${MIN_STUDY_MINUTES} min cumplida! (+100 pts)`
                    : `${formValues.study_minutes || 0} / ${MIN_STUDY_MINUTES} min`}
                </ProgressText>
              </Card>

              <Card>
                <Label>¿Qué tema estudiaste?</Label>
                <Controller
                  name="topic"
                  control={control}
                  render={({ field }) => (
                    <ChipsContainer>
                      {STUDY_TOPICS.map((topic) => (
                        <Chip
                          key={topic}
                          type="button"
                          $isActive={field.value === topic}
                          onClick={() => field.onChange(topic)}
                        >
                          {topic}
                        </Chip>
                      ))}
                    </ChipsContainer>
                  )}
                />
              </Card>

              <ToggleCard $isActive={formValues.active_practice} $color="#22C55E">
                <ToggleLabel>
                  ¿Estudio Activo? (Código, simulacro, resumen)
                  {formValues.active_practice && <Badge $color="#22C55E">+40 pts</Badge>}
                </ToggleLabel>
                <ToggleSwitch type="button" $isActive={formValues.active_practice} $color="#22C55E" onClick={() => setValue('active_practice', !formValues.active_practice)}>
                  <ToggleThumb $isActive={formValues.active_practice} />
                </ToggleSwitch>
              </ToggleCard>

              <ToggleCard $isActive={formValues.distraction_free} $color="#8B5CF6">
                <ToggleLabel>
                  Ambiente sin distracciones (Celular lejos)
                  {formValues.distraction_free && <Badge $color="#8B5CF6">+30 pts</Badge>}
                </ToggleLabel>
                <ToggleSwitch type="button" $isActive={formValues.distraction_free} $color="#8B5CF6" onClick={() => setValue('distraction_free', !formValues.distraction_free)}>
                  <ToggleThumb $isActive={formValues.distraction_free} />
                </ToggleSwitch>
              </ToggleCard>

              <Card>
                <Label>Detalles de la sesión (opcional)</Label>
                <Textarea
                  rows="2"
                  placeholder="Ej: Simulacro UNHEVAL, práctica de present perfect, modelo YOLOv8..."
                  {...register('notes')}
                />
              </Card>

            </DetailsContainer>
          )}
        </AnimatePresence>

        {formValues.did_study && (
          <>
            <PointsSummaryCard
              pointsSummary={[
                { label: 'Tiempo Base', points: points.basePts, color: MODULE_COLOR },
                { label: 'Práctica Activa', points: points.practicePts, color: '#22C55E' },
                { label: 'Enfoque Total', points: points.focusPts, color: '#8B5CF6' },
              ]}
              totalPoints={points.total}
              accentColor={MODULE_COLOR}
            />
            <FooterSpacer />
          </>
        )}
      </Form>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar estudio"
        color={MODULE_COLOR}
        icon={<BsBookFill />}
      />
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div` padding-bottom: 80px; `
const Form = styled.form` padding: 16px; `
const DetailsContainer = styled(motion.div)` overflow: hidden; `
const Banner = styled(motion.div)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`
const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 12px;
`
const ToggleCard = styled.div`
  background: ${({ $isActive, $color, theme }) => $isActive ? `${$color}15` : theme.colors.surface};
  border: 2px solid ${({ $isActive, $color, theme }) => $isActive ? $color : theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  transition: all 0.25s ease;
`
const ToggleLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const Badge = styled.span`
  background: ${({ $color }) => $color};
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  width: fit-content;
`
const ToggleSwitch = styled(motion.button)`
  width: 52px;
  height: 28px;
  background: ${({ $isActive, $color, theme }) => ($isActive ? $color : theme.colors.border)};
  border-radius: 14px;
  border: none;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
`
const ToggleThumb = styled.div`
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: ${({ $isActive }) => ($isActive ? '28px' : '4px')};
  transition: left 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`
const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  &:focus { outline: none; border-color: ${MODULE_COLOR}; }
`
const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  &:focus { outline: none; border-color: ${MODULE_COLOR}; }
`
const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const Chip = styled.button`
  background: ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.surface};
  color: ${({ $isActive, theme }) => $isActive ? 'white' : theme.colors.textSecondary};
  border: 2px solid ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.border};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
`
const ProgressBar = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $isComplete }) => ($isComplete ? '#22C55E' : MODULE_COLOR)};
  transition: width 0.3s ease, background 0.3s ease;
`
const ProgressText = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isComplete, theme }) => ($isComplete ? '#22C55E' : theme.colors.textSecondary)};
  text-align: center;
  margin-top: 8px;
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `