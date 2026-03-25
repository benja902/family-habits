import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsExclamationTriangleFill, BsCheckCircleFill, BsShieldSlashFill, BsCalendarX } from 'react-icons/bs'
import { PageContainer } from '../components/layout/PageContainer'
import { AppHeader } from '../components/layout/AppHeader'
import usePunishments from '../hooks/usePunishments'
import { formatDateES } from '../utils/dates.utils'

export default function Punishments() {
  const [activeTab, setActiveTab] = useState('pending')
  const { punishments, isLoading, markCompleted, isCompleting } = usePunishments()

  // Filtrar castigos según estado
  const pendingPunishments = punishments.filter(p => p.status === 'pendiente')
  const historyPunishments = punishments.filter(p => p.status !== 'pendiente')

  const displayList = activeTab === 'pending' ? pendingPunishments : historyPunishments

  return (
    <PageContainer>
      <AppHeader title="Disciplina" />

      <HeroSection>
        <HeroIcon>
          <BsShieldSlashFill />
        </HeroIcon>
        <HeroTitle>Panel de Disciplina</HeroTitle>
        <HeroText>
          {pendingPunishments.length === 0 
            ? '¡Felicidades! Tienes un historial limpio.' 
            : `Tienes ${pendingPunishments.length} penalización(es) pendiente(s).`}
        </HeroText>
      </HeroSection>

      <ToggleContainer>
        <ToggleButton 
          $isActive={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Pendientes ({pendingPunishments.length})
        </ToggleButton>
        <ToggleButton 
          $isActive={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          Historial
        </ToggleButton>
      </ToggleContainer>

      <ListSection>
        {isLoading ? (
          <EmptyText>Cargando registros...</EmptyText>
        ) : displayList.length === 0 ? (
          <EmptyText>
            {activeTab === 'pending' 
              ? 'No tienes ningún castigo pendiente. ¡Sigue así!' 
              : 'Aún no tienes historial de castigos.'}
          </EmptyText>
        ) : (
          displayList.map((punishment) => (
            <PunishmentCard 
              key={punishment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CardHeader>
                <IconWrapper $status={punishment.status}>
                  {punishment.status === 'pendiente' ? <BsExclamationTriangleFill /> : <BsCheckCircleFill />}
                </IconWrapper>
                <DateText>{formatDateES(punishment.created_at.split('T')[0])}</DateText>
                <StatusBadge $status={punishment.status}>
                  {punishment.status.toUpperCase()}
                </StatusBadge>
              </CardHeader>

              <Reason>{punishment.reason}</Reason>

              <PenaltiesContainer>
                {punishment.points_deducted > 0 && (
                  <PenaltyBox $type="points">
                    <PenaltyLabel>Puntos descontados</PenaltyLabel>
                    <PenaltyValue>-{punishment.points_deducted} pts</PenaltyValue>
                  </PenaltyBox>
                )}
                {punishment.extra_task && (
                  <PenaltyBox $type="task">
                    <PenaltyLabel>Tarea extra asignada</PenaltyLabel>
                    <PenaltyValue>{punishment.extra_task}</PenaltyValue>
                  </PenaltyBox>
                )}
                {punishment.due_date && punishment.status === 'pendiente' && (
                  <PenaltyBox $type="date">
                    <PenaltyLabel><BsCalendarX style={{marginRight: 4}}/> Fecha Límite</PenaltyLabel>
                    <PenaltyValue style={{color: '#EF4444'}}>{formatDateES(punishment.due_date)}</PenaltyValue>
                  </PenaltyBox>
                )}
                {punishment.completed_at && punishment.status === 'cumplido' && (
                  <PenaltyBox $type="date">
                    <PenaltyLabel>Cumplido el</PenaltyLabel>
                    <PenaltyValue>{formatDateES(punishment.completed_at.split('T')[0])}</PenaltyValue>
                  </PenaltyBox>
                )}
              </PenaltiesContainer>

              {punishment.status === 'pendiente' && punishment.extra_task && (
                <ActionArea>
                  <CompleteButton 
                    onClick={() => markCompleted(punishment.id)}
                    disabled={isCompleting}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleting ? 'Actualizando...' : 'Marcar tarea como cumplida'}
                  </CompleteButton>
                </ActionArea>
              )}
            </PunishmentCard>
          ))
        )}
      </ListSection>
    </PageContainer>
  )
}

// ==================== STYLED COMPONENTS ====================

const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 24px 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const HeroIcon = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: 16px;
  opacity: 0.8;
`
const HeroTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px 0;
`
const HeroText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-align: center;
`
const ToggleContainer = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 4px;
  margin: 16px 16px 8px 16px;
`
const ToggleButton = styled.button`
  flex: 1;
  padding: 8px 0;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $isActive, theme }) => ($isActive ? theme.colors.surface : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadows.card : 'none')};
  transition: all 0.2s ease;
`
const ListSection = styled.div`
  padding: 16px;
  padding-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 40px 20px;
  font-size: 15px;
`
const PunishmentCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: relative;
  overflow: hidden;
`
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`
const IconWrapper = styled.div`
  color: ${({ $status, theme }) => $status === 'pendiente' ? theme.colors.danger : theme.colors.success};
  font-size: 20px;
  display: flex;
  align-items: center;
`
const DateText = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`
const StatusBadge = styled.span`
  font-size: 11px;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $status, theme }) => $status === 'pendiente' ? `${theme.colors.danger}15` : `${theme.colors.success}15`};
  color: ${({ $status, theme }) => $status === 'pendiente' ? theme.colors.danger : theme.colors.success};
`
const Reason = styled.h3`
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 16px 0;
  line-height: 1.4;
`
const PenaltiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: ${({ theme }) => theme.colors.background};
  padding: 12px;
  border-radius: 12px;
`
const PenaltyBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const PenaltyLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ $type, theme }) => $type === 'points' ? theme.colors.danger : theme.colors.textSecondary};
`
const PenaltyValue = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`
const ActionArea = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`
const CompleteButton = styled(motion.button)`
  width: 100%;
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`