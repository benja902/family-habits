import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { BsCheckCircleFill, BsMoonStarsFill } from 'react-icons/bs';
import { theme } from '../../styles/theme';
import { SLEEP_TARGET } from '../../constants/habits.constants';
import useNightRoutineModule from '../../hooks/useNightRoutineModule';
import { PointsSummaryCard } from '../ui/PointsSummaryCard';
import { ModuleSaveButton } from '../ui/ModuleSaveButton';

const MODULE_COLOR = theme.HABIT_COLORS.sleep;

export default function NightRoutineModule() {
  const { sleepRecord, isLoading, hasRecord, saveNightRoutine, isSaving } = useNightRoutineModule();

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      sleep_time: '',
      slept_by_11: false,
    },
  });

  useEffect(() => {
    reset({
      sleep_time: sleepRecord?.sleep_time || '',
      slept_by_11: sleepRecord?.slept_by_11 || false,
    });
  }, [sleepRecord, reset]);

  const formValues = watch();

  const calculatePoints = () => {
    let nightPoints = 0;

    if (formValues.slept_by_11) {
      nightPoints += 25;
    } else if (formValues.sleep_time) {
      nightPoints -= 35;
    }

    return {
      nightPoints,
      total: nightPoints,
    };
  };

  const points = calculatePoints();

  const onSubmit = (data) => {
    saveNightRoutine({
      sleep_time: data.sleep_time || null,
      slept_by_11: !!data.slept_by_11,
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
          Aquí dejas tu hora de dormir y si lograste acostarte dentro del horario objetivo.
        </SectionDescription>

        <FieldWrapper>
          <Label>Hora en que te dormiste</Label>
          <Controller
            name="sleep_time"
            control={control}
            render={({ field }) => <TimeInput type="time" {...field} />}
          />
        </FieldWrapper>

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
              {field.value ? (
                <Badge $color={theme.colors.success}>+25 pts</Badge>
              ) : (
                formValues.sleep_time && <Badge $color={theme.colors.danger}>-35 pts</Badge>
              )}
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
