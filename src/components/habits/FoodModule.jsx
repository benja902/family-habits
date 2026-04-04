import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsCupFill, BsEggFried, BsDropletHalf } from 'react-icons/bs'
import useFoodModule from '../../hooks/useFoodModule'
import {
  FOOD_HYDRATION_FULL_POINTS,
  FOOD_NO_TV_LUNCH_POINTS,
  FOOD_TV_LUNCH_PENALTY,
  MAX_WATER_GLASSES,
} from '../../constants/habits.constants'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import { getModuleTimeRules } from '../../utils/time-based-rules.utils'
import { TimeBasedBanner } from '../ui/TimeBasedBanner'
import { ModuleBlockedScreen } from '../ui/ModuleBlockedScreen'

const MODULE_COLOR = '#F97316'

export default function FoodModule() {
  // ========== REGLAS DE TIEMPO ==========
  const timeRules = getModuleTimeRules('food')
  
  // Si está completamente fuera de horario, mostrar pantalla de bloqueo
  if (timeRules.isOutOfHours) {
    return (
      <ModuleBlockedScreen
        moduleName="Alimentación"
        availableHours={timeRules.availableHours}
        icon={<BsEggFried />}
        accentColor={MODULE_COLOR}
      />
    )
  }
  
  const {
    mealRecords,
    hydrationRecord,
    isLoading,
    isLoadingHydration,
    MEAL_LABELS,
    saveFoodModule,
    isSavingFoodModule,
  } = useFoodModule()

  const {
    watch: watchHydration,
    setValue: setHydrationValue,
  } = useForm({
    defaultValues: {
      water_glasses: 0,
    },
  })

  const { register, handleSubmit, watch, reset, setValue } = useForm({
      defaultValues: {
        food_description: '',
        no_tv_lunch: true,
      },
  })
  const activeTab = 'almuerzo'
  const isAlmuerzo = true
  // 1. Obtenemos el registro de la pestaña actual afuera del useEffect
  const currentRecord = mealRecords?.[activeTab]
  const hasSavedRecord = !!currentRecord

// 2. Cargar datos SOLO cuando cambia la pestaña o el registro exacto
  useEffect(() => {
    if (currentRecord) {
      reset({
        food_description: currentRecord.food_description || '',
        no_tv_lunch: !currentRecord.watched_tv,
      })
    } else {
      reset({
        food_description: '',
        no_tv_lunch: true,
      })
    }
  }, [activeTab, currentRecord, reset]) // <-- Aquí está la magia: dependemos de currentRecord

  useEffect(() => {
    setHydrationValue('water_glasses', hydrationRecord?.water_glasses || 0)
  }, [hydrationRecord, setHydrationValue])

  const formValues = watch()
  const waterGlasses = watchHydration('water_glasses')

  // Calcular puntos en tiempo real para el resumen
  const calculatePoints = () => {
    const ptsTv = isAlmuerzo
      ? (formValues.no_tv_lunch ? FOOD_NO_TV_LUNCH_POINTS : FOOD_TV_LUNCH_PENALTY)
      : 0

    return { ptsTv, total: ptsTv }
  }

  const points = calculatePoints()
  const hydrationPoints = Math.round((waterGlasses / MAX_WATER_GLASSES) * FOOD_HYDRATION_FULL_POINTS)
  const hasHydrationChanges = waterGlasses !== (hydrationRecord?.water_glasses || 0)

  const onSaveMeal = (data) => {
    const cleanData = {
      did_eat: true,
      meal_time: currentRecord?.meal_time || null,
      ate_on_time: currentRecord?.ate_on_time || false,
      food_description: data.food_description || null,
      quality: currentRecord?.quality || null,
      variety: currentRecord?.variety || false,
      carb_count: Number(currentRecord?.carb_count) || 0,
      had_salad: currentRecord?.had_salad || false,
      watched_tv: !data.no_tv_lunch,
    }
    
    saveFoodModule({
      mode: 'meal',
      mealType: activeTab,
      mealData: cleanData,
      waterGlasses,
      shouldSaveMeal: true,
      shouldSaveHydration: false,
    })
  }

  const onSaveHydration = () => {
    saveFoodModule({
      mode: 'hydration',
      waterGlasses,
      shouldSaveMeal: false,
      shouldSaveHydration: true,
    })
  }

  if (isLoading || isLoadingHydration) return <LoadingText>Cargando información...</LoadingText>

  // Verificar si los campos de comida están habilitados
  const isFoodEnabled = timeRules.isFoodActive

  return (
      <Container>
      {/* Banner de tiempo */}
      {timeRules.bannerType === 'suggested' && (
        <TimeBasedBanner type="suggested" badge={timeRules.badge} />
      )}
      {timeRules.bannerType === 'warning' && (
        <TimeBasedBanner type="warning" message={timeRules.message} />
      )}
      
      <HydrationCard>
        <SectionTitle>💧 Hidratación</SectionTitle>
        <Hint style={{ marginTop: 0 }}>Aquí registras tus vasos de agua del día.</Hint>
        <GlassesContainer>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
            <GlassButton
              key={glass}
              type="button"
              onClick={() => setHydrationValue('water_glasses', glass)}
              whileTap={{ scale: 0.85 }}
            >
              <BsCupFill
                size={32}
                color={waterGlasses >= glass ? '#3B82F6' : '#E2E8F0'}
              />
            </GlassButton>
          ))}
        </GlassesContainer>
        <HydrationSummary>
          <HydrationText $isComplete={waterGlasses >= MAX_WATER_GLASSES}>
            {waterGlasses >= MAX_WATER_GLASSES
              ? `¡Meta cumplida! +${FOOD_HYDRATION_FULL_POINTS} pts`
              : `${waterGlasses} / ${MAX_WATER_GLASSES} vasos`}
          </HydrationText>
          <HydrationPoints>{hydrationPoints} pts actuales</HydrationPoints>
        </HydrationSummary>
        <HydrationActions>
          <HydrationSaveButton
            type="button"
            onClick={onSaveHydration}
            disabled={!hasHydrationChanges || isSavingFoodModule}
            whileTap={{ scale: (!hasHydrationChanges || isSavingFoodModule) ? 1 : 0.97 }}
          >
            <BsDropletHalf />
            Guardar hidratación
          </HydrationSaveButton>
        </HydrationActions>
      </HydrationCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {hasSavedRecord && (
            <Banner>✓ Ya registraste {MEAL_LABELS[activeTab].toLowerCase()} hoy — puedes editar</Banner>
          )}

          <Form onSubmit={handleSubmit(onSaveMeal)}>
            <DetailsContainer
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SectionTitle $disabled={!isFoodEnabled}>
                🍽️ Almuerzo
                {!isFoodEnabled && <DisabledHint> (disponible desde 13:00)</DisabledHint>}
              </SectionTitle>

              <Card $disabled={!isFoodEnabled}>
                <Label $disabled={!isFoodEnabled}>¿Qué almorzaste? (opcional)</Label>
                <Textarea
                  rows="3"
                  placeholder={isFoodEnabled ? "Ej: arroz con pollo, lentejas, ensalada..." : "Disponible desde las 13:00"}
                  {...register('food_description')}
                  disabled={!isFoodEnabled}
                />
              </Card>

              <ToggleCard
                $isActive={isFoodEnabled && formValues.no_tv_lunch}
                $color={!isFoodEnabled ? '#94A3B8' : (formValues.no_tv_lunch ? '#22C55E' : '#EF4444')}
                $disabled={!isFoodEnabled}
              >
                <ToggleLabel $disabled={!isFoodEnabled}>
                  Almorcé sin TV
                  <br /><Hint style={{ margin: 0 }}>
                    {isFoodEnabled 
                      ? 'Si hubo TV durante el almuerzo, apaga este switch.'
                      : 'Disponible desde las 13:00'}
                  </Hint>
                  {isFoodEnabled && (formValues.no_tv_lunch ? (
                    <Badge $color="#22C55E">+{FOOD_NO_TV_LUNCH_POINTS} pts</Badge>
                  ) : (
                    <Badge $color="#EF4444">{FOOD_TV_LUNCH_PENALTY} pts</Badge>
                  ))}
                </ToggleLabel>
                <ToggleSwitch
                  type="button"
                  $isActive={isFoodEnabled && formValues.no_tv_lunch}
                  $color={!isFoodEnabled ? '#94A3B8' : (formValues.no_tv_lunch ? '#22C55E' : '#EF4444')}
                  $disabled={!isFoodEnabled}
                  onClick={() => isFoodEnabled && setValue('no_tv_lunch', !formValues.no_tv_lunch)}
                  disabled={!isFoodEnabled}
                >
                  <ToggleThumb $isActive={isFoodEnabled && formValues.no_tv_lunch} />
                </ToggleSwitch>
              </ToggleCard>

              <FooterSpacer />
            </DetailsContainer>

            <PointsSummaryCard
              pointsSummary={[
                {
                  label: 'Hidratación',
                  points: hydrationPoints,
                  color: '#3B82F6',
                },
                ...(isFoodEnabled && (hasSavedRecord || formValues.food_description || !formValues.no_tv_lunch)
                  ? [{ label: 'Almuerzo sin TV', points: points.ptsTv, color: points.ptsTv >= 0 ? '#22C55E' : '#EF4444' }]
                  : []),
              ]}
              totalPoints={hydrationPoints + (isFoodEnabled ? points.total : 0)}
              accentColor={MODULE_COLOR}
            />
          </Form>
        </motion.div>
      </AnimatePresence>

      <ModuleSaveButton
        onSave={handleSubmit(onSaveMeal)}
        isSaving={isSavingFoodModule}
        label={isFoodEnabled ? "Guardar almuerzo" : "Disponible desde 13:00"}
        color={MODULE_COLOR}
        icon={<BsEggFried />}
        disabled={!isFoodEnabled}
      />
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding-bottom: 80px;
`
const HydrationCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`
const Banner = styled(motion.div)`
  background: #FFF7ED;
  color: #C2410C;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 1px solid #FFEDD5;
`
const Form = styled.form` padding: 16px; `
const DetailsContainer = styled(motion.div)` overflow: hidden; `
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  transition: opacity 0.2s ease;
`
const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ $disabled, theme }) => $disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  margin: 24px 0 16px 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
`
const DisabledHint = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ $disabled, theme }) => $disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  margin-bottom: 8px;
`
const Hint = styled.p` font-size: 12px; color: ${({ theme }) => theme.colors.textSecondary}; margin-top: 4px; `
const ToggleCard = styled.div`
  background: ${({ $isActive, $color, $disabled, theme }) => 
    $disabled ? theme.colors.background : ($isActive ? `${$color}15` : theme.colors.surface)};
  border: 2px solid ${({ $isActive, $color, $disabled, theme }) => 
    $disabled ? theme.colors.border : ($isActive ? $color : theme.colors.border)};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  transition: all 0.25s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
`
const ToggleLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $disabled, theme }) => $disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  display: flex;
  align-items: flex-start;
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
`
const ToggleSwitch = styled(motion.button)`
  width: 52px;
  height: 28px;
  background: ${({ $isActive, $color, theme }) => ($isActive ? $color : theme.colors.border)};
  border-radius: 14px;
  border: none;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  position: relative;
  flex-shrink: 0;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
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
const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  background: ${({ disabled, theme }) => disabled ? theme.colors.background : theme.colors.surface};
  color: ${({ disabled, theme }) => disabled ? theme.colors.textSecondary : theme.colors.textPrimary};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'text'};
  
  &:disabled {
    opacity: 0.7;
  }
`
const GlassesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
  flex-wrap: wrap;
`
const GlassButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
`
const HydrationSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`
const HydrationText = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${({ $isComplete, theme }) => ($isComplete ? '#22C55E' : theme.colors.textPrimary)};
`
const HydrationPoints = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const HydrationActions = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
`
const HydrationSaveButton = styled(motion.button)`
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  background: #DBEAFE;
  color: #1D4ED8;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `
