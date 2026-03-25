import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsEggFried, BsCheckCircleFill, BsDash, BsPlus } from 'react-icons/bs'
import useFoodModule from '../../hooks/useFoodModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'

const MODULE_COLOR = '#F97316'

export default function FoodModule() {
  const [activeTab, setActiveTab] = useState('desayuno')
  const { mealRecords, isLoading, MEAL_TYPES, MEAL_LABELS, saveMeal, isSavingMeal } = useFoodModule()

  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
    defaultValues: {
      did_eat: false,
      meal_time: '',
      ate_on_time: false,
      food_description: '',
      quality: '',
      variety: false,
      carb_count: 0,
      had_salad: false,
      watched_tv: false,
    },
  })

 // 1. Obtenemos el registro de la pestaña actual afuera del useEffect
  const currentRecord = mealRecords?.[activeTab]
  const isAlmuerzo = activeTab === 'almuerzo'
  const hasSavedRecord = !!currentRecord

  // 2. Cargar datos SOLO cuando cambia la pestaña o el registro exacto
  useEffect(() => {
    if (currentRecord) {
      reset({
        did_eat: true,
        meal_time: currentRecord.meal_time || '',
        ate_on_time: currentRecord.ate_on_time || false,
        food_description: currentRecord.food_description || '',
        quality: currentRecord.quality || '',
        variety: currentRecord.variety || false,
        carb_count: currentRecord.carb_count || 0,
        had_salad: currentRecord.had_salad || false,
        watched_tv: currentRecord.watched_tv || false,
      })
    } else {
      reset({
        did_eat: false,
        meal_time: '',
        ate_on_time: false,
        food_description: '',
        quality: '',
        variety: false,
        carb_count: 0,
        had_salad: false,
        watched_tv: false,
      })
    }
  }, [activeTab, currentRecord, reset]) // <-- Aquí está la magia: dependemos de currentRecord

  const formValues = watch()
  // const isAlmuerzo = activeTab === 'almuerzo'
  // const hasSavedRecord = !!mealRecords?.[activeTab]

  // Calcular puntos en tiempo real para el resumen
  const calculatePoints = () => {
    let ptsOnTime = formValues.ate_on_time ? 30 : 0
    let ptsVariety = formValues.variety ? 20 : 0
    let ptsSalad = (isAlmuerzo && formValues.had_salad) ? 30 : 0
    let ptsTv = (isAlmuerzo && formValues.watched_tv === false) ? 30 : 0
    let ptsCarbs = formValues.carb_count >= 2 ? -25 : 0
    
    let ptsQuality = 0
    if (formValues.quality === 'excelente') ptsQuality = 20
    if (formValues.quality === 'regular') ptsQuality = -10
    if (formValues.quality === 'mala') ptsQuality = -20

    const total = Math.max(0, ptsOnTime + ptsVariety + ptsSalad + ptsTv + ptsCarbs + ptsQuality)

    return { ptsOnTime, ptsVariety, ptsSalad, ptsTv, ptsCarbs, ptsQuality, total }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    if (!data.did_eat) return

    const cleanData = {
      ...data,
      meal_time: data.meal_time || null,
      food_description: data.food_description || null,
      quality: data.quality || null,
      carb_count: Number(data.carb_count) || 0,
    }
    
    saveMeal(activeTab, cleanData)
  }

  if (isLoading) return <LoadingText>Cargando información...</LoadingText>

  return (
    <Container>
      {/* Tabs / Pills Horizontales */}
      <TabsContainer>
        {MEAL_TYPES.map(tab => (
          <TabPill
            key={tab}
            $isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            whileTap={{ scale: 0.95 }}
          >
            {MEAL_LABELS[tab]}
            {mealRecords?.[tab] && <TabIndicator />}
          </TabPill>
        ))}
      </TabsContainer>

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

          <Form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Campo 1: ¿Comiste? */}
            <ToggleCard $isActive={formValues.did_eat} $color={MODULE_COLOR}>
              <ToggleLabel>¿Comiste {MEAL_LABELS[activeTab].toLowerCase()} hoy?</ToggleLabel>
              <ToggleSwitch
                type="button"
                $isActive={formValues.did_eat}
                $color={MODULE_COLOR}
                onClick={() => setValue('did_eat', !formValues.did_eat)}
              >
                <ToggleThumb $isActive={formValues.did_eat} />
              </ToggleSwitch>
            </ToggleCard>

            <AnimatePresence>
              {formValues.did_eat && (
                <DetailsContainer
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  
                  {/* Campo 2: Hora y a tiempo */}
                  <Row>
                    <Card style={{ flex: 1, margin: 0 }}>
                      <Label>Hora</Label>
                      <Input type="time" {...register('meal_time')} />
                    </Card>
                    <ToggleCard $isActive={formValues.ate_on_time} $color="#22C55E" style={{ flex: 1, margin: 0 }}>
                      <ToggleLabel>¿A tiempo? {formValues.ate_on_time && <Badge $color="#22C55E">+30</Badge>}</ToggleLabel>
                      <ToggleSwitch type="button" $isActive={formValues.ate_on_time} $color="#22C55E" onClick={() => setValue('ate_on_time', !formValues.ate_on_time)}>
                        <ToggleThumb $isActive={formValues.ate_on_time} />
                      </ToggleSwitch>
                    </ToggleCard>
                  </Row>

                  {/* Campo 3: Descripción */}
                  <Card>
                    <Label>¿Qué comiste?</Label>
                    <Textarea 
                      rows="3" 
                      placeholder={`Ej: ${activeTab === 'almuerzo' ? 'arroz con pollo, ensalada...' : 'avena, pan con huevo...'}`}
                      {...register('food_description')} 
                    />
                  </Card>

                  {/* Campo 4: Calidad */}
                  <Card>
                    <Label>Calidad de la comida</Label>
                    <Controller
                      name="quality"
                      control={control}
                      render={({ field }) => (
                        <ChipsContainer>
                          <QualityChip type="button" $active={field.value === 'excelente'} $color="#22C55E" onClick={() => field.onChange('excelente')}>Excelente</QualityChip>
                          <QualityChip type="button" $active={field.value === 'buena'} $color="#3B82F6" onClick={() => field.onChange('buena')}>Buena</QualityChip>
                          <QualityChip type="button" $active={field.value === 'regular'} $color="#F59E0B" onClick={() => field.onChange('regular')}>Regular</QualityChip>
                          <QualityChip type="button" $active={field.value === 'mala'} $color="#EF4444" onClick={() => field.onChange('mala')}>Mala</QualityChip>
                        </ChipsContainer>
                      )}
                    />
                  </Card>

                  {/* Campo 5 y 6: Variedad y Carbohidratos */}
                  <Card>
                    <ToggleRow style={{ marginBottom: 16 }}>
                      <ToggleLabel>Buena variedad {formValues.variety && <Badge $color="#22C55E">+20</Badge>}</ToggleLabel>
                      <ToggleSwitch type="button" $isActive={formValues.variety} $color="#22C55E" onClick={() => setValue('variety', !formValues.variety)}>
                        <ToggleThumb $isActive={formValues.variety} />
                      </ToggleSwitch>
                    </ToggleRow>
                    
                    <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <ToggleLabel>
                        Carbohidratos 
                        {formValues.carb_count >= 2 && <Badge $color="#EF4444">-25 pts</Badge>}
                      </ToggleLabel>
                      <CounterContainer>
                        <CounterButton type="button" onClick={() => setValue('carb_count', Math.max(0, formValues.carb_count - 1))}><BsDash /></CounterButton>
                        <CounterValue>{formValues.carb_count}</CounterValue>
                        <CounterButton type="button" onClick={() => setValue('carb_count', Math.min(5, formValues.carb_count + 1))}><BsPlus /></CounterButton>
                      </CounterContainer>
                    </Row>
                    {formValues.carb_count >= 2 && <Hint style={{ color: '#EF4444' }}>⚠ Doble carbohidrato</Hint>}
                  </Card>

                  {/* Campos EXCLUSIVOS Almuerzo */}
                  {isAlmuerzo && (
                    <>
                      <SectionTitle>🥗 Especial Almuerzo</SectionTitle>
                      <ToggleCard $isActive={formValues.had_salad} $color="#22C55E">
                        <ToggleLabel>¿Incluiste ensalada? {formValues.had_salad && <Badge $color="#22C55E">+30 pts</Badge>}</ToggleLabel>
                        <ToggleSwitch type="button" $isActive={formValues.had_salad} $color="#22C55E" onClick={() => setValue('had_salad', !formValues.had_salad)}>
                          <ToggleThumb $isActive={formValues.had_salad} />
                        </ToggleSwitch>
                      </ToggleCard>

                      <ToggleCard $isActive={formValues.watched_tv} $color="#EF4444">
                        <ToggleLabel>
                          ¿Viste TV durante el almuerzo?
                          <br/><Hint style={{ margin: 0 }}>Sin TV = +30 pts</Hint>
                          {formValues.watched_tv ? <Badge $color="#EF4444">-30 pts</Badge> : <Badge $color="#22C55E">+30 pts</Badge>}
                        </ToggleLabel>
                        <ToggleSwitch type="button" $isActive={formValues.watched_tv} $color="#EF4444" onClick={() => setValue('watched_tv', !formValues.watched_tv)}>
                          <ToggleThumb $isActive={formValues.watched_tv} />
                        </ToggleSwitch>
                      </ToggleCard>
                    </>
                  )}

                  <FooterSpacer />
                </DetailsContainer>
              )}
            </AnimatePresence>
            {/* 👇 SACAMOS EL RESUMEN DEL DETAILS_CONTAINER 👇 */}
            {formValues.did_eat && (
              <>
                <PointsSummaryCard
                  pointsSummary={[
                    { label: 'A tiempo', points: points.ptsOnTime, color: MODULE_COLOR },
                    { label: 'Variedad', points: points.ptsVariety, color: MODULE_COLOR },
                    ...(isAlmuerzo ? [{ label: 'Ensalada', points: points.ptsSalad, color: '#22C55E' }] : []),
                    ...(isAlmuerzo ? [{ label: 'Sin TV', points: points.ptsTv, color: '#22C55E' }] : []),
                    { label: 'Calidad', points: points.ptsQuality, color: MODULE_COLOR },
                    { label: 'Carbohidratos', points: points.ptsCarbs, color: '#EF4444' },
                  ]}
                  totalPoints={points.total}
                  accentColor={MODULE_COLOR}
                />
                <FooterSpacer />
              </>
            )}
          </Form>
        </motion.div>
      </AnimatePresence>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSavingMeal(activeTab)}
        label={`Guardar ${MEAL_LABELS[activeTab]}`}
        color={MODULE_COLOR}
        icon={<BsEggFried />}
      />
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding-bottom: 80px;
`
const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 10;
  &::-webkit-scrollbar { display: none; }
`
const TabPill = styled(motion.button)`
  background: ${({ $isActive, theme }) => ($isActive ? MODULE_COLOR : theme.colors.surface)};
  color: ${({ $isActive, theme }) => ($isActive ? 'white' : theme.colors.textSecondary)};
  border: 1px solid ${({ $isActive, theme }) => ($isActive ? MODULE_COLOR : theme.colors.border)};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
`
const TabIndicator = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  background: #22C55E;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface};
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
`
const Row = styled.div` display: flex; gap: 12px; margin-bottom: 16px; `
const ToggleRow = styled.div` display: flex; align-items: center; justify-content: space-between; `
const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 24px 0 16px 0;
`
const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
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
  padding: 8px;
  font-size: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
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
`
const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
const QualityChip = styled.button`
  background: ${({ $active, $color, theme }) => $active ? $color : theme.colors.background};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSecondary};
  border: 1px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.border};
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`
const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`
const CounterButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
`
const CounterValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  width: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `