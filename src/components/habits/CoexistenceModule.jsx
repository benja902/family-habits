import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsPeopleFill, BsDash, BsPlus, BsStarFill } from 'react-icons/bs'
import useCoexistenceModule from '../../hooks/useCoexistenceModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'

const MODULE_COLOR = '#EC4899' // theme.HABIT_COLORS.coexistence

export default function CoexistenceModule() {
  const { coexistenceRecord, isLoading, hasRecord, saveCoexistence, isSaving } = useCoexistenceModule()

  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
    defaultValues: {
      respected_rules: true, // Por defecto asumimos buen comportamiento
      took_others_things: false,
      respect_score: 5,
      tv_minutes: 0,
      incidents: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (coexistenceRecord) {
      reset({
        respected_rules: coexistenceRecord.respected_rules ?? true,
        took_others_things: coexistenceRecord.took_others_things || false,
        respect_score: coexistenceRecord.respect_score || 5,
        tv_minutes: coexistenceRecord.tv_minutes || 0,
        incidents: coexistenceRecord.incidents || '',
        notes: coexistenceRecord.notes || '',
      })
    }
  }, [coexistenceRecord, reset])

  const formValues = watch()

  // Calcular puntos en tiempo real para el resumen
  const calculatePoints = () => {
    let rulesPts = formValues.respected_rules ? 60 : 0
    let thingsPts = formValues.took_others_things === false ? 40 : 0
    let tvPenalty = formValues.tv_minutes > 120 ? -30 : 0 // Penalización si > 120 min

    return { rulesPts, thingsPts, tvPenalty, total: rulesPts + thingsPts + tvPenalty }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      tv_minutes: Number(data.tv_minutes) || 0,
      respect_score: Number(data.respect_score) || 5,
      incidents: data.incidents || null,
      notes: data.notes || null,
    }
    saveCoexistence(cleanData)
  }

  if (isLoading) return <LoadingText>Cargando información...</LoadingText>

  return (
    <Container>
      <AnimatePresence>
        {hasRecord && (
          <Banner
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            ✓ Ya registraste tu convivencia hoy
          </Banner>
        )}
      </AnimatePresence>

      <Form onSubmit={handleSubmit(onSubmit)}>
        
        {/* SECCIÓN 1: Reglas y Respeto */}
        <SectionTitle>🤝 Reglas y Comportamiento</SectionTitle>

        <ToggleCard $isActive={formValues.respected_rules} $color="#22C55E">
          <ToggleLabel>
            ¿Respetaste las normas del día?
            {formValues.respected_rules && <Badge $color="#22C55E">+60 pts</Badge>}
          </ToggleLabel>
          <ToggleSwitch type="button" $isActive={formValues.respected_rules} $color="#22C55E" onClick={() => setValue('respected_rules', !formValues.respected_rules)}>
            <ToggleThumb $isActive={formValues.respected_rules} />
          </ToggleSwitch>
        </ToggleCard>

        {/* Mostrar incidentes si NO respetó las normas */}
        <AnimatePresence>
          {!formValues.respected_rules && (
            <DetailsContainer
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card style={{ borderColor: '#EF4444' }}>
                <Label style={{ color: '#EF4444' }}>Describe los incidentes</Label>
                <Textarea
                  rows="2"
                  placeholder="¿Qué normas no se respetaron? ¿Hubo alguna discusión?"
                  {...register('incidents')}
                  style={{ borderColor: '#EF4444' }}
                />
              </Card>
            </DetailsContainer>
          )}
        </AnimatePresence>

        <ToggleCard $isActive={formValues.took_others_things} $color="#EF4444">
          <ToggleLabel>
            ¿Tomaste cosas ajenas sin permiso?
            {formValues.took_others_things ? (
              <Hint style={{ margin: 0 }}>Pierdes 40 pts</Hint>
            ) : (
              <Badge $color="#22C55E">+40 pts</Badge>
            )}
          </ToggleLabel>
          <ToggleSwitch type="button" $isActive={formValues.took_others_things} $color="#EF4444" onClick={() => setValue('took_others_things', !formValues.took_others_things)}>
            <ToggleThumb $isActive={formValues.took_others_things} />
          </ToggleSwitch>
        </ToggleCard>

        {/* SECCIÓN 2: Autoevaluación */}
        <SectionTitle>⭐ Autoevaluación (1 al 5)</SectionTitle>
        <Card>
          <Label>¿Cómo calificas tu nivel de respeto hoy?</Label>
          <Controller
            name="respect_score"
            control={control}
            render={({ field }) => (
              <ScoreContainer>
                {[1, 2, 3, 4, 5].map((score) => (
                  <ScoreChip
                    key={score}
                    type="button"
                    $isActive={field.value === score}
                    onClick={() => field.onChange(score)}
                  >
                    {score}
                    <BsStarFill size={12} />
                  </ScoreChip>
                ))}
              </ScoreContainer>
            )}
          />
        </Card>

        {/* SECCIÓN 3: Pantallas */}
        <SectionTitle>📺 Uso de Pantallas</SectionTitle>
        <Card>
          <Label>Minutos de TV</Label>
          <CounterContainer>
            <CounterBtn type="button" onClick={() => setValue('tv_minutes', Math.max(0, formValues.tv_minutes - 15))}>
              <BsDash /> 15m
            </CounterBtn>
            <CounterValueLg>{formValues.tv_minutes} min</CounterValueLg>
            <CounterBtn type="button" onClick={() => setValue('tv_minutes', formValues.tv_minutes + 15)}>
              +15m
            </CounterBtn>
          </CounterContainer>
          {formValues.tv_minutes > 120 && (
            <Hint style={{ color: '#EF4444', textAlign: 'center', marginTop: '12px', fontWeight: 'bold' }}>
              ⚠ Excediste el límite (Penalización: -30 pts)
            </Hint>
          )}
        </Card>

        {/* SECCIÓN 4: Notas */}
        <SectionTitle>📝 Notas Generales</SectionTitle>
        <Card>
          <Textarea
            rows="2"
            placeholder="Comentarios sobre la convivencia hoy (opcional)..."
            {...register('notes')}
          />
        </Card>

        {/* RESUMEN DE PUNTOS */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Respetó Normas', points: points.rulesPts, color: '#22C55E' },
            { label: 'No tomó cosas ajenas', points: points.thingsPts, color: '#22C55E' },
            { label: 'Exceso de TV', points: points.tvPenalty, color: '#EF4444' },
          ]}
          totalPoints={points.total}
          accentColor={MODULE_COLOR}
        />
        <FooterSpacer />

      </Form>

      <ModuleSaveButton
        onSave={handleSubmit(onSubmit)}
        isSaving={isSaving}
        label="Guardar convivencia"
        color={MODULE_COLOR}
        icon={<BsPeopleFill />}
      />
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div` padding-bottom: 80px; `
const Form = styled.form` padding: 16px; `
const DetailsContainer = styled(motion.div)` overflow: hidden; `
const Banner = styled(motion.div)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
`
const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 24px 0 16px 0;
`
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`
const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 12px;
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
  flex-direction: column;
  gap: 6px;
`
const Badge = styled.span`
  background: ${({ $color }) => $color};
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
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
const ScoreContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`
const ScoreChip = styled.button`
  flex: 1;
  background: ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.background};
  color: ${({ $isActive, theme }) => $isActive ? 'white' : theme.colors.textSecondary};
  border: 2px solid ${({ $isActive, theme }) => $isActive ? MODULE_COLOR : theme.colors.border};
  border-radius: 12px;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
`
const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`
const CounterBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${MODULE_COLOR};
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  &:active { transform: scale(0.95); }
`
const CounterValueLg = styled.span`
  font-size: 20px;
  font-weight: 900;
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
  &:focus { outline: none; border-color: ${MODULE_COLOR}; }
`
const FooterSpacer = styled.div` height: 60px; `
const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `