import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { BsPeopleFill, BsExclamationTriangleFill } from 'react-icons/bs'
import useCoexistenceModule from '../../hooks/useCoexistenceModule'
import { PointsSummaryCard } from '../ui/PointsSummaryCard'
import { ModuleSaveButton } from '../ui/ModuleSaveButton'
import {
  COEXISTENCE_NO_OTHERS_THINGS_POINTS,
  COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY,
} from '../../constants/habits.constants'

const MODULE_COLOR = '#EC4899' // Rosa

export default function CoexistenceModule() {
  const { coexistenceRecord, isLoading, hasRecord, saveCoexistence, isSaving } = useCoexistenceModule()
  
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      did_not_take_others_things: true,
      incidents: '',
    },
  })

  useEffect(() => {
    reset({
      did_not_take_others_things: !coexistenceRecord?.took_others_things,
      incidents: coexistenceRecord?.incidents || '',
    })
  }, [coexistenceRecord, reset])

  const formValues = watch()
  const showIncidents = formValues.did_not_take_others_things === false

  const calculatePoints = () => {
    let thingsPts = formValues.did_not_take_others_things
      ? COEXISTENCE_NO_OTHERS_THINGS_POINTS
      : COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY
    
    return { 
      thingsPts, 
      total: thingsPts
    }
  }

  const points = calculatePoints()

  const onSubmit = (data) => {
    const cleanData = {
      incidents: data.incidents || null,
      respected_rules: coexistenceRecord?.respected_rules ?? true,
      took_others_things: !data.did_not_take_others_things,
      tv_minutes: coexistenceRecord?.tv_minutes || 0,
      respect_score: coexistenceRecord?.respect_score || 3,
      notes: coexistenceRecord?.notes || null,
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
        <SectionTitle>🤝 Respeto y convivencia</SectionTitle>
        <IntroText>
          Aquí solo registras si tomaste algo ajeno sin permiso y, si pasó, qué ocurrió.
        </IntroText>

        <ToggleCard 
          as={motion.div}
          whileTap={{ scale: 0.98 }}
          $isActive={formValues.did_not_take_others_things} 
          $activeColor={formValues.did_not_take_others_things ? MODULE_COLOR : '#EF4444'}
          $activeBg={formValues.did_not_take_others_things ? '#EC489914' : '#EF444414'}
          style={{ borderColor: formValues.did_not_take_others_things ? MODULE_COLOR : '#EF4444' }}
          onClick={() => setValue('did_not_take_others_things', !formValues.did_not_take_others_things)}
        >
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ToggleInfo>
                <BsExclamationTriangleFill size={24} color={formValues.did_not_take_others_things ? MODULE_COLOR : '#F97316'} />
                <ToggleLabel>No tomé cosas de otros sin permiso</ToggleLabel>
              </ToggleInfo>
              {formValues.did_not_take_others_things ? (
                <Badge $color={MODULE_COLOR}>+{COEXISTENCE_NO_OTHERS_THINGS_POINTS} pts</Badge>
              ) : (
                <Badge $color="#EF4444">{COEXISTENCE_TOOK_OTHERS_THINGS_PENALTY} pts</Badge>
              )}
            </div>
            {formValues.did_not_take_others_things ? (
              <Hint>Déjalo activado si respetaste las cosas ajenas.</Hint>
            ) : (
              <Hint>Si pasó, regístralo tal como fue.</Hint>
            )}
          </div>
        </ToggleCard>

        {/* SECCIÓN 2: Incidentes (Condicional) */}
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
            { label: 'Respeto por lo ajeno', points: points.thingsPts, color: formValues.did_not_take_others_things ? MODULE_COLOR : '#EF4444' },
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

const IntroText = styled.p`
  margin: 0 0 16px 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
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
