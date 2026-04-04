import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import {
  BsArrowClockwise,
  BsCheckCircleFill,
  BsClockFill,
  BsExclamationTriangleFill,
  BsPhoneFill,
  BsPencilSquare,
} from 'react-icons/bs';
import { theme } from '../../styles/theme';
import {
  DEVICE_CURFEW,
  PHONE_BATHROOM_PENALTY,
  PHONE_BED_PENALTY,
  PHONE_NO_BATHROOM_POINTS,
  PHONE_NO_BED_POINTS,
} from '../../constants/habits.constants';
import { getCurrentTimeString, isBeforeCurrentTime, isFutureTime } from '../../utils/dates.utils';
import usePhoneUseModule from '../../hooks/usePhoneUseModule';
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';
import { getModuleTimeRules } from '../../utils/time-based-rules.utils';
import { TimeBasedBanner } from '../ui/TimeBasedBanner';
import { ModuleBlockedScreen } from '../ui/ModuleBlockedScreen';

const MODULE_COLOR = theme.HABIT_COLORS.sleep;

export default function PhoneUseModule() {
  const timeRules = getModuleTimeRules('phone');
  
  // Si está fuera de horario, mostrar pantalla de bloqueo
  if (timeRules.isOutOfHours) {
    return (
      <ModuleBlockedScreen
        moduleName="Uso del Celular"
        availableHours={timeRules.availableHours}
        icon={<BsPhoneFill />}
        accentColor={MODULE_COLOR}
      />
    );
  }
  
  const [showManualDeviceTime, setShowManualDeviceTime] = useState(false);
  const { sleepRecord, isLoading, hasRecord, savePhoneUse, isSaving } = usePhoneUseModule();

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
      no_device_in_bathroom: true,
      no_device_in_bed: true,
    },
  });

  useEffect(() => {
    reset({
      device_delivered: sleepRecord?.device_delivered || false,
      device_delivered_at: sleepRecord?.device_delivered_at || '',
      device_delivered_at_source: sleepRecord?.device_delivered_at_source || null,
      no_device_in_bathroom: !sleepRecord?.device_in_bathroom,
      no_device_in_bed: !sleepRecord?.device_in_bed,
    });
    setShowManualDeviceTime(
      !sleepRecord?.device_delivered_at_source || sleepRecord.device_delivered_at_source === 'manual'
    );
  }, [sleepRecord, reset]);

  const formValues = watch();
  const currentTime = getCurrentTimeString();

  const calculatePoints = () => {
    let devicePoints = 0;

    if (formValues.device_delivered && formValues.device_delivered_at) {
      devicePoints += formValues.device_delivered_at <= DEVICE_CURFEW ? 20 : -10;
    }

    if (formValues.no_device_in_bathroom) {
      devicePoints += PHONE_NO_BATHROOM_POINTS;
    } else {
      devicePoints += PHONE_BATHROOM_PENALTY;
    }

    if (formValues.no_device_in_bed) {
      devicePoints += PHONE_NO_BED_POINTS;
    } else {
      devicePoints += PHONE_BED_PENALTY;
    }

    return {
      devicePoints,
      total: devicePoints,
    };
  };

  const points = calculatePoints();
  const isDeviceCurrentMode =
    formValues.device_delivered_at_source === 'current_time' && !!formValues.device_delivered_at;

  const setCurrentTimeForField = () => {
    const now = getCurrentTimeString();
    clearErrors('device_delivered_at');
    setValue('device_delivered_at', now, { shouldDirty: true, shouldValidate: true });
    setValue('device_delivered_at_source', 'current_time', { shouldDirty: true });
    setShowManualDeviceTime(false);
  };

  const toggleManualTimeInput = () => {
    setShowManualDeviceTime((value) => !value);
    clearErrors('device_delivered_at');
  };

  const handleManualTimeChange = (value) => {
    setValue('device_delivered_at', value, { shouldDirty: true, shouldValidate: true });
    setValue('device_delivered_at_source', value ? 'manual' : null, { shouldDirty: true });

    if (!value) {
      clearErrors('device_delivered_at');
      return;
    }

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('device_delivered_at', {
        type: 'manual',
        message: 'Debe coincidir con la hora actual.',
      });
      return;
    }

    clearErrors('device_delivered_at');
  };

  const validateClockControlledTime = (value, source) => {
    if (!value || source !== 'manual') return false;

    if (isBeforeCurrentTime(value) || isFutureTime(value)) {
      setError('device_delivered_at', {
        type: 'manual',
        message: 'Si ingresas la hora manualmente, debe coincidir con la hora actual.',
      });
      return true;
    }

    clearErrors('device_delivered_at');
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

  const deviceTimeFeedback = getDeviceTimeFeedback();

  const onSubmit = (data) => {
    if (
      validateClockControlledTime(data.device_delivered_at, data.device_delivered_at_source)
    ) {
      return;
    }

    if (data.device_delivered_at && isFutureTime(data.device_delivered_at)) {
      setError('device_delivered_at', {
        type: 'manual',
        message: 'La hora de entrega no puede ser posterior a la hora actual.',
      });
      return;
    }

    savePhoneUse({
      ...data,
      device_in_bathroom: !data.no_device_in_bathroom,
      device_in_bed: !data.no_device_in_bed,
      device_delivered_at: data.device_delivered_at || null,
      device_delivered_at_source: data.device_delivered_at
        ? data.device_delivered_at_source || 'manual'
        : null,
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
            Ya registraste tu rutina del celular de hoy
          </Banner>
        )}
      </AnimatePresence>

      {/* Sistema de 3 niveles: ideal (verde), tarde (naranja), fuera de horario (naranja) */}
      {timeRules.bannerType === 'suggested' && (
        <TimeBasedBanner type="suggested" badge={timeRules.badge} />
      )}
      {timeRules.bannerType === 'warning' && (
        <TimeBasedBanner type="warning" message={timeRules.message} />
      )}

      <FormContent onSubmit={handleSubmit(onSubmit)}>
        <SectionTitle>📱 Rutina del celular</SectionTitle>
        <SectionDescription>
          Aquí registras entrega del celular y si lo usaste en lugares donde no debía estar.
        </SectionDescription>

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
                        onClick={setCurrentTimeForField}
                      >
                        <BsArrowClockwise />
                        Registrar hora de ahora
                      </ActionButton>
                      <ActionButton
                        type="button"
                        $active={showManualDeviceTime}
                        $activeColor={theme.colors.warning}
                        onClick={toggleManualTimeInput}
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
                                onChange={(event) => handleManualTimeChange(event.target.value)}
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
                            <Hint>Debe ser la hora exacta de ahora.</Hint>
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

        <Controller
          name="no_device_in_bathroom"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={field.value ? `${theme.colors.success}12` : `${theme.colors.danger}15`}>
              <ToggleRow>
                <ToggleLabel>
                  No usé el celular en el baño
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
              {field.value ? (
                <Badge $color={theme.colors.success}>+{PHONE_NO_BATHROOM_POINTS} pts</Badge>
              ) : (
                <Badge $color={theme.colors.danger}>{PHONE_BATHROOM_PENALTY} pts</Badge>
              )}
            </ToggleCard>
          )}
        />

        <Controller
          name="no_device_in_bed"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={field.value ? `${theme.colors.success}12` : `${theme.colors.danger}15`}>
              <ToggleRow>
                <ToggleLabel>
                  No usé el celular en la cama
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
              {field.value ? (
                <Badge $color={theme.colors.success}>+{PHONE_NO_BED_POINTS} pts</Badge>
              ) : (
                <Badge $color={theme.colors.danger}>{PHONE_BED_PENALTY} pts</Badge>
              )}
            </ToggleCard>
          )}
        />

        <PointsSummaryCard
          pointsSummary={[
            { label: 'PhoneUse', points: points.devicePoints, color: '#6366F1' },
          ]}
          totalPoints={points.total}
          accentColor="#6366F1"
        />
      </FormContent>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar rutina del celular"
        color="#6366F1"
        icon={<BsPhoneFill />}
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.background};
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`;

const FieldHint = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.warning};
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  
  svg {
    flex-shrink: 0;
  }
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
