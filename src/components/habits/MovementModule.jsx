import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCupFill } from 'react-icons/bs'
import useMovementModule from '../../hooks/useMovementModule'
import { MIN_EXERCISE_MINUTES } from '../../constants/habits.constants'
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';



const EXERCISE_TYPES = ['Caminata', 'Trote', 'Pesas', 'Yoga', 'Bici', 'Otro']

export default function MovementModule() {
  const { movementRecord, isLoading, hasRecord, saveMovement, isSaving } = useMovementModule()

  const { register, handleSubmit, watch, control, reset } = useForm({
    defaultValues: {
      did_exercise: false,
      exercise_type: '',
      exercise_minutes: 0,
      exercise_notes: '',
      water_glasses: 0,
      walk_after_lunch: false,
      walk_minutes: 0,
    },
  })

  // Cargar valores iniciales desde movementRecord
  useEffect(() => {
    if (movementRecord) {
      reset({
        did_exercise: movementRecord.did_exercise || false,
        exercise_type: movementRecord.exercise_type || '',
        exercise_minutes: movementRecord.exercise_minutes || 0,
        exercise_notes: movementRecord.exercise_notes || '',
        water_glasses: movementRecord.water_glasses || 0,
        walk_after_lunch: movementRecord.walk_after_lunch || false,
        walk_minutes: movementRecord.walk_minutes || 0,
      })
    }
  }, [movementRecord, reset])

  // Watch para resumen en tiempo real
  const didExercise = watch('did_exercise')
  const exerciseMinutes = watch('exercise_minutes')
  const waterGlasses = watch('water_glasses')
  const walkAfterLunch = watch('walk_after_lunch')
  const walkMinutes = watch('walk_minutes')

  // Calcular puntos en tiempo real
  const calculateExercisePoints = () => {
    if (!didExercise) return 0
    if (exerciseMinutes >= MIN_EXERCISE_MINUTES) return 100
    return Math.round((exerciseMinutes / MIN_EXERCISE_MINUTES) * 100)
  }

  const calculateWaterPoints = () => {
    return Math.round((waterGlasses / 8) * 100)
  }

  const calculateWalkPoints = () => {
    return walkAfterLunch && walkMinutes > 0 ? 50 : 0
  }

  const exercisePoints = calculateExercisePoints()
  const waterPoints = calculateWaterPoints()
  const walkPoints = calculateWalkPoints()
  const totalPoints = exercisePoints + waterPoints + walkPoints

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      exercise_type: data.exercise_type || null,
      exercise_notes: data.exercise_notes || null,
      exercise_minutes: Number(data.exercise_minutes) || 0,
      water_glasses: Number(data.water_glasses) || 0,
      walk_minutes: Number(data.walk_minutes) || 0,
    }
    saveMovement(cleanData)
  }

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <p>Cargando...</p>
      </LoadingContainer>
    )
  }

  return (
    <Container>
      {hasRecord && (
        <Banner
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          ✓ Ya registraste tu movimiento hoy
        </Banner>
      )}

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* SECCIÓN 1: Ejercicio */}
        <Section>
          <SectionTitle>⚡ Ejercicio</SectionTitle>

          <Controller
            name="did_exercise"
            control={control}
            render={({ field }) => (
              <ToggleCard $isActive={field.value}>
                <ToggleLabel>¿Hiciste ejercicio hoy?</ToggleLabel>
                <ToggleSwitch
                  type="button"
                  $isActive={field.value}
                  onClick={() => field.onChange(!field.value)}
                  whileTap={{ scale: 0.95 }}
                >
                  <ToggleThumb $isActive={field.value} />
                </ToggleSwitch>
              </ToggleCard>
            )}
          />

          <AnimatePresence>
            {didExercise && (
              <ExerciseDetails
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Selector de tipo */}
                <FormGroup>
                  <Label>Tipo de ejercicio</Label>
                  <Controller
                    name="exercise_type"
                    control={control}
                    render={({ field }) => (
                      <ChipsContainer>
                        {EXERCISE_TYPES.map((type) => (
                          <Chip
                            key={type}
                            type="button"
                            $isActive={field.value === type}
                            onClick={() => field.onChange(type)}
                            whileTap={{ scale: 0.95 }}
                          >
                            {type}
                          </Chip>
                        ))}
                      </ChipsContainer>
                    )}
                  />
                </FormGroup>

                {/* Duración */}
                <FormGroup>
                  <Label>Duración (minutos)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="300"
                    {...register('exercise_minutes')}
                  />
                  <Hint>Meta: 20 minutos para puntaje completo</Hint>
                  <ProgressBarContainer>
                    <ProgressBar
                      $progress={Math.min((exerciseMinutes / MIN_EXERCISE_MINUTES) * 100, 100)}
                      $isComplete={exerciseMinutes >= MIN_EXERCISE_MINUTES}
                    />
                  </ProgressBarContainer>
                  <ProgressText $isComplete={exerciseMinutes >= MIN_EXERCISE_MINUTES}>
                    {exerciseMinutes >= MIN_EXERCISE_MINUTES
                      ? `¡Meta cumplida! +${exercisePoints} pts`
                      : `${exerciseMinutes} / ${MIN_EXERCISE_MINUTES} min`}
                  </ProgressText>
                </FormGroup>

                {/* Notas */}
                <FormGroup>
                  <Label>Nota de progreso (opcional)</Label>
                  <Textarea
                    rows="2"
                    placeholder="Ej: subí 5 repeticiones, corrí sin parar..."
                    {...register('exercise_notes')}
                  />
                </FormGroup>
              </ExerciseDetails>
            )}
          </AnimatePresence>
        </Section>

        {/* SECCIÓN 2: Hidratación */}
        <Section>
          <SectionTitle>💧 Hidratación</SectionTitle>

          <FormGroup>
            <Controller
              name="water_glasses"
              control={control}
              render={({ field }) => (
                <>
                  <GlassesContainer>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                      <GlassButton
                        key={glass}
                        type="button"
                        onClick={() => field.onChange(glass)}
                        whileTap={{ scale: 0.85 }}
                      >
                        <BsCupFill
                          size={32}
                          color={field.value >= glass ? '#3B82F6' : '#E2E8F0'}
                        />
                      </GlassButton>
                    ))}
                  </GlassesContainer>
                  <WaterText $isComplete={field.value >= 8}>
                    {field.value >= 8
                      ? '¡Meta cumplida! 💧'
                      : `${field.value} / 8 vasos`}
                  </WaterText>
                </>
              )}
            />
          </FormGroup>
        </Section>

        {/* SECCIÓN 3: Movimiento */}
        <Section>
          <SectionTitle>🚶 Movimiento</SectionTitle>

          <Controller
            name="walk_after_lunch"
            control={control}
            render={({ field }) => (
              <ToggleCard $isActive={field.value}>
                <ToggleLabel>
                  ¿Caminaste después del almuerzo?
                  {field.value && <Badge>+50 pts</Badge>}
                </ToggleLabel>
                <ToggleSwitch
                  type="button"
                  $isActive={field.value}
                  onClick={() => field.onChange(!field.value)}
                  whileTap={{ scale: 0.95 }}
                >
                  <ToggleThumb $isActive={field.value} />
                </ToggleSwitch>
              </ToggleCard>
            )}
          />

          <AnimatePresence>
            {walkAfterLunch && (
              <WalkDetails
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FormGroup>
                  <Label>Minutos de caminata</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    {...register('walk_minutes')}
                  />
                </FormGroup>
              </WalkDetails>
            )}
          </AnimatePresence>
        </Section>

        {/* RESUMEN DE PUNTOS (sticky) */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Ejercicio', points: exercisePoints, color: '#22C55E' },
            { label: 'Agua', points: waterPoints, color: '#3B82F6' },
            { label: 'Caminata', points: walkPoints, color: '#22C55E' },
          ]}
          totalPoints={totalPoints}
          accentColor="#22C55E"
        />

        {/* Espaciado para el footer fijo */}
        <FooterSpacer />
      </Form>

      {/* BOTÓN GUARDAR (fixed) */}
      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar movimiento"
        color="#22C55E"
      />
    </Container>
  )
}

