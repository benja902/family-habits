import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BsCheckCircleFill, BsClockHistory, BsGiftFill, BsSlashCircleFill, BsStopFill } from 'react-icons/bs'
import { PageContainer } from '../components/layout/PageContainer'
import { AppHeader } from '../components/layout/AppHeader'
import { RewardCard } from '../components/ui/RewardCard'
import useRewards from '../hooks/useRewards'
import usePoints from '../hooks/usePoints'
import { formatCountdownShort, formatDateES, formatDateTimeES, getCountdownParts } from '../utils/dates.utils'

export default function Rewards() {
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' o 'history'
  const [, setNow] = useState(0)
  
  const { 
    rewards, isLoadingRewards, 
    redemptions, isLoadingRedemptions, 
    redeemReward, isRedeeming 
  } = useRewards()
  
  const { balance, isLoading: isLoadingPoints, formattedMoney } = usePoints()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const handleRedeem = (reward) => {
    redeemReward({
      rewardId: reward.id,
      rewardCost: reward.points_required,
    })
  }

  // Función para darle estilo y texto a cada estado del canje
  const getStatusConfig = (redemption) => {
    const countdown = getCountdownParts(redemption.timer_ends_at)

    switch(redemption.status) {
      case 'pendiente': return { label: 'En revisión', color: '#F59E0B', icon: <BsClockHistory /> }
      case 'aprobado': return { label: 'Aprobado', color: '#3B82F6', icon: <BsCheckCircleFill /> }
      case 'activo':
        return countdown.isExpired
          ? { label: 'Tiempo agotado', color: '#EF4444', icon: <BsClockHistory /> }
          : { label: `Activo · ${formatCountdownShort(redemption.timer_ends_at)}`, color: '#3B82F6', icon: <BsClockHistory /> }
      case 'finalizado': return { label: 'Finalizado', color: '#22C55E', icon: <BsCheckCircleFill /> }
      case 'cancelado': return { label: 'Cancelado', color: '#EF4444', icon: <BsStopFill /> }
      case 'rechazado': return { label: 'Rechazado', color: '#EF4444', icon: <BsSlashCircleFill /> }
      case 'entregado': return { label: 'Entregado', color: '#22C55E', icon: <BsGiftFill /> }
      default: return { label: redemption.status, color: '#64748B', icon: null }
    }
  }

  return (
    <PageContainer>
      <AppHeader title="Premios" />
      
      <PointsHeader>
        <PointsLabel>Puntos disponibles</PointsLabel>
        <PointsValue>
          {isLoadingPoints ? '...' : balance.toLocaleString('es-PE')} pts
        </PointsValue>
        {!isLoadingPoints && <MoneyEquivalence>Equivale a {formattedMoney}</MoneyEquivalence>}
        <ApprovalText>Todos los canjes requieren aprobación del admin.</ApprovalText>
      </PointsHeader>

      <ToggleContainer>
        <ToggleButton 
          $isActive={activeTab === 'catalog'} 
          onClick={() => setActiveTab('catalog')}
        >
          Catálogo
        </ToggleButton>
        <ToggleButton 
          $isActive={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          Mis Canjes
        </ToggleButton>
      </ToggleContainer>

      <ContentSection>
        {activeTab === 'catalog' ? (
          // ================= PESTAÑA CATÁLOGO =================
          isLoadingRewards ? (
            <EmptyText>Cargando tienda...</EmptyText>
          ) : rewards.length === 0 ? (
            <EmptyText>Aún no hay premios disponibles.</EmptyText>
          ) : (
            rewards.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                onRedeem={handleRedeem}
                userPoints={balance}
                isRedeeming={isRedeeming}
              />
            ))
          )
        ) : (
          // ================= PESTAÑA HISTORIAL =================
          isLoadingRedemptions ? (
            <EmptyText>Cargando tu historial...</EmptyText>
          ) : redemptions.length === 0 ? (
            <EmptyText>Aún no has canjeado ningún premio.</EmptyText>
          ) : (
            redemptions.map((redemption) => {
              const statusConfig = getStatusConfig(redemption)
              // Extraemos el nombre del premio usando la relación de Supabase
              const rewardName = redemption.rewards?.name || 'Premio eliminado'
              const isTimedReward = Boolean(redemption.rewards?.is_timed || redemption.duration_minutes_snapshot)

              return (
                <HistoryItem key={redemption.id}>
                  <HistoryInfo>
                    <HistoryTitle>{rewardName}</HistoryTitle>
                    <HistoryDate>{formatDateES(redemption.created_at.split('T')[0])}</HistoryDate>
                    {isTimedReward && redemption.timer_started_at ? (
                      <HistoryMeta>Inició: {formatDateTimeES(redemption.timer_started_at)}</HistoryMeta>
                    ) : null}
                    {isTimedReward && redemption.timer_ends_at ? (
                      <HistoryMeta>Termina: {formatDateTimeES(redemption.timer_ends_at)}</HistoryMeta>
                    ) : null}
                  </HistoryInfo>
                  
                  <HistoryRight>
                    {/* CORRECCIÓN AQUÍ: Leemos el costo desde la relación */}
                    <HistoryCost>-{redemption.rewards?.points_required} pts</HistoryCost>
                    <StatusBadge $color={statusConfig.color}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </StatusBadge>
                    {isTimedReward && redemption.duration_minutes_snapshot ? (
                      <DurationText>{redemption.duration_minutes_snapshot} min</DurationText>
                    ) : null}
                  </HistoryRight>
                </HistoryItem>
              )
            })
          )
        )}
      </ContentSection>
    </PageContainer>
  )
}

// ==================== STYLED COMPONENTS ====================
const PointsHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 24px 16px; display: flex; flex-direction: column;
  align-items: center; border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`
const PointsLabel = styled.span`
  font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
`
const PointsValue = styled.span`
  font-size: 40px; font-weight: 900; color: ${({ theme }) => theme.colors.warning};
  line-height: 1;
`
const MoneyEquivalence = styled.span`
  font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.success};
  margin-top: 8px; background: ${({ theme }) => `${theme.colors.success}15`};
  padding: 4px 12px; border-radius: 12px;
`
const ApprovalText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warning};
  margin-top: 10px;
`
const ToggleContainer = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.border};
  border-radius: 12px; padding: 4px; margin: 16px 16px 8px 16px;
`
const ToggleButton = styled.button`
  flex: 1; padding: 8px 0; border-radius: 8px; border: none; font-size: 14px;
  font-weight: 700; cursor: pointer; transition: all 0.2s ease;
  background: ${({ $isActive, theme }) => ($isActive ? theme.colors.surface : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadows.card : 'none')};
`
const ContentSection = styled.div`
  padding: 16px; padding-bottom: 100px;
`
const EmptyText = styled.p`
  text-align: center; color: ${({ theme }) => theme.colors.textSecondary}; padding: 24px;
`
const HistoryItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px; padding: 16px; margin-bottom: 12px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
`
const HistoryInfo = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`
const HistoryTitle = styled.span`
  font-size: 15px; font-weight: 800; color: ${({ theme }) => theme.colors.textPrimary};
`
const HistoryDate = styled.span`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
`
const HistoryMeta = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`
const HistoryRight = styled.div`
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
`
const HistoryCost = styled.span`
  font-size: 15px; font-weight: 900; color: ${({ theme }) => theme.colors.danger};
`
const StatusBadge = styled.div`
  display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800;
  color: ${({ $color }) => $color}; background: ${({ $color }) => `${$color}15`};
  padding: 4px 8px; border-radius: 8px;
`
const DurationText = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`
