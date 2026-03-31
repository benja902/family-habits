import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import {
  BsArrowClockwise,
  BsCheckCircleFill,
  BsClockFill,
  BsPencilSquare,
  BsSunFill,
} from 'react-icons/bs';
import { theme } from '../../styles/theme';
import { WAKE_TARGET } from '../../constants/habits.constants';
import { getCurrentTimeString, isBeforeCurrentTime, isFutureTime } from '../../utils/dates.utils';
import useMorningRoutineModule from '../../hooks/useMorningRoutineModule';
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';

const MODULE_COLOR = theme.HABIT_COLORS.sleep;

export default function MorningRoutineModule() {
  const [showManualWakeTime, setShowManualWakeTime] = useState(false);
  const { sleepRecord, cleaningRecord, isLoading, hasRecord, saveMorningRoutine, isSaving } =
    useMorningRoutineModule();

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
      bed_made: false,
      prayed_after_waking: true,
      wake_time: '',
      wake_time_source: null,
    },
  });

  useEffect(() => {
    reset({
      bed_made: cleaningRecord?.bed_made || false,
      prayed_after_waking: sleepRecord?.prayed_after_waking ?? true,
      wake_time: sleepRecord?.wake_time || '',
      wake_time_source: sleepRecord?.wake_time_source || null,
    });
    setShowManualWakeTime(!sleepRecord?.wake_time_source || sleepRecord.wake_time_source === 'manual');
  }, [cleaningRecord, sleepRecord, reset]);

  const formValues = watch();
  const currentTime = getCurrentTimeString();
  const isWakeCurrentMode = formValues.wake_time_source === 'current_time' && !!formValues.wake_time;

  const calculatePoints = () => {
    let morningPoints = 0;

    if (formValues.bed_made) {
      morningPoints += 15;
    }

    morningPoints += formValues.prayed_after_waking ? 10 : -5;

    if (formValues.wake_time && formValues.wake_time <= WAKE_TARGET) {
      morningPoints += 25;
    } else if (formValues.wake_time && formValues.wake_time > WAKE_TARGET) {
      morningPoints -= 15;
    }

    return {
      morningPoints,
      total: morningPoints,
    };
  };

  const points = calculatePoints();

  const setCurrentTimeForField = () => {
    const now = getCurrentTimeString();
    clearErrors('wake_time');
    setValue('wake_time', now, { shouldDirty: true, shouldValidate: true });
    setValue('wake_time_source', 'current_time', { shouldDirty: true });
    setShowManualWakeTime(false);
  };

  const toggleManualTimeInput = () => {
    setShowManualWakeTime((value) => !value);
    clearErrors('wake_time');
  };

  const handleManualTimeChange = (value) => {
    setValue('wake_time', value, { shouldDirty: true, shouldValidate: true });
    setValue('wake_time_source', value ? 'manual' : null, { shouldDirty: true });

    if (!value) {
      clearErrors('wake_time');
      return;
    }

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('wake_time', {
        type: 'manual',
        message: 'Debe coincidir con la hora actual.',
      });
      return;
    }

    clearErrors('wake_time');
  };

  const validateClockControlledTime = (value, source) => {
    if (!value || source !== 'manual') return false;

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('wake_time', {
        type: 'manual',
        message: 'Si ingresas la hora manualmente, debe coincidir con la hora actual.',
      });
      return true;
    }

    clearErrors('wake_time');
    return false;
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

  const wakeTimeFeedback = getWakeTimeFeedback();

  const onSubmit = (data) => {
    if (validateClockControlledTime(data.wake_time, data.wake_time_source)) {
      return;
    }

    if (data.wake_time && isFutureTime(data.wake_time)) {
      setError('wake_time', {
        type: 'manual',
        message: 'La hora de levantarse no puede ser posterior a la hora actual.',
      });
      return;
    }

    saveMorningRoutine({
      bed_made: !!data.bed_made,
      prayed_after_waking: !!data.prayed_after_waking,
      wake_time: data.wake_time || null,
      wake_time_source: data.wake_time ? data.wake_time_source || 'manual' : null,
    });
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
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BsCheckCircleFill />
            Ya registraste tu rutina de mañana de hoy
          </Banner>
        )}
      </AnimatePresence>

      <FormContent onSubmit={handleSubmit(onSubmit)}>
        <SectionTitle>🌅 Rutina de mañana</SectionTitle>
        <SectionDescription>
          Aquí registras cómo empezó tu día: tender la cama, levantarte a tiempo y orar al despertar.
        </SectionDescription>

        <MorningHabitCard $isActive={formValues.bed_made}>
          <ToggleLabel>¿Tendiste la cama antes de empezar el día?</ToggleLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {formValues.bed_made && <Badge $color={theme.colors.success}>+15 pts</Badge>}
            <Switch>
              <input
                type="checkbox"
                checked={formValues.bed_made}
                onChange={(event) => setValue('bed_made', event.target.checked)}
              />
              <span className="slider"></span>
            </Switch>
          </div>
        </MorningHabitCard>

        <Controller
          name="prayed_after_waking"
          control={control}
          render={({ field }) => (
            <MorningHabitCard $isActive={field.value}>
              <ToggleLabel>
                Oré al menos 5 minutos al despertar
                <br />
                <Hint style={{ margin: 0 }}>Si no oraste, apaga este switch.</Hint>
              </ToggleLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge $color={field.value ? theme.colors.success : theme.colors.danger}>
                  {field.value ? '+10 pts' : '-5 pts'}
                </Badge>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  <span className="slider"></span>
                </Switch>
              </div>
            </MorningHabitCard>
          )}
        />

        <FieldWrapper>
          <Label>Hora en que te levantaste</Label>
          <ActionRow>
            <ActionButton
              type="button"
              $active={isWakeCurrentMode && !showManualWakeTime}
              $activeColor={theme.colors.success}
              onClick={setCurrentTimeForField}
            >
              <BsArrowClockwise />
              Registrar hora de ahora
            </ActionButton>
            <ActionButton
              type="button"
              $active={showManualWakeTime}
              $activeColor={theme.colors.warning}
              onClick={toggleManualTimeInput}
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
                      onChange={(event) => handleManualTimeChange(event.target.value)}
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
                  <Hint>Debe ser la hora exacta de ahora.</Hint>
                )}
              </>
            )}
          />
        </FieldWrapper>

        <PointsSummaryCard
          pointsSummary={[
            { label: 'Rutina de mañana', points: points.morningPoints, color: '#6366F1' },
          ]}
          totalPoints={points.total}
          accentColor="#6366F1"
        />
      </FormContent>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar rutina de mañana"
        color="#6366F1"
        icon={<BsSunFill />}
      />
    </Container>
  );
}

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
  margin: ${({ theme }) => theme.spacing.md} 0 0;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: -8px 0 0;
`;

const MorningHabitCard = styled.div`
  background: ${({ $isActive, theme }) => ($isActive ? `${theme.colors.success}15` : theme.colors.surface)};
  border: 2px solid ${({ $isActive, theme }) => ($isActive ? theme.colors.success : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
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
    inset: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 32px;
  }

  .slider:before {
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

const Indicator = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ $color, theme }) => $color || theme.colors.success};
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

const Hint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;
