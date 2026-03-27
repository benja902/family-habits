import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsBookFill, BsDash, BsPlus } from 'react-icons/bs'
import useStudyModule from '../../hooks/useStudyModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import { calculateProportional } from '../../utils/points.utils'
import {
  MIN_STUDY_MINUTES,
  STUDY_CLEAN_SPACE_POINTS,
  STUDY_FULL_POINTS,
  STUDY_NOTE_MIN_CHARS,
  STUDY_NOTE_POINTS,
} from '../../constants/habits.constants'

const MODULE_COLOR = '#3B82F6' // theme.HABIT_COLORS.study
const ACTIVITY_TYPES = ['Lectura', 'Video', 'Práctica', 'Escritura', 'Otro']

export default function StudyModule() {
  const { studyRecord, isLoading, hasRecord, saveStudy, isSaving } = useStudyModule()

  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
    defaultValues: {
      did_study: false,
      subject: '',
      activity_type: '',
      duration_minutes: 0,
      sessions_count: 0,
      learning_note: '',
      clean_space: false,
    },
  })

  useEffect(() => {
    if (studyRecord) {
      reset({
        did_study: studyRecord.did_study || false,
        subject: studyRecord.subject || '',
        activity_type: studyRecord.activity_type || '',
        duration_minutes: studyRecord.duration_minutes || 0,
        sessions_count: studyRecord.sessions_count || 0,
        learning_note: studyRecord.learning_note || '',
        clean_space: studyRecord.clean_space || false,
      })
    }
  }, [studyRecord, reset])

  const formValues = watch()

  // Calcular puntos en tiempo real para el resumen
  const calculatePoints = () => {
    let studyPts = 0
    if (formValues.did_study && formValues.duration_minutes > 0) {
      studyPts = formValues.duration_minutes >= MIN_STUDY_MINUTES
        ? STUDY_FULL_POINTS
        : calculateProportional(formValues.duration_minutes, MIN_STUDY_MINUTES, STUDY_FULL_POINTS)
    }
    
    const notePts = (formValues.learning_note && formValues.learning_note.length > STUDY_NOTE_MIN_CHARS)
      ? STUDY_NOTE_POINTS
      : 0
    const spacePts = formValues.clean_space ? STUDY_CLEAN_SPACE_POINTS : 0

    return { studyPts, notePts, spacePts, total: studyPts + notePts + spacePts }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      subject: data.subject || null,
      activity_type: data.activity_type || null,
      learning_note: data.learning_note || null,
      duration_minutes: Number(data.duration_minutes) || 0,
      sessions_count: Number(data.sessions_count) || 0,
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
            ✓ Ya registraste tu estudio hoy
          </Banner>
        )}
      </AnimatePresence>

      <Form onSubmit={handleSubmit(onSubmit)}>
        
        {/* ==================== SECCIÓN 1: SESIÓN ==================== */}
        <SectionTitle>📚 Sesión de estudio</SectionTitle>

        <ToggleCard $isActive={formValues.did_study} $color={MODULE_COLOR}>
          <ToggleLabel>¿Estudiaste hoy?</ToggleLabel>
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
              
              {/* Tema y Actividad */}
              <Card>
                <Label>Tema o materia</Label>
                <Input 
                  type="text" 
                  placeholder="Ej: Biblia, inglés, programación..." 
                  {...register('subject')} 
                  style={{ marginBottom: 16 }}
                />

                <Label>Tipo de actividad</Label>
                <Controller
                  name="activity_type"
                  control={control}
                  render={({ field }) => (
                    <ChipsContainer>
                      {ACTIVITY_TYPES.map((type) => (
                        <Chip
                          key={type}
                          type="button"
                          $isActive={field.value === type}
                          onClick={() => field.onChange(type)}
                        >
                          {type}
                        </Chip>
                      ))}
                    </ChipsContainer>
                  )}
                />
              </Card>

              {/* Duración */}
              <Card>
                <Label>Duración total</Label>
                <CounterContainer>
                  <LargeCounterBtn type="button" onClick={() => setValue('duration_minutes', Math.max(0, formValues.duration_minutes - 5))}>
                    -5 min
                  </LargeCounterBtn>
                  <CounterValueLg>{formValues.duration_minutes} min</CounterValueLg>
                  <LargeCounterBtn type="button" onClick={() => setValue('duration_minutes', formValues.duration_minutes + 5)}>
                    +5 min
                  </LargeCounterBtn>
                </CounterContainer>

                <ProgressBarContainer>
                  <ProgressBar
                    $progress={Math.min((formValues.duration_minutes / MIN_STUDY_MINUTES) * 100, 100)}
                    $isComplete={formValues.duration_minutes >= MIN_STUDY_MINUTES}
                  />
                </ProgressBarContainer>
                <ProgressText $isComplete={formValues.duration_minutes >= MIN_STUDY_MINUTES}>
                  {formValues.duration_minutes >= MIN_STUDY_MINUTES
                    ? `¡Meta cumplida! +${STUDY_FULL_POINTS} pts`
                    : `${formValues.duration_minutes} / ${MIN_STUDY_MINUTES} min`}
                </ProgressText>
              </Card>

              {/* Sesiones */}
              <Card>
                <Label>Número de sesiones</Label>
                <CounterContainer style={{ justifyContent: 'center' }}>
                  <SmallCounterBtn type="button" onClick={() => setValue('sessions_count', Math.max(0, formValues.sessions_count - 1))}>
                    <BsDash />
                  </SmallCounterBtn>
                  <CounterValue>{formValues.sessions_count} sesión(es)</CounterValue>
                  <SmallCounterBtn type="button" onClick={() => setValue('sessions_count', formValues.sessions_count + 1)}>
                    <BsPlus />
                  </SmallCounterBtn>
                </CounterContainer>
              </Card>

              {/* ==================== SECCIÓN 2: APRENDIZAJE ==================== */}
              <SectionTitle>💡 ¿Qué aprendiste hoy?</SectionTitle>
              <Card>
                <Textarea
                  rows="4"
                  placeholder="Escribe algo que aprendiste o entendiste hoy..."
                  {...register('learning_note')}
                />
                <CharCountContainer>
                  <CharCount>{formValues.learning_note?.length || 0} caracteres</CharCount>
                  {(formValues.learning_note?.length || 0) > STUDY_NOTE_MIN_CHARS ? (
                    <Badge $color={MODULE_COLOR}>+{STUDY_NOTE_POINTS} pts</Badge>
                  ) : (
                    <Hint style={{ margin: 0 }}>Mínimo {STUDY_NOTE_MIN_CHARS} caracteres para ganar puntos</Hint>
                  )}
                </CharCountContainer>
              </Card>

              {/* ==================== SECCIÓN 3: CONDICIONES ==================== */}
              <SectionTitle>✨ Condiciones</SectionTitle>
              <ToggleCard $isActive={formValues.clean_space} $color={MODULE_COLOR}>
                <ToggleLabel>
                  ¿Estudiaste en un espacio limpio y ordenado?
                  {formValues.clean_space && (
                    <Badge $color={MODULE_COLOR} style={{ marginTop: 4 }}>
                      +{STUDY_CLEAN_SPACE_POINTS} pts
                    </Badge>
                  )}
                </ToggleLabel>
                <ToggleSwitch type="button" $isActive={formValues.clean_space} $color={MODULE_COLOR} onClick={() => setValue('clean_space', !formValues.clean_space)}>
                  <ToggleThumb $isActive={formValues.clean_space} />
                </ToggleSwitch>
              </ToggleCard>

            </DetailsContainer>
          )}
        </AnimatePresence>

        {/* ==================== RESUMEN DE PUNTOS ==================== */}
        {formValues.did_study && (
          <>
            <PointsSummaryCard
              pointsSummary={[
                { label: 'Estudio', points: points.studyPts, color: MODULE_COLOR },
                { label: 'Aprendizaje', points: points.notePts, color: MODULE_COLOR },
                { label: 'Espacio limpio', points: points.spacePts, color: MODULE_COLOR },
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
  background: ${({ theme }) => theme.colors.info};
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`
const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 24px 0 16px 0;
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
const Hint = styled.p` font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px; `
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
  font-size: 15px;
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
const CharCountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`
const CharCount = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const Chip = styled.button`
  background: ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.surface};
  color: ${({ $isActive, theme }) => $isActive ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.border};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`
const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`
const LargeCounterBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: 700;
  color: ${MODULE_COLOR};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  &:active { transform: scale(0.95); }
`
const SmallCounterBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${MODULE_COLOR};
  cursor: pointer;
  &:active { transform: scale(0.95); }
`
const CounterValueLg = styled.span`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const CounterValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 16px;
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
  background: ${({ $isComplete, theme }) => ($isComplete ? MODULE_COLOR : theme.colors.warning)};
  transition: width 0.3s ease, background 0.3s ease;
`
const ProgressText = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isComplete, theme }) => ($isComplete ? MODULE_COLOR : theme.colors.textSecondary)};
  text-align: center;
  margin-top: 8px;
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `
