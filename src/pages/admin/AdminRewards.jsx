import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckLg, BsClockHistory, BsFlagFill, BsPersonFill, BsStopFill, BsXLg } from 'react-icons/bs'
import { AppHeader } from '../../components/layout/AppHeader'
import useAdmin from '../../hooks/useAdmin'
import { formatCountdownShort, formatDateES, formatDateTimeES, getCountdownParts } from '../../utils/dates.utils'

export default function AdminRewards() {
  const [, setNow] = useState(0)
  const { 
    pendingRedemptions, 
    isLoadingRedemptions, 
    resolveRedemption, 
    isResolvingRedemption 
  } = useAdmin()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const queuedRedemptions = pendingRedemptions.filter((redemption) => redemption.status === 'pendiente')
  const activeRedemptions = pendingRedemptions.filter((redemption) => redemption.status === 'activo')

  const hasRequests = queuedRedemptions.length > 0 || activeRedemptions.length > 0

  return (
    <Container>
      <AppHeader title="Aprobar Premios" />
      <ContentSection>
        {isLoadingRedemptions ? (
          <EmptyText>Buscando solicitudes...</EmptyText>
        ) : !hasRequests ? (
          <EmptyText>No hay premios pendientes de aprobación. ¡Todo al día!</EmptyText>
        ) : (
          <>
            {queuedRedemptions.length > 0 && (
              <Section>
                <SectionTitle>Solicitudes pendientes</SectionTitle>
                {queuedRedemptions.map((redemption) => {
                  const duration = redemption.duration_minutes_snapshot || redemption.rewards?.duration_minutes

                  return (
                    <RequestCard
                      key={redemption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <RequestInfo>
                        <UserRow>
                          <Avatar>
                            {redemption.users?.avatar_url ? (
                              <img src={redemption.users.avatar_url} alt="avatar" />
                            ) : (
                              <BsPersonFill />
                            )}
                          </Avatar>
                          <UserName>{redemption.users?.name}</UserName>
                          <DateText>{formatDateES(redemption.created_at.split('T')[0])}</DateText>
                        </UserRow>
                        <RewardName>{redemption.rewards?.name}</RewardName>
                        <MetaRow>
                          <RewardCost>-{redemption.rewards?.points_required || redemption.points_cost} pts</RewardCost>
                          {redemption.rewards?.is_timed && duration ? (
                            <TimerChip>
                              <BsClockHistory />
                              {duration} min
                            </TimerChip>
                          ) : (
                            <DeliveryChip>Entrega directa</DeliveryChip>
                          )}
                        </MetaRow>
                      </RequestInfo>

                      <ActionButtons>
                        <RejectButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'reject' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsXLg /> Rechazar
                        </RejectButton>
                        <ApproveButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'approve' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsCheckLg /> {redemption.rewards?.is_timed ? 'Activar' : 'Entregar'}
                        </ApproveButton>
                      </ActionButtons>
                    </RequestCard>
                  )
                })}
              </Section>
            )}

            {activeRedemptions.length > 0 && (
              <Section>
                <SectionTitle>Premios activos</SectionTitle>
                {activeRedemptions.map((redemption) => {
                  const countdown = getCountdownParts(redemption.timer_ends_at)
                  const isExpired = countdown.isExpired

                  return (
                    <ActiveCard
                      key={redemption.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <RequestInfo>
                        <UserRow>
                          <Avatar>
                            {redemption.users?.avatar_url ? (
                              <img src={redemption.users.avatar_url} alt="avatar" />
                            ) : (
                              <BsPersonFill />
                            )}
                          </Avatar>
                          <UserName>{redemption.users?.name}</UserName>
                          <DateText>{formatDateES(redemption.created_at.split('T')[0])}</DateText>
                        </UserRow>
                        <RewardName>{redemption.rewards?.name}</RewardName>
                        <MetaRow>
                          <RewardCost>-{redemption.rewards?.points_required || redemption.points_cost} pts</RewardCost>
                          <TimerChip $expired={isExpired}>
                            <BsClockHistory />
                            {isExpired ? 'Listo para cerrar' : formatCountdownShort(redemption.timer_ends_at)}
                          </TimerChip>
                        </MetaRow>
                        <TimerDetails>
                          Inició: {formatDateTimeES(redemption.timer_started_at) || 'Sin registrar'}
                        </TimerDetails>
                        <TimerDetails>
                          Termina: {formatDateTimeES(redemption.timer_ends_at) || 'Sin registrar'}
                        </TimerDetails>
                      </RequestInfo>

                      <ActionButtons>
                        <RejectButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'cancel' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsStopFill /> Cancelar
                        </RejectButton>
                        <ApproveButton
                          onClick={() => resolveRedemption({ id: redemption.id, action: 'finish' })}
                          disabled={isResolvingRedemption}
                        >
                          <BsFlagFill /> Finalizar
                        </ApproveButton>
                      </ActionButtons>
                    </ActiveCard>
                  )
                })}
              </Section>
            )}
          </>
        )}
      </ContentSection>
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`
const ContentSection = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`
const SectionTitle = styled.h3`
  margin: 0;
  padding: 0 4px;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const EmptyText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 40px 20px;
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`
const RequestCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const ActiveCard = styled(RequestCard)`
  border-color: ${({ theme }) => `${theme.colors.success}55`};
`
const RequestInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textSecondary};
  img { width: 100%; height: 100%; object-fit: cover; }
`
const UserName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`
const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const RewardName = styled.h4`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const RewardCost = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.warning};
`
const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`
const TimerChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $expired, theme }) => ($expired ? theme.colors.danger : theme.colors.primary)};
  background: ${({ $expired, theme }) => ($expired ? `${theme.colors.danger}14` : `${theme.colors.primary}15`)};
`
const DeliveryChip = styled(TimerChip)`
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => `${theme.colors.success}15`};
`
const TimerDetails = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`
const BaseButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`
const RejectButton = styled(BaseButton)`
  background: ${({ theme }) => `${theme.colors.danger}15`};
  color: ${({ theme }) => theme.colors.danger};
`
const ApproveButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
`
