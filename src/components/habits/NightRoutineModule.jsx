import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import {
  BsArrowClockwise,
  BsCheckCircleFill,
  BsClockFill,
  BsMoonStarsFill,
  BsPencilSquare,
} from 'react-icons/bs';
import { theme } from '../../styles/theme';
import { SLEEP_TARGET } from '../../constants/habits.constants';
import { getCurrentTimeString, isBeforeCurrentTime, isFutureTime } from '../../utils/dates.utils';
import useNightRoutineModule from '../../hooks/useNightRoutineModule';
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';

const MODULE_COLOR = theme.HABIT_COLORS.sleep;

export default function NightRoutineModule() {
  const [showManualSleepTime, setShowManualSleepTime] = useState(false);
  const { sleepRecord, isLoading, hasRecord, saveNightRoutine, isSaving } = useNightRoutineModule();

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
      sleep_time: '',
      prayed_before_sleep: true,
      sleep_time_source: null,
    },
  });

  useEffect(() => {
    reset({
      sleep_time: sleepRecord?.sleep_time || '',
      prayed_before_sleep: sleepRecord?.prayed_before_sleep ?? true,
      sleep_time_source: null,
    });
    setShowManualSleepTime(!!sleepRecord?.sleep_time);
  }, [sleepRecord, reset]);

  const formValues = watch();
  const currentTime = getCurrentTimeString();
  const isSleepCurrentMode = formValues.sleep_time_source === 'current_time' && !!formValues.sleep_time;

  const calculatePoints = () => {
    const sleepPoints = formValues.sleep_time
      ? (formValues.sleep_time <= SLEEP_TARGET ? 25 : -35)
      : 0;
    const prayerPoints = formValues.prayed_before_sleep ? 10 : -5;

    return {
      nightPoints: sleepPoints + prayerPoints,
      total: sleepPoints + prayerPoints,
    };
  };

  const points = calculatePoints();

  const setCurrentTimeForField = () => {
    const now = getCurrentTimeString();
    clearErrors('sleep_time');
    setValue('sleep_time', now, { shouldDirty: true, shouldValidate: true });
    setValue('sleep_time_source', 'current_time', { shouldDirty: true });
    setShowManualSleepTime(false);
  };

  const toggleManualTimeInput = () => {
    setShowManualSleepTime((value) => !value);
    clearErrors('sleep_time');
  };

  const handleManualTimeChange = (value) => {
    setValue('sleep_time', value, { shouldDirty: true, shouldValidate: true });
    setValue('sleep_time_source', value ? 'manual' : null, { shouldDirty: true });

    if (!value) {
      clearErrors('sleep_time');
      return;
    }

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('sleep_time', {
        type: 'manual',
        message: 'Debe coincidir con la hora actual.',
      });
      return;
    }

    clearErrors('sleep_time');
  };

  const validateClockControlledTime = (value, source) => {
    if (!value || source !== 'manual') return false;

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('sleep_time', {
        type: 'manual',
        message: 'Si ingresas la hora manualmente, debe coincidir con la hora actual.',
      });
      return true;
    }

    clearErrors('sleep_time');
    return false;
  };

  const getSleepTimeFeedback = () => {
    if (!formValues.sleep_time) return null;

    if (errors.sleep_time) {
      return {
        color: theme.colors.danger,
        mode: formValues.sleep_time_source === 'current_time' ? 'Ahora' : 'Manual',
        status: 'Inválida',
        points: null,
      };
    }

    const isOnTime = formValues.sleep_time <= SLEEP_TARGET;

    return {
      color: isOnTime ? theme.colors.success : theme.colors.warning,
      mode: formValues.sleep_time_source === 'current_time' ? 'Ahora' : 'Manual',
      status: isOnTime ? 'A tiempo' : 'Tarde',
      points: isOnTime ? '+25 pts' : '-35 pts',
    };
  };

  const sleepTimeFeedback = getSleepTimeFeedback();

  const onSubmit = (data) => {
    if (validateClockControlledTime(data.sleep_time, data.sleep_time_source)) {
      return;
    }

    if (data.sleep_time && isFutureTime(data.sleep_time)) {
      setError('sleep_time', {
        type: 'manual',
        message: 'La hora de acostarse no puede ser posterior a la hora actual.',
      });
      return;
    }

    saveNightRoutine({
      sleep_time: data.sleep_time || null,
      prayed_before_sleep: !!data.prayed_before_sleep,
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
            Ya registraste tu rutina de noche de hoy
          </Banner>
        )}
      </AnimatePresence>

      <FormContent onSubmit={handleSubmit(onSubmit)}>
        <SectionTitle>🌙 Rutina de noche</SectionTitle>
        <SectionDescription>
          Aquí dejas tu hora de dormir y si oraste 5 minutos antes de dormir.
        </SectionDescription>

        <FieldWrapper>
          <Label>Hora en que te acostaste</Label>
          <ActionRow>
            <ActionButton
              type="button"
              $active={isSleepCurrentMode && !showManualSleepTime}
              $activeColor={theme.colors.success}
              onClick={setCurrentTimeForField}
            >
              <BsArrowClockwise />
              Registrar hora de ahora
            </ActionButton>
            <ActionButton
              type="button"
              $active={showManualSleepTime}
              $activeColor={theme.colors.warning}
              onClick={toggleManualTimeInput}
            >
              <BsPencilSquare />
              {showManualSleepTime ? 'Cancelar entrada manual' : 'Escribir hora manual'}
            </ActionButton>
          </ActionRow>

          <Controller
            name="sleep_time"
            control={control}
            render={({ field }) => (
              <>
                {showManualSleepTime && (
                  <TimeInputRow>
                    <TimeInput
                      type="time"
                      min={currentTime}
                      max={currentTime}
                      value={field.value || ''}
                      onChange={(event) => handleManualTimeChange(event.target.value)}
                    />
                    {field.value && field.value <= SLEEP_TARGET && (
                      <Indicator $color={theme.colors.success}>
                        <BsCheckCircleFill />
                      </Indicator>
                    )}
                  </TimeInputRow>
                )}
                {sleepTimeFeedback && (
                  <SummaryChips>
                    <SummaryChip $color={theme.colors.textSecondary}>
                      {sleepTimeFeedback.mode}
                    </SummaryChip>
                    <SummaryChip $color={sleepTimeFeedback.color}>
                      {sleepTimeFeedback.status}
                    </SummaryChip>
                    {sleepTimeFeedback.points && (
                      <SummaryChip $color={sleepTimeFeedback.color}>
                        {sleepTimeFeedback.points}
                      </SummaryChip>
                    )}
                  </SummaryChips>
                )}
                {errors.sleep_time && <ErrorText>{errors.sleep_time.message}</ErrorText>}
                <Hint>
                  <BsClockFill /> Meta: hasta las {SLEEP_TARGET}
                </Hint>
                {showManualSleepTime && !errors.sleep_time && (
                  <Hint>Debe ser la hora exacta de ahora.</Hint>
                )}
              </>
            )}
          />
        </FieldWrapper>

        <Controller
          name="prayed_before_sleep"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${theme.colors.success}15`}>
              <ToggleRow>
                <ToggleLabel>
                  Oré 5 minutos antes de dormir
                  <br />
                  <Hint style={{ margin: 0 }}>Si no oraste, apaga este switch.</Hint>
                </ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>
              <Badge $color={field.value ? theme.colors.success : theme.colors.danger}>
                {field.value ? '+10 pts' : '-5 pts'}
              </Badge>
            </ToggleCard>
          )}
        />

        <PointsSummaryCard
          pointsSummary={[
            { label: 'Rutina de noche', points: points.nightPoints, color: '#6366F1' },
          ]}
          totalPoints={points.total}
          accentColor="#6366F1"
        />
      </FormContent>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar rutina de noche"
        color="#6366F1"
        icon={<BsMoonStarsFill />}
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
