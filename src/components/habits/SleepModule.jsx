/**
 * Módulo de descanso y dispositivos
 * Formulario para registrar hábitos de sueño y uso de dispositivos
 */

import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import useSleepModule from '../../hooks/useSleepModule';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsMoonStarsFill,
  BsPhoneFlip,
  BsCheckCircleFill,
  BsXCircleFill,
  BsClockFill,
  BsExclamationTriangleFill,
} from 'react-icons/bs';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { DEVICE_CURFEW, WAKE_TARGET } from '../../constants/habits.constants';
import { applyPunctuality } from '../../utils/points.utils';

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

const PointsSummary = styled.div`
  position: sticky;
  bottom: 72px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${MODULE_COLOR};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.hover};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const PointsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const PointsLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PointsValue = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ $color, theme }) => $color || theme.colors.textPrimary};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 2px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const TotalLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TotalValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.black};
  color: ${MODULE_COLOR};
`;

const SaveButton = styled(motion.button)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: ${MODULE_COLOR};
  color: white;
  border: none;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// ==================== COMPONENTE ====================

export default function SleepModule() {
  const { sleepRecord, isLoading, hasRecord, saveSleep, isSaving } = useSleepModule();
  console.log('isSaving:', isSaving); // 👈 AQUÍ
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      device_delivered: false,
      device_delivered_at: '',
      device_in_bathroom: false,
      device_in_bed: false,
      sleep_time: '',
      slept_by_11: false,
      wake_time: '',
      notes: '',
    },
  });

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (sleepRecord) {
      reset({
        device_delivered: sleepRecord.device_delivered || false,
        device_delivered_at: sleepRecord.device_delivered_at || '',
        device_in_bathroom: sleepRecord.device_in_bathroom || false,
        device_in_bed: sleepRecord.device_in_bed || false,
        sleep_time: sleepRecord.sleep_time || '',
        slept_by_11: sleepRecord.slept_by_11 || false,
        wake_time: sleepRecord.wake_time || '',
        notes: sleepRecord.notes || '',
      });
    }
  }, [sleepRecord, reset]);

  // Observar cambios en el formulario para calcular puntos
  const formValues = watch();

  // Calcular puntos en tiempo real
  const calculatePoints = () => {
    let positive = 0;
    let negative = 0;

    // 1. Dispositivo entregado a tiempo
    if (formValues.device_delivered && formValues.device_delivered_at) {
      const points = applyPunctuality(100, formValues.device_delivered_at, DEVICE_CURFEW);
      positive += points;
    }

    // 2. Penalizaciones
    if (formValues.device_in_bathroom) {
      negative += 20;
    }
    if (formValues.device_in_bed) {
      negative += 20;
    }

    // 3. Dormido antes de las 11pm
    if (formValues.slept_by_11) {
      positive += 50;
    }

    // 4. Levantado a tiempo
    if (formValues.wake_time) {
      const [hours] = formValues.wake_time.split(':').map(Number);
      if (hours < 7) {
        positive += 50;
      }
    }

    return { positive, negative, total: positive - negative };
  };

  const points = calculatePoints();

  const onSubmit = (data) => {
  const cleanedData = {
    ...data,
    device_delivered_at: data.device_delivered_at || null,
    sleep_time: data.sleep_time || null,
    wake_time: data.wake_time || null,
  };

    // console.log('DATA ENVIADA:', cleanedData);
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
            Ya registraste tu descanso hoy
          </Banner>
        )}
      </AnimatePresence>

      <FormContent onSubmit={handleSubmit(onSubmit)}>
        {/* ==================== SECCIÓN 1: DISPOSITIVOS ==================== */}
        <SectionTitle>📱 Dispositivos</SectionTitle>

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
                    <Controller
                      name="device_delivered_at"
                      control={control}
                      render={({ field: timeField }) => (
                        <>
                          <TimeInputRow>
                            <TimeInput
                              type="time"
                              {...timeField}
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
                          <Hint>
                            <BsClockFill />
                            Antes de las {DEVICE_CURFEW} = puntos completos
                          </Hint>
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
              {field.value && <Badge $color={theme.colors.danger}>-20 pts</Badge>}
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
              {field.value && <Badge $color={theme.colors.danger}>-20 pts</Badge>}
            </ToggleCard>
          )}
        />

        {/* ==================== SECCIÓN 2: SUEÑO ==================== */}
        <SectionTitle>😴 Sueño</SectionTitle>

        {/* Campo 4: Hora en que te dormiste */}
        <FieldWrapper>
          <Label>Hora en que te dormiste</Label>
          <Controller
            name="sleep_time"
            control={control}
            render={({ field }) => <TimeInput type="time" {...field} />}
          />
        </FieldWrapper>

        {/* Campo 5: ¿Dormiste antes de las 11pm? */}
        <Controller
          name="slept_by_11"
          control={control}
          render={({ field }) => (
            <ToggleCard $bgColor={`${theme.colors.success}15`}>
              <ToggleRow>
                <ToggleLabel>¿Dormiste antes de las 11pm?</ToggleLabel>
                <Switch>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  <span className="slider"></span>
                </Switch>
              </ToggleRow>
              {field.value && <Badge $color={theme.colors.success}>+50 pts</Badge>}
            </ToggleCard>
          )}
        />

        {/* Campo 6: Hora en que te levantaste */}
        <FieldWrapper>
          <Label>Hora en que te levantaste</Label>
          <Controller
            name="wake_time"
            control={control}
            render={({ field }) => (
              <>
                <TimeInputRow>
                  <TimeInput type="time" {...field} />
                  {field.value && field.value <= WAKE_TARGET && (
                    <Indicator $color={theme.colors.success}>
                      <BsCheckCircleFill />
                    </Indicator>
                  )}
                </TimeInputRow>
                <Hint>
                  <BsClockFill />
                  Antes de las {WAKE_TARGET} = +50 pts
                </Hint>
              </>
            )}
          />
        </FieldWrapper>

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

        {/* ==================== RESUMEN DE PUNTOS ==================== */}
        <PointsSummary>
          <PointsRow>
            <PointsLabel>Puntos positivos</PointsLabel>
            <PointsValue $color={theme.colors.success}>+{points.positive}</PointsValue>
          </PointsRow>
          {points.negative > 0 && (
            <PointsRow>
              <PointsLabel>Penalizaciones</PointsLabel>
              <PointsValue $color={theme.colors.danger}>-{points.negative}</PointsValue>
            </PointsRow>
          )}
          <TotalRow>
            <TotalLabel>Total</TotalLabel>
            <TotalValue>{points.total} pts</TotalValue>
          </TotalRow>
        </PointsSummary>
      </FormContent>

      {/* ==================== BOTÓN GUARDAR ==================== */}
      <SaveButton
        type="submit"
        onClick={handleSubmit(onSubmit)}
        disabled={isSaving}
        whileTap={{ scale: isSaving ? 1 : 0.97 }}
      >
        {isSaving ? (
          <>
            <Spinner />
            Guardando...
          </>
        ) : (
          <>
            <BsMoonStarsFill />
            Guardar descanso
          </>
        )}
      </SaveButton>
    </Container>
  );
}

export { SleepModule };
