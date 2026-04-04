import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsLightningChargeFill } from 'react-icons/bs'
import useMovementModule from '../../hooks/useMovementModule'
import {
  MOVEMENT_ACTIVE_BREAK_MINUTES,
  MIN_EXERCISE_MINUTES,
  MOVEMENT_FOCUS_MINUTES,
  MIN_WALK_AFTER_LUNCH_MINUTES,
  MOVEMENT_EXERCISE_FULL_POINTS,
  MOVEMENT_SITTING_BREAK_POINTS,
  MOVEMENT_WALK_POINTS,
} from '../../constants/habits.constants'
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';
import { getModuleTimeRules } from '../../utils/time-based-rules.utils'
import { TimeBasedBanner } from '../ui/TimeBasedBanner'
import { ModuleBlockedScreen } from '../ui/ModuleBlockedScreen'

const MODULE_COLOR = '#22C55E'
const EXERCISE_TYPES = ['Caminata', 'Trote', 'Pesas', 'Yoga', 'Bici', 'Otro']
const ALARM_AUDIO_PATH = '/sounds/alarma.mp3'

export default function MovementModule() {
  // ========== REGLAS DE TIEMPO ==========
  const timeRules = getModuleTimeRules('movement')
  
  // Si está completamente fuera de horario, mostrar pantalla de bloqueo
  if (timeRules.isOutOfHours) {
    return (
      <ModuleBlockedScreen
        moduleName="Movimiento y salud física"
        availableHours={timeRules.availableHours}
        icon={<BsLightningChargeFill />}
        accentColor={MODULE_COLOR}
      />
    )
  }
  
  const {
    movementRecord,
    isLoading,
    hasRecord,
    saveMovement,
    isSaving,
    saveTimerSession,
    syncTimerSession,
  } = useMovementModule()
  const [timerPhase, setTimerPhase] = useState('focus')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(MOVEMENT_FOCUS_MINUTES * 60)
  const [activeSessionEndsAt, setActiveSessionEndsAt] = useState(null)
  const [alarmKind, setAlarmKind] = useState(null)
  const alarmAudioRef = useRef(null)
  const lastSyncedSessionRef = useRef(null)
  const localSessionRef = useRef({
    active: false,
    phase: 'idle',
    endsAt: null,
  })

  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
      defaultValues: {
        did_exercise: false,
        exercise_type: '',
        exercise_minutes: 0,
        exercise_notes: '',
        walk_after_lunch: false,
        walk_minutes: 0,
        sitting_breaks: 0,
      },
  })

  // Watch para resumen en tiempo real
  const didExercise = watch('did_exercise')
  const exerciseMinutes = watch('exercise_minutes')
  const walkAfterLunch = watch('walk_after_lunch')
  const walkMinutes = watch('walk_minutes')
  const sittingBreaks = watch('sitting_breaks')

  // Cargar valores iniciales desde movementRecord
  useEffect(() => {
    if (movementRecord) {
      const sessionPhase = movementRecord.sitting_session_phase || 'idle'
      const sessionRunning = !!movementRecord.sitting_session_running
      const sessionEndsAt = movementRecord.sitting_session_ends_at || null

      // Mientras exista una sesión local activa, ignoramos refetches viejos
      // que todavía no reflejan el estado recién iniciado en la DB.
      if (
        localSessionRef.current.active &&
        !(
          sessionRunning &&
          sessionPhase === localSessionRef.current.phase &&
          sessionEndsAt === localSessionRef.current.endsAt
        ) &&
        sessionPhase !== 'break_ready'
      ) {
        return
      }

      reset({
        did_exercise: movementRecord.did_exercise || false,
        exercise_type: movementRecord.exercise_type || '',
        exercise_minutes: movementRecord.exercise_minutes || 0,
        exercise_notes: movementRecord.exercise_notes || '',
        walk_after_lunch: movementRecord.walk_after_lunch || false,
        walk_minutes: movementRecord.walk_minutes || 0,
        sitting_breaks: movementRecord.sitting_breaks || 0,
      })

      const endsAtDate = sessionEndsAt ? new Date(sessionEndsAt) : null
      const hasValidEnd = endsAtDate && !Number.isNaN(endsAtDate.getTime())

      setIsTimerRunning(false)

      if (sessionRunning && hasValidEnd && endsAtDate > new Date()) {
        const secondsLeft = Math.max(Math.ceil((endsAtDate.getTime() - Date.now()) / 1000), 1)
        setTimerPhase(sessionPhase === 'break' ? 'break' : 'focus')
        setIsTimerRunning(true)
        setRemainingSeconds(secondsLeft)
        setActiveSessionEndsAt(sessionEndsAt)
        localSessionRef.current = {
          active: true,
          phase: sessionPhase,
          endsAt: sessionEndsAt,
        }
      } else if (sessionPhase === 'break_ready') {
        setTimerPhase('break')
        setRemainingSeconds(MOVEMENT_ACTIVE_BREAK_MINUTES * 60)
        setActiveSessionEndsAt(null)
        localSessionRef.current = {
          active: false,
          phase: 'break_ready',
          endsAt: null,
        }
      } else {
        setTimerPhase('focus')
        setRemainingSeconds(MOVEMENT_FOCUS_MINUTES * 60)
        setActiveSessionEndsAt(null)
        localSessionRef.current = {
          active: false,
          phase: sessionPhase,
          endsAt: null,
        }
      }

    }
  }, [movementRecord, reset])

  useEffect(() => {
    if (!movementRecord?.id) return

    const sessionPhase = movementRecord.sitting_session_phase || 'idle'
    const sessionRunning = !!movementRecord.sitting_session_running
    const sessionEndsAt = movementRecord.sitting_session_ends_at
    const syncKey = `${movementRecord.id}:${sessionPhase}:${sessionRunning}:${sessionEndsAt || 'null'}:${movementRecord.sitting_breaks || 0}`

    if (lastSyncedSessionRef.current === syncKey) return
    lastSyncedSessionRef.current = syncKey

    if (!sessionRunning || !sessionEndsAt) return

    const endsAtDate = new Date(sessionEndsAt)
    if (Number.isNaN(endsAtDate.getTime()) || endsAtDate > new Date()) return

    syncTimerSession().catch(() => {})
  }, [
    movementRecord?.id,
    movementRecord?.sitting_session_phase,
    movementRecord?.sitting_session_running,
    movementRecord?.sitting_session_ends_at,
    movementRecord?.sitting_breaks,
    syncTimerSession,
  ])

  useEffect(() => {
    if (!isTimerRunning || !activeSessionEndsAt) return undefined

    const ringAlarm = () => {
      if (!alarmAudioRef.current && typeof Audio !== 'undefined') {
        alarmAudioRef.current = new Audio(ALARM_AUDIO_PATH)
        alarmAudioRef.current.loop = true
      }

      if (alarmAudioRef.current) {
        alarmAudioRef.current.currentTime = 0
        alarmAudioRef.current.play().catch(() => {})
      }
    }

    const advanceTimer = () => {
      const endsAtMs = new Date(activeSessionEndsAt).getTime()
      if (Number.isNaN(endsAtMs)) {
        setIsTimerRunning(false)
        setActiveSessionEndsAt(null)
        return
      }

      const secondsLeft = Math.max(Math.ceil((endsAtMs - Date.now()) / 1000), 0)

      if (secondsLeft > 0) {
        setRemainingSeconds(secondsLeft)
        return
      }

      setIsTimerRunning(false)
      setActiveSessionEndsAt(null)

      if (timerPhase === 'focus') {
        ringAlarm()
        setAlarmKind('focus')
        setTimerPhase('break')
        setRemainingSeconds(MOVEMENT_ACTIVE_BREAK_MINUTES * 60)
        localSessionRef.current = {
          active: false,
          phase: 'break_ready',
          endsAt: null,
        }
        saveTimerSession({
          sitting_breaks: Number(sittingBreaks) || 0,
          sitting_session_phase: 'break_ready',
          sitting_session_running: false,
          sitting_session_ends_at: null,
        }).catch(() => {})
        return
      }

      ringAlarm()
      setAlarmKind('break')
      const nextRounds = (Number(sittingBreaks) || 0) + 1
      setValue('sitting_breaks', nextRounds, { shouldDirty: true })
      setTimerPhase('focus')
      setRemainingSeconds(MOVEMENT_FOCUS_MINUTES * 60)
      localSessionRef.current = {
        active: false,
        phase: 'idle',
        endsAt: null,
      }
      saveTimerSession({
        sitting_breaks: nextRounds,
        sitting_session_phase: 'idle',
        sitting_session_running: false,
        sitting_session_ends_at: null,
      }).catch(() => {})
    }

    const handleVisibilitySync = () => {
      advanceTimer()
    }

    advanceTimer()
    const intervalId = window.setInterval(advanceTimer, 1000)
    window.addEventListener('focus', handleVisibilitySync)
    document.addEventListener('visibilitychange', handleVisibilitySync)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleVisibilitySync)
      document.removeEventListener('visibilitychange', handleVisibilitySync)
    }
  }, [activeSessionEndsAt, isTimerRunning, setValue, sittingBreaks, timerPhase])

  // Calcular puntos en tiempo real
  const calculateExercisePoints = () => {
    if (!didExercise) return 0
    if (exerciseMinutes >= MIN_EXERCISE_MINUTES) return MOVEMENT_EXERCISE_FULL_POINTS
    return Math.round((exerciseMinutes / MIN_EXERCISE_MINUTES) * MOVEMENT_EXERCISE_FULL_POINTS)
  }

  const calculateWalkPoints = () => {
    return walkAfterLunch && walkMinutes >= MIN_WALK_AFTER_LUNCH_MINUTES ? MOVEMENT_WALK_POINTS : 0
  }

  const exercisePoints = calculateExercisePoints()
  const walkPoints = calculateWalkPoints()
  const completedRounds = Number(sittingBreaks) || 0
  const sittingBreakPoints = completedRounds * MOVEMENT_SITTING_BREAK_POINTS
  const totalPoints = exercisePoints + walkPoints + sittingBreakPoints

  const timerCompleted = completedRounds > 0
  const canStartBreak = timerPhase === 'break'
  const activeDurationMinutes =
    timerPhase === 'focus' ? MOVEMENT_FOCUS_MINUTES : MOVEMENT_ACTIVE_BREAK_MINUTES
  const timerProgress = timerCompleted
    ? 100
    : Math.round(((activeDurationMinutes * 60 - remainingSeconds) / (activeDurationMinutes * 60)) * 100)
  const formattedTime = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
    remainingSeconds % 60
  ).padStart(2, '0')}`

  const handleStartTimer = () => {
    if (timerPhase === 'break' && !canStartBreak) return
    const durationSeconds =
      timerPhase === 'focus'
        ? MOVEMENT_FOCUS_MINUTES * 60
        : MOVEMENT_ACTIVE_BREAK_MINUTES * 60
    const endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString()
    const sessionPhase = timerPhase === 'focus' ? 'focus' : 'break'

    localSessionRef.current = {
      active: true,
      phase: sessionPhase,
      endsAt,
    }

    saveTimerSession({
      sitting_breaks: Number(sittingBreaks) || 0,
      sitting_session_phase: sessionPhase,
      sitting_session_running: true,
      sitting_session_ends_at: endsAt,
    }).catch(() => {})
    setIsTimerRunning(true)
    setActiveSessionEndsAt(endsAt)
    setRemainingSeconds(durationSeconds)
  }

  const handleResetTimer = () => {
    setIsTimerRunning(false)
    setTimerPhase('focus')
    setRemainingSeconds(MOVEMENT_FOCUS_MINUTES * 60)
    setActiveSessionEndsAt(null)
    setValue('sitting_breaks', 0, { shouldDirty: true })
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0
    }
    setAlarmKind(null)
    localSessionRef.current = {
      active: false,
      phase: 'idle',
      endsAt: null,
    }
    saveTimerSession({
      sitting_breaks: 0,
      sitting_session_phase: 'idle',
      sitting_session_running: false,
      sitting_session_ends_at: null,
    }).catch(() => {})
  }

  const handleStopAlarm = () => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause()
      alarmAudioRef.current.currentTime = 0
    }
    setAlarmKind(null)
  }

  useEffect(() => {
    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current.currentTime = 0
      }
    }
  }, [])

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      exercise_type: data.exercise_type || null,
      exercise_notes: data.exercise_notes || null,
      exercise_minutes: Number(data.exercise_minutes) || 0,
      walk_minutes: Number(data.walk_minutes) || 0,
      sitting_breaks: Number(data.sitting_breaks) || 0,
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
      {/* Banner de tiempo */}
      {timeRules.bannerType === 'suggested' && (
        <TimeBasedBanner type="suggested" badge={timeRules.badge} />
      )}
      
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
                  <Hint>Meta: {MIN_EXERCISE_MINUTES} minutos para puntaje completo</Hint>
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

        {/* SECCIÓN 2: Bloque de postura */}
        <Section>
          <SectionTitle>🪑 No estar sentado más de 1 hora seguida</SectionTitle>

          <TimerCard $isComplete={timerCompleted}>
            <TimerNav>
              <TimerTab
                type="button"
                $isActive={timerPhase === 'focus'}
                disabled={isTimerRunning}
                onClick={() => {
                  setTimerPhase('focus')
                  setRemainingSeconds(MOVEMENT_FOCUS_MINUTES * 60)
                }}
              >
                1 hora
              </TimerTab>
              <TimerTab
                type="button"
                $isActive={timerPhase === 'break'}
                disabled={!canStartBreak && !timerCompleted}
                onClick={() => {
                  if (!canStartBreak && !timerCompleted) return
                  setTimerPhase('break')
                  setRemainingSeconds(MOVEMENT_ACTIVE_BREAK_MINUTES * 60)
                }}
              >
                15 minutos
              </TimerTab>
            </TimerNav>

            <TimerClock $isComplete={timerCompleted}>{formattedTime}</TimerClock>
            <Hint>
              {timerPhase === 'focus'
                  ? 'Primero completa la hora. Luego se desbloquean los 15 minutos de movimiento.'
                  : 'Ahora sí: completa los 15 minutos de movimiento para ganar el punto.'}
            </Hint>
            <RoundsBadge>
              Rondas completas: {completedRounds} · +{sittingBreakPoints} pts
            </RoundsBadge>
            {alarmKind && (
              <AlarmBanner>
                <span>
                  {alarmKind === 'focus'
                    ? 'La hora terminó. Inicia los 15 minutos.'
                    : 'Los 15 minutos terminaron. Puedes guardar o empezar otra ronda.'}
                </span>
                <AlarmButton
                  type="button"
                  onClick={handleStopAlarm}
                  whileTap={{ scale: 0.96 }}
                >
                  Apagar sonido
                </AlarmButton>
              </AlarmBanner>
            )}

            <ProgressBarContainer>
              <ProgressBar
                $progress={Math.min(Math.max(timerProgress, 0), 100)}
                $isComplete={timerCompleted}
              />
            </ProgressBarContainer>

            <TimerActions>
              <TimerButton
                type="button"
                onClick={handleStartTimer}
                disabled={isTimerRunning || (timerPhase === 'break' && !canStartBreak)}
                whileTap={{ scale: 0.96 }}
              >
                {timerPhase === 'focus' ? 'Iniciar 1 hora' : 'Iniciar 15 min'}
              </TimerButton>
              <TimerButton
                type="button"
                $secondary
                onClick={handleResetTimer}
                disabled={isTimerRunning || (!timerCompleted && timerPhase === 'focus' && remainingSeconds === MOVEMENT_FOCUS_MINUTES * 60)}
                whileTap={{ scale: 0.96 }}
              >
                Reiniciar
              </TimerButton>
            </TimerActions>
          </TimerCard>
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
                  {walkAfterLunch && walkMinutes >= MIN_WALK_AFTER_LUNCH_MINUTES && <Badge>+{MOVEMENT_WALK_POINTS} pts</Badge>}
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
                    min={MIN_WALK_AFTER_LUNCH_MINUTES}
                    max="120"
                    {...register('walk_minutes')}
                  />
                  <Hint>
                    Registra al menos {MIN_WALK_AFTER_LUNCH_MINUTES} minuto para sumar puntos.
                  </Hint>
                </FormGroup>
              </WalkDetails>
            )}
          </AnimatePresence>
        </Section>

        {/* RESUMEN DE PUNTOS (sticky) */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Ejercicio', points: exercisePoints, color: '#22C55E' },
            { label: 'Postura', points: sittingBreakPoints, color: '#22C55E' },
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

const TimerCard = styled.div`
  background: ${({ $isComplete, theme }) =>
    $isComplete ? 'rgba(34, 197, 94, 0.12)' : theme.colors.surface};
  border: 2px solid ${({ $isComplete, theme }) => ($isComplete ? '#22C55E' : theme.colors.border)};
  border-radius: 16px;
  padding: 16px;
`

const TimerNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const TimerTab = styled.button`
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 700;
  background: ${({ $isActive, theme }) => ($isActive ? '#22C55E' : theme.colors.background)};
  color: ${({ $isActive, theme }) => ($isActive ? '#FFFFFF' : theme.colors.textSecondary)};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`

const TimerClock = styled.div`
  font-size: 36px;
  font-weight: 900;
  color: ${({ $isComplete }) => ($isComplete ? '#22C55E' : '#111827')};
  text-align: center;
  margin-bottom: 12px;
`

const TimerActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`

const RoundsBadge = styled.div`
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: #22C55E;
`

const AlarmBanner = styled.div`
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.35);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  font-weight: 700;
  color: #C2410C;
`

const AlarmButton = styled(motion.button)`
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 800;
  background: #F97316;
  color: #FFFFFF;
  cursor: pointer;
  white-space: nowrap;
`

const TimerButton = styled(motion.button)`
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 800;
  background: ${({ $secondary, theme }) => ($secondary ? theme.colors.background : '#22C55E')};
  color: ${({ $secondary, theme }) => ($secondary ? theme.colors.textPrimary : '#FFFFFF')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
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

const FooterSpacer = styled.div`
  height: 140px;
`