// Styled Components

const Container = styled.div`
  padding-bottom: 80px;
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: #22C55E;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const Banner = styled(motion.div)`
  background: #22C55E;
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`

const Form = styled.form`
  padding: 16px;
`

const Section = styled.div`
  margin-bottom: 32px;
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 16px;
`
const ToggleCard = styled.div`
  background: ${({ $isActive, theme }) => ($isActive ? 'rgba(34, 197, 94, 0.15)' : theme.colors.surface)};
  border: 2px solid ${({ $isActive, theme }) => ($isActive ? '#22C55E' : theme.colors.border)};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.25s ease;
  margin-bottom: 16px;
`

const ToggleLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`

const Badge = styled.span`
  background: #22C55E;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
`

const ToggleSwitch = styled(motion.button)`
  width: 56px;
  height: 32px;
  background: ${({ $isActive, theme }) => ($isActive ? '#22C55E' : theme.colors.border)};
  border-radius: 16px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.25s ease;
`
const ToggleThumb = styled.div`
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: ${({ $isActive }) => ($isActive ? '28px' : '4px')};
  transition: left 0.25s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const ExerciseDetails = styled(motion.div)`
  overflow: hidden;
`

const WalkDetails = styled(motion.div)`
  overflow: hidden;
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`

const ChipsContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #E2E8F0;
    border-radius: 2px;
  }
`

const Chip = styled(motion.button)`
  background: ${({ $isActive, theme }) => ($isActive ? '#22C55E' : theme.colors.surface)};
  color: ${({ $isActive, theme }) => ($isActive ? 'white' : theme.colors.textSecondary)};
  border: 2px solid ${({ $isActive, theme }) => ($isActive ? '#22C55E' : theme.colors.border)};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface}; /* <-- Fondo corregido */

  &:focus {
    outline: none;
    border-color: #22C55E;
  }
`

const Hint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  text-align: center;
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
`

const ProgressBar = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ $isComplete }) => ($isComplete ? '#22C55E' : '#F59E0B')};
  transition: all 0.3s ease;
`

const ProgressText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $isComplete }) => ($isComplete ? '#22C55E' : '#F59E0B')};
  text-align: center;
  margin-top: 8px;
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface}; /* <-- Fondo corregido */

  &:focus {
    outline: none;
    border-color: #22C55E;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

const GlassesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const GlassButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
`

const WaterText = styled.p`
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isComplete }) => ($isComplete ? '#22C55E' : '#64748B')};
`

const FooterSpacer = styled.div`
  height: 140px;
`
