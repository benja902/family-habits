/**
 * AdminPoints.jsx — Gestión de reglas de puntos del sistema
 * Solo accesible por el admin (Benjamín)
 */

import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  BsPencilFill,
  BsXLg,
  BsStarFill,
  BsArrowRepeat,
  BsClockFill,
  BsCheckCircleFill
} from 'react-icons/bs'
import { AppHeader } from '../../components/layout/AppHeader'
import usePointsRules from '../../hooks/usePointsRules'
import { HABIT_LABELS_FULL, HABIT_COLORS } from '../../constants/habits.constants'

export default function AdminPoints() {
  const { rules, isLoading, updateRule, isUpdating } = usePointsRules()
  const [editingRule, setEditingRule] = useState(null)

  // Agrupar reglas por categoría
  const rulesByCategory = useMemo(() => {
    const grouped = {}
    rules.forEach(rule => {
      if (!grouped[rule.category]) {
        grouped[rule.category] = []
      }
      grouped[rule.category].push(rule)
    })
    return grouped
  }, [rules])

  const categories = Object.keys(rulesByCategory).sort()

  return (
    <Container>
      <AppHeader title="Reglas de Puntos" />

      <ContentSection>
        <InfoBanner>
          <BsStarFill size={16} />
          <span>Valores de puntos para cada acción del sistema. Los cambios afectan inmediatamente.</span>
        </InfoBanner>

        {isLoading ? (
          <LoadingText>Cargando reglas...</LoadingText>
        ) : categories.length === 0 ? (
          <EmptyText>No hay reglas configuradas</EmptyText>
        ) : (
          categories.map(categoryKey => (
            <CategorySection key={categoryKey}>
              <CategoryHeader $color={HABIT_COLORS[categoryKey]}>
                <CategoryTitle>{HABIT_LABELS_FULL[categoryKey] || categoryKey}</CategoryTitle>
                <CategoryBadge>{rulesByCategory[categoryKey].length} reglas</CategoryBadge>
              </CategoryHeader>

              <RulesGrid>
                {rulesByCategory[categoryKey].map(rule => (
                  <RuleCard
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <RuleInfo>
                      <RuleName>{rule.description || rule.action_key}</RuleName>
                      <RuleMeta>
                        <ActionKey>{rule.action_key}</ActionKey>
                        <RuleTypes>
                          {rule.is_proportional && (
                            <TypeBadge title="Puntos proporcionales">
                              <BsArrowRepeat size={12} />
                              Proporcional
                            </TypeBadge>
                          )}
                          {rule.is_punctuality && (
                            <TypeBadge title="Con puntualidad">
                              <BsClockFill size={12} />
                              Puntualidad
                            </TypeBadge>
                          )}
                          {!rule.is_proportional && !rule.is_punctuality && (
                            <TypeBadge title="Puntos fijos">
                              <BsCheckCircleFill size={12} />
                              Fijo
                            </TypeBadge>
                          )}
                        </RuleTypes>
                      </RuleMeta>
                    </RuleInfo>

                    <RuleActions>
                      <PointsDisplay>{rule.points} pts</PointsDisplay>
                      <EditButton
                        onClick={() => setEditingRule(rule)}
                        whileTap={{ scale: 0.9 }}
                        title="Editar puntos"
                      >
                        <BsPencilFill size={14} />
                      </EditButton>
                    </RuleActions>
                  </RuleCard>
                ))}
              </RulesGrid>
            </CategorySection>
          ))
        )}
      </ContentSection>

      {/* Modal de edición */}
      <AnimatePresence>
        {editingRule && (
          <EditRuleModal
            rule={editingRule}
            onClose={() => setEditingRule(null)}
            onSave={(newPoints) => {
              updateRule({ ruleId: editingRule.id, newPoints })
              setEditingRule(null)
            }}
            isSaving={isUpdating}
          />
        )}
      </AnimatePresence>
    </Container>
  )
}

// ==================== MODAL DE EDICIÓN ====================
function EditRuleModal({ rule, onClose, onSave, isSaving }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      points: rule.points,
    }
  })

  const onSubmit = (data) => {
    const newPoints = parseInt(data.points, 10)
    if (newPoints !== rule.points) {
      onSave(newPoints)
    } else {
      onClose()
    }
  }

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <ModalContent
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle>Editar Regla de Puntos</ModalTitle>
          <CloseButton onClick={onClose}>
            <BsXLg size={20} />
          </CloseButton>
        </ModalHeader>

        <RulePreview>
          <PreviewLabel>Acción</PreviewLabel>
          <PreviewValue>{rule.description || rule.action_key}</PreviewValue>

          <PreviewLabel>Categoría</PreviewLabel>
          <PreviewValue>{HABIT_LABELS_FULL[rule.category] || rule.category}</PreviewValue>

          <PreviewLabel>Tipo</PreviewLabel>
          <PreviewTypes>
            {rule.is_proportional && <TypeChip><BsArrowRepeat size={12} /> Proporcional</TypeChip>}
            {rule.is_punctuality && <TypeChip><BsClockFill size={12} /> Puntualidad</TypeChip>}
            {!rule.is_proportional && !rule.is_punctuality && (
              <TypeChip><BsCheckCircleFill size={12} /> Fijo</TypeChip>
            )}
          </PreviewTypes>
        </RulePreview>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Puntos *</Label>
            <Input
              type="number"
              step="1"
              {...register('points', {
                required: 'Los puntos son obligatorios',
                min: { value: -100, message: 'Mínimo -100 puntos' },
                max: { value: 1000, message: 'Máximo 1000 puntos' },
                valueAsNumber: true,
              })}
              placeholder="100"
            />
            {errors.points && <ErrorText>{errors.points.message}</ErrorText>}
            <HelpText>Los puntos pueden ser negativos para penalizaciones</HelpText>
          </FormGroup>

          <ModalActions>
            <CancelButton type="button" onClick={onClose}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </SaveButton>
          </ModalActions>
        </Form>
      </ModalContent>
    </ModalOverlay>
  )
}

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`
const ContentSection = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`
const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => `${theme.colors.primary}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 600;
`
const LoadingText = styled.p`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const EmptyText = styled.p`
  text-align: center;
  padding: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`
const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ $color }) => $color}15;
  border-left: 4px solid ${({ $color }) => $color};
  border-radius: 12px;
`
const CategoryTitle = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const CategoryBadge = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const RulesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 12px;
`
const RuleCard = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`
const RuleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`
const RuleName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const RuleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`
const ActionKey = styled.code`
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.background};
  padding: 2px 8px;
  border-radius: 6px;
`
const RuleTypes = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`
const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.background};
  padding: 4px 8px;
  border-radius: 6px;
`
const RuleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`
const PointsDisplay = styled.span`
  font-size: 18px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 70px;
  text-align: right;
`
const EditButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.primary};
  }
`

// Modal styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 200;
`
const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
`
const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`
const RulePreview = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background};
  margin: 16px 20px;
  border-radius: 12px;
`
const PreviewLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const PreviewValue = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const PreviewTypes = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`
const TypeChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  padding: 4px 8px;
  border-radius: 6px;
`
const Form = styled.form`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`
const Label = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const Input = styled.input`
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.5;
  }
`
const ErrorText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
`
const HelpText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`
const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
`
const SaveButton = styled.button`
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
