import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsPeopleFill, BsDash, BsPlus, BsStarFill, BsShieldFillCheck, BsExclamationTriangleFill } from 'react-icons/bs'
import useCoexistenceModule from '../../hooks/useCoexistenceModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import {
  COEXISTENCE_NO_OTHERS_THINGS_POINTS,
  COEXISTENCE_RESPECT_SCORE_POINTS,
  COEXISTENCE_RULES_POINTS,
  COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY,
  COEXISTENCE_TV_OVERTIME_PENALTY,
  COEXISTENCE_TV_WITHIN_LIMIT_POINTS,
  MAX_TV_MINUTES,
} from '../../constants/habits.constants'

const MODULE_COLOR = '#EC4899' // Rosa

export default function CoexistenceModule() {
  const { coexistenceRecord, isLoading, hasRecord, saveCoexistence, isSaving } = useCoexistenceModule()
  
  const { register, handleSubmit, watch, control, reset, setValue } = useForm({
    defaultValues: {
      respected_rules: true,
      took_others_things: false,
      respect_score: 3,
      tv_minutes: 0,
      incidents: '',
    },
  })

  useEffect(() => {
    if (coexistenceRecord) {
      reset({
        respected_rules: coexistenceRecord.respected_rules ?? true,
        took_others_things: coexistenceRecord.took_others_things || false,
        respect_score: coexistenceRecord.respect_score || 3,
        tv_minutes: coexistenceRecord.tv_minutes || 0,
        incidents: coexistenceRecord.incidents || '',
      })
    }
  }, [coexistenceRecord, reset])

  const formValues = watch()
  const showIncidents = formValues.took_others_things === true || formValues.respected_rules === false

  const getScoreText = (score) => {
    switch(score) {
      case 1: return 'Estuvo difícil hoy'
      case 2: return 'Podría mejorar'
      case 3: return 'Regular'
      case 4: return `Bien 👍 +${COEXISTENCE_RESPECT_SCORE_POINTS[4]} pts`
      case 5: return `¡Excelente! 🌟 +${COEXISTENCE_RESPECT_SCORE_POINTS[5]} pts`
      default: return ''
    }
  }

  const calculatePoints = () => {
    let rulesPts = formValues.respected_rules ? COEXISTENCE_RULES_POINTS : 0
    let thingsPts = formValues.took_others_things
      ? COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY
      : COEXISTENCE_NO_OTHERS_THINGS_POINTS
    let tvPts = formValues.tv_minutes <= MAX_TV_MINUTES
      ? COEXISTENCE_TV_WITHIN_LIMIT_POINTS
      : COEXISTENCE_TV_OVERTIME_PENALTY
    let scorePts = COEXISTENCE_RESPECT_SCORE_POINTS[formValues.respect_score] || 0
    
    return { 
      rulesPts, 
      thingsPts, 
      tvPts, 
      scorePts,
      total: rulesPts + thingsPts + tvPts + scorePts 
    }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    const cleanData = {
      ...data,
      incidents: data.incidents || null,
      tv_minutes: Number(data.tv_minutes) || 0,
      respect_score: Number(data.respect_score) || 3,
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
        <SectionTitle>🤝 Respeto</SectionTitle>
        
        <ToggleCard 
          as={motion.div}
          whileTap={{ scale: 0.98 }}
          $isActive={formValues.respected_rules} 
          $activeColor={MODULE_COLOR}
          $activeBg={`${MODULE_COLOR}1A`}
          onClick={() => setValue('respected_rules', !formValues.respected_rules)}
        >
          <ToggleInfo>
            <BsShieldFillCheck size={24} color={formValues.respected_rules ? MODULE_COLOR : '#9CA3AF'} />            <ToggleLabel>¿Respetaste las normas hoy?</ToggleLabel>
          </ToggleInfo>
          {formValues.respected_rules && <Badge $color={MODULE_COLOR}>+{COEXISTENCE_RULES_POINTS} pts</Badge>}
        </ToggleCard>

        <ToggleCard 
          as={motion.div}
          whileTap={{ scale: 0.98 }}
          $isActive={formValues.took_others_things} 
          $activeColor="#EF4444"
          $activeBg="#EF444414"
          style={{ borderColor: formValues.took_others_things ? '#EF4444' : undefined }}
          onClick={() => setValue('took_others_things', !formValues.took_others_things)}
        >
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ToggleInfo>
                <BsExclamationTriangleFill size={24} color={formValues.took_others_things ? '#F97316' : '#9CA3AF'} />
                <ToggleLabel>¿Tomaste cosas de otros sin permiso?</ToggleLabel>
              </ToggleInfo>
              {formValues.took_others_things && <Badge $color="#EF4444">{COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY} pts</Badge>}
            </div>
            {formValues.took_others_things && <Hint>Ser honesto aquí también suma</Hint>}
          </div>
        </ToggleCard>

        {/* SECCIÓN 2: Pantallas */}
        <SectionTitle>📺 Tiempo de pantalla</SectionTitle>
        <Card>
          <CounterContainer>
            <CounterBtn type="button" onClick={() => setValue('tv_minutes', Math.max(0, formValues.tv_minutes - 15))}>
              <BsDash /> 15m
            </CounterBtn>
            <CounterValueLg>{formValues.tv_minutes} min</CounterValueLg>
            <CounterBtn type="button" onClick={() => setValue('tv_minutes', formValues.tv_minutes + 15)}>
              <BsPlus /> 15m
            </CounterBtn>
          </CounterContainer>

          <ProgressBarContainer>
            <ProgressFill 
              $isOver={formValues.tv_minutes > MAX_TV_MINUTES} 
              style={{ width: `${Math.min(100, (formValues.tv_minutes / MAX_TV_MINUTES) * 100)}%` }} 
            />
          </ProgressBarContainer>
          
          <ProgressText $isOver={formValues.tv_minutes > MAX_TV_MINUTES}>
            {formValues.tv_minutes <= MAX_TV_MINUTES 
              ? `${formValues.tv_minutes} / ${MAX_TV_MINUTES} min · +${COEXISTENCE_TV_WITHIN_LIMIT_POINTS} pts` 
              : `Límite superado · ${COEXISTENCE_TV_OVERTIME_PENALTY} pts`}
          </ProgressText>

          {formValues.tv_minutes > MAX_TV_MINUTES && (
            <Hint style={{ color: '#EF4444', textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>
              ⚠ Excediste el tiempo de TV
            </Hint>
          )}
        </Card>

        {/* SECCIÓN 3: Autoevaluación */}
        <SectionTitle>⭐ ¿Cómo estuvo tu convivencia hoy?</SectionTitle>
        <Card>
          <Controller
            name="respect_score"
            control={control}
            render={({ field }) => (
              <ScoreContainer>
                {[1, 2, 3, 4, 5].map((score) => (
                  <motion.button
                    key={score}
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => field.onChange(score)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <BsStarFill 
                      size={36} 
                      color={field.value >= score ? '#F59E0B' : '#E2E8F0'} 
                      style={{ transition: 'color 0.2s' }}
                    />
                  </motion.button>
                ))}
              </ScoreContainer>
            )}
          />
          <ScoreText>{getScoreText(formValues.respect_score)}</ScoreText>
        </Card>

        {/* SECCIÓN 4: Incidentes (Condicional) */}
        <AnimatePresence>
          {showIncidents && (
            <DetailsContainer
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <SectionTitle>📝 ¿Qué pasó?</SectionTitle>
              <Card>
                <Textarea
                  rows="3"
                  placeholder="Describe brevemente qué ocurrió..."
                  {...register('incidents')}
                />
                <Hint style={{ textAlign: 'right' }}>Esto solo lo ve Benjamín</Hint>
              </Card>
            </DetailsContainer>
          )}
        </AnimatePresence>

        {/* RESUMEN DE PUNTOS */}
        <PointsSummaryCard
          pointsSummary={[
            { label: 'Normas', points: points.rulesPts, color: MODULE_COLOR },
            { label: 'Sin tomar', points: points.thingsPts, color: formValues.took_others_things ? '#EF4444' : MODULE_COLOR },
            { label: 'TV', points: points.tvPts, color: MODULE_COLOR },
            { label: 'Convivencia', points: points.scorePts, color: '#F59E0B' },
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

const Container = styled.div`
  padding-bottom: 80px;
`

const Form = styled.form`
  padding: 16px;
`

const DetailsContainer = styled(motion.div)`
  overflow: hidden;
`

const Banner = styled(motion.div)`
  background: #FCE7F3;
  color: ${MODULE_COLOR};
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

const ToggleCard = styled.div`
  background: ${({ $isActive, $activeBg, theme }) => $isActive ? $activeBg : theme.colors.surface};
  border: 2px solid ${({ $isActive, $activeColor, theme }) => $isActive ? $activeColor : theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
`

const ToggleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ToggleLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`

const Badge = styled.span`
  background: ${({ $color }) => $color};
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  flex-shrink: 0;
`

const Hint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 8px;
  margin-bottom: 0;
`

const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;
`

const CounterBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 700;
  color: ${MODULE_COLOR};
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:active {
    transform: scale(0.95);
  }
`

const CounterValueLg = styled.span`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
`

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ $isOver }) => $isOver ? '#EF4444' : MODULE_COLOR};
  transition: width 0.3s ease, background 0.3s ease;
`

const ProgressText = styled.div`
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: ${({ $isOver, theme }) => $isOver ? '#EF4444' : theme.colors.textSecondary};
`

const ScoreContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 8px;
`

const ScoreText = styled.p`
  text-align: center;
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
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
  
  &:focus {
    outline: none;
    border-color: ${MODULE_COLOR};
  }
`

const LoadingText = styled.p`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const FooterSpacer = styled.div`
  height: 60px;
`
