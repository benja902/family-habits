import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsCheckLg, BsXLg, BsPersonFill } from 'react-icons/bs'
import useAdmin from '../../hooks/useAdmin'
import { formatDateES } from '../../utils/dates.utils'

export default function AdminRewards() {
  const { pendingRedemptions, isLoadingRedemptions, resolveRedemption, isResolvingRedemption } = useAdmin()

  return (
    <Section>
      <SectionTitle>Solicitudes de Dinero</SectionTitle>
      
      {isLoadingRedemptions ? (
        <EmptyText>Buscando solicitudes...</EmptyText>
      ) : pendingRedemptions.length === 0 ? (
        <EmptyText>No hay premios pendientes de aprobación. ¡Todo al día!</EmptyText>
      ) : (
        pendingRedemptions.map((redemption) => (
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
              <RewardCost>-{redemption.points_cost} pts</RewardCost>
            </RequestInfo>

            <ActionButtons>
              <RejectButton 
                onClick={() => resolveRedemption({ id: redemption.id, newStatus: 'rechazado' })}
                disabled={isResolvingRedemption}
              >
                <BsXLg /> Rechazar
              </RejectButton>
              <ApproveButton 
                onClick={() => resolveRedemption({ id: redemption.id, newStatus: 'aprobado' })}
                disabled={isResolvingRedemption}
              >
                <BsCheckLg /> Aprobar
              </ApproveButton>
            </ActionButtons>
          </RequestCard>
        ))
      )}
    </Section>
  )
}

// ==================== STYLED COMPONENTS DE PREMIOS ====================
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 8px 0;
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
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
`
const RejectButton = styled(BaseButton)`
  background: ${({ theme }) => `${theme.colors.danger}15`};
  color: ${({ theme }) => theme.colors.danger};
`
const ApproveButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.success};
  color: white;
`