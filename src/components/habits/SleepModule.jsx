/**
 * Módulo de descanso y dispositivos
 * Formulario para registrar hábitos de sueño y uso de dispositivos
 */

import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import useSleepModule from '../../hooks/useSleepModule';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsArrowClockwise,
  BsCheckCircleFill,
  BsClockFill,
  BsExclamationTriangleFill,
  BsMoonStarsFill,
  BsPencilSquare,
} from 'react-icons/bs';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { DEVICE_CURFEW, SLEEP_TARGET, WAKE_TARGET } from '../../constants/habits.constants';
import { getCurrentTimeString, isBeforeCurrentTime, isFutureTime } from '../../utils/dates.utils';
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';

const MODULE_COLOR = theme.HABIT_COLORS.sleep;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-bottom: 120px;
`;

const Banner = styled(motion.div)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FormContent = styled.form`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ToggleCard = styled.div`
  background: ${({ $bgColor, theme }) => $bgColor || theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ToggleLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 32px;

    &:before {
      position: absolute;
      content: '';
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: ${MODULE_COLOR};
  }

  input:checked + .slider:before {
    transform: translateX(24px);
  }
`;

const Badge = styled.span`
  background: ${({ $color, theme }) => $color || theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  white-space: nowrap;
`;

const TimeInputWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const TimeInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const TimeInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};

  &:focus {
    outline: none;
    border-color: ${MODULE_COLOR};
  }
`;

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Indicator = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $color, theme }) => $color || theme.colors.success};
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Textarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  resize: none;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${MODULE_COLOR};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ $active, $activeColor, theme }) => (
    $active ? ($activeColor || theme.colors.primary) : theme.colors.border
  )};
  background: ${({ $active, $activeColor, theme }) => (
    $active ? `${$activeColor || theme.colors.primary}15` : theme.colors.surface
  )};
  color: ${({ $active, $activeColor, theme }) => (
    $active ? ($activeColor || theme.colors.primary) : theme.colors.textPrimary
  )};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: fit-content;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
`;

const SummaryChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SummaryChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: -4px 0 ${({ theme }) => theme.spacing.sm};
`;

const TransitionBanner = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const TransitionTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TransitionText = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ==================== COMPONENTE ====================

export default function SleepModule() {
  const [showManualDeviceTime, setShowManualDeviceTime] = useState(false);
  const [showManualWakeTime, setShowManualWakeTime] = useState(false);
  const { sleepRecord, isLoading, hasRecord, saveSleep, isSaving } = useSleepModule();
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      device_delivered: false,
      device_delivered_at: '',
      device_delivered_at_source: null,
      device_in_bathroom: false,
      device_in_bed: false,
      sleep_time: '',
      slept_by_11: false,
      wake_time: '',
      wake_time_source: null,
      notes: '',
    },
  });

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (sleepRecord) {
      reset({
        device_delivered: sleepRecord.device_delivered || false,
        device_delivered_at: sleepRecord.device_delivered_at || '',
        device_delivered_at_source: sleepRecord.device_delivered_at_source || null,
        device_in_bathroom: sleepRecord.device_in_bathroom || false,
        device_in_bed: sleepRecord.device_in_bed || false,
        sleep_time: sleepRecord.sleep_time || '',
        slept_by_11: sleepRecord.slept_by_11 || false,
        wake_time: sleepRecord.wake_time || '',
        wake_time_source: sleepRecord.wake_time_source || null,
        notes: sleepRecord.notes || '',
      });
      setShowManualDeviceTime(!sleepRecord.device_delivered_at_source || sleepRecord.device_delivered_at_source === 'manual');
      setShowManualWakeTime(!sleepRecord.wake_time_source || sleepRecord.wake_time_source === 'manual');
    }
  }, [sleepRecord, reset]);

  // Observar cambios en el formulario para calcular puntos
  const formValues = watch();
  const currentTime = getCurrentTimeString();

  // Calcular puntos en tiempo real
  const calculatePoints = () => {
    let devicePoints = 0;
    let sleepPoints = 0;

    // 1. Entrega de celular
    if (formValues.device_delivered && formValues.device_delivered_at) {
      devicePoints += formValues.device_delivered_at <= DEVICE_CURFEW ? 20 : -10;
    }

    // 2. Penalizaciones de dispositivos
    if (formValues.device_in_bathroom) {
      devicePoints -= 25;
    }
    if (formValues.device_in_bed) {
      devicePoints -= 25;
    }

    // 3. Rutina de noche
    if (formValues.slept_by_11) {
      sleepPoints += 25;
    }

    // 4. Rutina de mañana
    if (formValues.wake_time && formValues.wake_time <= WAKE_TARGET) {
      sleepPoints += 25;
    } else if (formValues.wake_time && formValues.wake_time > WAKE_TARGET) {
      sleepPoints -= 15;
    }

    return { devicePoints, sleepPoints, total: devicePoints + sleepPoints };
  };

  const points = calculatePoints();
  const isDeviceCurrentMode = formValues.device_delivered_at_source === 'current_time' && !!formValues.device_delivered_at;
  const isWakeCurrentMode = formValues.wake_time_source === 'current_time' && !!formValues.wake_time;

  const setCurrentTimeForField = (fieldName, sourceField) => {
    const now = getCurrentTimeString();
    clearErrors(fieldName);
    setValue(fieldName, now, { shouldDirty: true, shouldValidate: true });
    setValue(sourceField, 'current_time', { shouldDirty: true });

    if (fieldName === 'device_delivered_at') {
      setShowManualDeviceTime(false);
    }

    if (fieldName === 'wake_time') {
      setShowManualWakeTime(false);
    }
  };

  const toggleManualTimeInput = (fieldName) => {
    if (fieldName === 'device_delivered_at') {
      setShowManualDeviceTime((value) => !value);
      clearErrors('device_delivered_at');
      return;
    }

    setShowManualWakeTime((value) => !value);
    clearErrors('wake_time');
  };

  const handleManualTimeChange = (fieldName, sourceField, value, errorMessage) => {
    setValue(fieldName, value, { shouldDirty: true, shouldValidate: true });
    setValue(sourceField, value ? 'manual' : null, { shouldDirty: true });

    if (!value) {
      clearErrors(fieldName);
      return;
    }

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError(fieldName, { type: 'manual', message: errorMessage });
      return;
    }

    clearErrors(fieldName);
  };

  const validateClockControlledTime = (fieldName, value, source, errorMessage) => {
    if (!value || source !== 'manual') return false;

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError(fieldName, {
        type: 'manual',
        message: errorMessage,
      });
      return true;
    }

    clearErrors(fieldName);
    return false;
  };

  const getDeviceTimeFeedback = () => {
    if (!formValues.device_delivered_at) return null;

    if (errors.device_delivered_at) {
      return {
        color: theme.colors.danger,
        mode: formValues.device_delivered_at_source === 'current_time' ? 'Ahora' : 'Manual',
        status: 'Inválida',
        points: null,
      };
    }

    const pointsEarned = formValues.device_delivered_at <= DEVICE_CURFEW ? 20 : -10;
    const isOnTime = formValues.device_delivered_at <= DEVICE_CURFEW;

    return {
      color: isOnTime ? theme.colors.success : theme.colors.warning,
      mode: formValues.device_delivered_at_source === 'current_time' ? 'Ahora' : 'Manual',
      status: isOnTime ? 'A tiempo' : 'Tarde',
      points: `${pointsEarned > 0 ? '+' : ''}${pointsEarned} pts`,
    };
  };

  const getWakeTimeFeedback = () => {
    if (!formValues.wake_time) return null;

    if (errors.wake_time) {
      return {
        color: theme.colors.danger,
        mode: formValues.wake_time_source === 'current_time' ? 'Ahora' : 'Manual',
        status: 'Inválida',
        points: null,
      };
    }

    const isOnTime = formValues.wake_time <= WAKE_TARGET;

    return {
      color: isOnTime ? theme.colors.success : theme.colors.warning,
      mode: formValues.wake_time_source === 'current_time' ? 'Ahora' : 'Manual',
      status: isOnTime ? 'A tiempo' : 'Tarde',
      points: isOnTime ? '+25 pts' : '-15 pts',
    };
  };

  const deviceTimeFeedback = getDeviceTimeFeedback();
  const wakeTimeFeedback = getWakeTimeFeedback();

  const onSubmit = (data) => {
    if (validateClockControlledTime(
      'device_delivered_at',
      data.device_delivered_at,
      data.device_delivered_at_source,
      'Si ingresas la hora manualmente, debe coincidir con la hora actual.'
    )) {
      return;
    }

    if (data.device_delivered_at && isFutureTime(data.device_delivered_at)) {
      setError('device_delivered_at', {
        type: 'manual',
        message: 'La hora de entrega no puede ser posterior a la hora actual.',
      });
      return;
    }

    if (validateClockControlledTime(
      'wake_time',
      data.wake_time,
      data.wake_time_source,
      'Si ingresas la hora manualmente, debe coincidir con la hora actual.'
    )) {
      return;
    }

    if (data.wake_time && isFutureTime(data.wake_time)) {
      setError('wake_time', {
        type: 'manual',
        message: 'La hora de levantarse no puede ser posterior a la hora actual.',
      });
      return;
    }

    const cleanedData = {
      ...data,
      device_delivered_at: data.device_delivered_at || null,
      device_delivered_at_source: data.device_delivered_at ? data.device_delivered_at_source || 'manual' : null,
      sleep_time: data.sleep_time || null,
      wake_time: data.wake_time || null,
      wake_time_source: data.wake_time ? data.wake_time_source || 'manual' : null,
    };

    saveSleep(cleanedData);
  };
  if (isLoading) {
    return (
      <Container>
        <FormContent>
          <p>Cargando...</p>
        </FormContent>
      </Container>
    );
  }

  return (
    <Container>
      {/* Banner si ya guardó hoy */}
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BsCheckCircleFill />
            Ya registraste tu rutina de hoy
          </Banner>
        )}
      </AnimatePresence>

      <FormContent onSubmit={handleSubmit(onSubmit)}>
        <TransitionBanner>
          <TransitionTitle>Transición de módulo</TransitionTitle>
          <TransitionText>
            Por ahora este módulo sigue guardándose como <strong>sleep</strong>, pero ya está organizado como rutina de mañana, uso del celular y rutina de noche.
          </TransitionText>
        </TransitionBanner>

        {/* ==================== SECCIÓN 1: MAÑANA ==================== */}
        <SectionTitle>🌅 Rutina de mañana</SectionTitle>
        <SectionDescription>
          Aquí registras cómo empezó tu día: levantarte a tiempo y tu primer bloque de rutina.
        </SectionDescription>

        {/* Campo 1: Hora en que te levantaste */}
        <FieldWrapper>
          <Label>Hora en que te levantaste</Label>
          <ActionRow>
            <ActionButton
              type="button"
              $active={isWakeCurrentMode && !showManualWakeTime}
              $activeColor={theme.colors.success}
              onClick={() => setCurrentTimeForField('wake_time', 'wake_time_source')}
            >
              <BsArrowClockwise />
              Registrar hora de ahora
            </ActionButton>
            <ActionButton
              type="button"
              $active={showManualWakeTime}
              $activeColor={theme.colors.warning}
              onClick={() => toggleManualTimeInput('wake_time')}
            >
              <BsPencilSquare />
              {showManualWakeTime ? 'Cancelar entrada manual' : 'Escribir hora manual'}
            </ActionButton>
          </ActionRow>
          <Controller
            name="wake_time"
            control={control}
            render={({ field }) => (
              <>
                {showManualWakeTime && (
                  <TimeInputRow>
                    <TimeInput
                      type="time"
                      min={currentTime}
                      max={currentTime}
                      value={field.value || ''}
                      onChange={(event) => handleManualTimeChange(
                        'wake_time',
                        'wake_time_source',
                        event.target.value,
                        'Debe coincidir con la hora actual.'
                      )}
                    />
                    {field.value && field.value <= WAKE_TARGET && (
                      <Indicator $color={theme.colors.success}>
                        <BsCheckCircleFill />
                      </Indicator>
                    )}
                  </TimeInputRow>
                )}
                {wakeTimeFeedback && (
                  <SummaryChips>
                    <SummaryChip $color={theme.colors.textSecondary}>
                      {wakeTimeFeedback.mode}
                    </SummaryChip>
                    <SummaryChip $color={wakeTimeFeedback.color}>
                      {wakeTimeFeedback.status}
                    </SummaryChip>
                    {wakeTimeFeedback.points && (
                      <SummaryChip $color={wakeTimeFeedback.color}>
                        {wakeTimeFeedback.points}
                      </SummaryChip>
                    )}
                  </SummaryChips>
                )}
                {errors.wake_time && <ErrorText>{errors.wake_time.message}</ErrorText>}
                <Hint>
                  <BsClockFill /> Meta: hasta las {WAKE_TARGET}
                </Hint>
                {showManualWakeTime && !errors.wake_time && (
                  <Hint>
                    Debe ser la hora exacta de ahora.
                  </Hint>
                )}
              </>
            )}
          />
        </FieldWrapper>

        {/* ==================== SECCIÓN 2: CELULAR ==================== */}
        <SectionTitle>📱 Uso del celular</SectionTitle>
        <SectionDescription>
          Esta sección junta lo que después se convertirá en el módulo de uso del celular.
        </SectionDescription>

        {/* Campo 1: ¿Entregaste tu celular? */}
        <Controller
          name="device_delivered"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${MODULE_COLOR}15`}>
              <ToggleRow>
                <ToggleLabel>¿Entregaste tu celular?</ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>

              {/* Campo 1b: Hora de entrega (condicional) */}
              <AnimatePresence>
                {field.value && (
                  <TimeInputWrapper
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Label>Hora de entrega</Label>
                    <ActionRow>
                      <ActionButton
                        type="button"
                        $active={isDeviceCurrentMode && !showManualDeviceTime}
                        $activeColor={theme.colors.success}
                        onClick={() => setCurrentTimeForField('device_delivered_at', 'device_delivered_at_source')}
                      >
                        <BsArrowClockwise />
                        Registrar hora de ahora
                      </ActionButton>
                      <ActionButton
                        type="button"
                        $active={showManualDeviceTime}
                        $activeColor={theme.colors.warning}
                        onClick={() => toggleManualTimeInput('device_delivered_at')}
                      >
                        <BsPencilSquare />
                        {showManualDeviceTime ? 'Cancelar entrada manual' : 'Escribir hora manual'}
                      </ActionButton>
                    </ActionRow>
                    <Controller
                      name="device_delivered_at"
                      control={control}
                      render={({ field: timeField }) => (
                        <>
                          {showManualDeviceTime && (
                            <TimeInputRow>
                              <TimeInput
                                type="time"
                                min={currentTime}
                                max={currentTime}
                                value={timeField.value || ''}
                                onChange={(event) => handleManualTimeChange(
                                  'device_delivered_at',
                                  'device_delivered_at_source',
                                  event.target.value,
                                  'Debe coincidir con la hora actual.'
                                )}
                              />
                              {timeField.value && (
                                <Indicator
                                  $color={
                                    timeField.value <= DEVICE_CURFEW
                                      ? theme.colors.success
                                      : theme.colors.warning
                                  }
                                >
                                  {timeField.value <= DEVICE_CURFEW ? (
                                    <BsCheckCircleFill />
                                  ) : (
                                    <BsExclamationTriangleFill />
                                  )}
                                </Indicator>
                              )}
                            </TimeInputRow>
                          )}
                          {deviceTimeFeedback && (
                            <SummaryChips>
                              <SummaryChip $color={theme.colors.textSecondary}>
                                {deviceTimeFeedback.mode}
                              </SummaryChip>
                              <SummaryChip $color={deviceTimeFeedback.color}>
                                {deviceTimeFeedback.status}
                              </SummaryChip>
                              {deviceTimeFeedback.points && (
                                <SummaryChip $color={deviceTimeFeedback.color}>
                                  {deviceTimeFeedback.points}
                                </SummaryChip>
                              )}
                            </SummaryChips>
                          )}
                          {errors.device_delivered_at && (
                            <ErrorText>{errors.device_delivered_at.message}</ErrorText>
                          )}
                          <Hint>
                            <BsClockFill /> Meta: antes de las {DEVICE_CURFEW}
                          </Hint>
                          {showManualDeviceTime && !errors.device_delivered_at && (
                            <Hint>
                              Debe ser la hora exacta de ahora.
                            </Hint>
                          )}
                        </>
                      )}
                    />
                  </TimeInputWrapper>
                )}
              </AnimatePresence>
            </ToggleCard>
          )}
        />

        {/* Campo 2: ¿Usaste el celular en el baño? */}
        <Controller
          name="device_in_bathroom"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${theme.colors.danger}15`}>
              <ToggleRow>
                <ToggleLabel>¿Usaste el celular en el baño?</ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>
              {field.value && <Badge $color={theme.colors.danger}>-25 pts</Badge>}
            </ToggleCard>
          )}
        />

        {/* Campo 3: ¿Usaste el celular en la cama? */}
        <Controller
          name="device_in_bed"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${theme.colors.danger}15`}>
              <ToggleRow>
                <ToggleLabel>¿Usaste el celular en la cama?</ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>
              {field.value && <Badge $color={theme.colors.danger}>-25 pts</Badge>}
            </ToggleCard>
          )}
        />

        {/* ==================== SECCIÓN 3: NOCHE ==================== */}
        <SectionTitle>🌙 Rutina de noche</SectionTitle>
        <SectionDescription>
          Aquí dejas lo relacionado con tu hora de dormir y el cierre del día.
        </SectionDescription>

        {/* Campo 4: Hora en que te dormiste */}
        <FieldWrapper>
          <Label>Hora en que te dormiste</Label>
          <Controller
            name="sleep_time"
            control={control}
            render={({ field }) => <TimeInput type="time" {...field} />}
          />
        </FieldWrapper>

        {/* Campo 5: ¿Te acostaste a tiempo? */}
        <Controller
          name="slept_by_11"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${theme.colors.success}15`}>
              <ToggleRow>
                <ToggleLabel>¿Te acostaste antes de las {SLEEP_TARGET}?</ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>
              {field.value && <Badge $color={theme.colors.success}>+25 pts</Badge>}
            </ToggleCard>
          )}
        />

        {/* ==================== SECCIÓN 3: NOTAS ==================== */}
        <SectionTitle>📝 Notas</SectionTitle>

        <FieldWrapper>
          <Label>Notas del día (opcional)</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Ej: dormí bien, me desperté descansado..."
              />
            )}
          />
        </FieldWrapper>

        {/* ==================== RESUMEN DE PUNTOS (sticky) ==================== */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Dispositivos', points: points.devicePoints, color: '#6366F1' },
            { label: 'Sueño', points: points.sleepPoints, color: '#6366F1' },
          ]}
          totalPoints={points.total}
          accentColor="#6366F1"
        />
      </FormContent>

      {/* ==================== BOTÓN GUARDAR (fixed) ==================== */}
      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar rutina"
        color="#6366F1"
        icon={<BsMoonStarsFill />}
      />
    </Container>
  );
}

export { SleepModule };
