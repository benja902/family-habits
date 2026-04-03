import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  BsCashCoin,
  BsController,
  BsClockHistory,
  BsCupHotFill,
  BsEmojiHeartEyesFill,
  BsFilm,
  BsGiftFill,
  BsMoonStarsFill,
  BsShop,
  BsStarFill,
  BsTvFill,
} from 'react-icons/bs'

// Asignamos un ícono automático dependiendo del tipo de premio
function renderRewardIcon(reward) {
  if ((reward?.name || '').toLowerCase().includes('videojuego')) return <BsController size={24} />
  if ((reward?.name || '').toLowerCase().includes('siesta') || (reward?.name || '').toLowerCase().includes('dormir')) return <BsMoonStarsFill size={24} />
  if ((reward?.name || '').toLowerCase().includes('animal')) return <BsEmojiHeartEyesFill size={24} />
  if ((reward?.name || '').toLowerCase().includes('compra')) return <BsShop size={24} />
  if ((reward?.name || '').toLowerCase().includes('yogurt') || (reward?.name || '').toLowerCase().includes('adoquin')) return <BsGiftFill size={24} />

  switch (reward?.type) {
    case 'dinero':
      return <BsCashCoin size={24} />
    case 'tv_extra':
      return <BsTvFill size={24} />
    case 'elegir_pelicula':
      return <BsFilm size={24} />
    case 'elegir_comida':
      return <BsCupHotFill size={24} />
    case 'especial':
      return <BsStarFill size={24} />
    default:
      return <BsStarFill size={24} />
  }
}

export function RewardCard({ reward, onRedeem, userPoints = 0, isRedeeming }) {
  const canAfford = userPoints >= reward.points_required
  const buttonLabel = !canAfford
    ? 'Faltan puntos'
    : isRedeeming
      ? '...'
      : 'Solicitar'

  return (
    <Card
      $canAfford={canAfford}
      whileTap={canAfford && !isRedeeming ? { scale: 0.96 } : {}}
    >
      <IconWrapper $canAfford={canAfford}>
        {renderRewardIcon(reward)}
      </IconWrapper>
      
      <Info>
        <Title $canAfford={canAfford}>{reward.name}</Title>
        {reward.description && <Description>{reward.description}</Description>}
        {reward.is_timed && reward.duration_minutes ? (
          <TimerHint>
            <BsClockHistory />
            Cronómetro: {reward.duration_minutes} min
          </TimerHint>
        ) : null}
        <ApprovalHint>Requiere aprobación del admin.</ApprovalHint>
      </Info>

      <ActionArea>
        <Cost $canAfford={canAfford}>{reward.points_required} pts</Cost>
        <RedeemButton 
          $canAfford={canAfford} 
          onClick={() => onRedeem(reward)}
          disabled={!canAfford || isRedeeming}
        >
          {buttonLabel}
        </RedeemButton>
      </ActionArea>
    </Card>
  )
}

// ==================== STYLED COMPONENTS ====================
const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: 1px solid ${({ $canAfford, theme }) => 
    $canAfford ? theme.colors.border : `${theme.colors.border}80`};
  opacity: ${({ $canAfford }) => ($canAfford ? 1 : 0.6)};
  margin-bottom: 12px;
`
const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $canAfford, theme }) => 
    $canAfford ? `${theme.colors.primary}15` : theme.colors.background};
  color: ${({ $canAfford, theme }) => 
    $canAfford ? theme.colors.primary : theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`
const Info = styled.div`
  flex: 1;
`
const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 800;
  color: ${({ $canAfford, theme }) => 
    $canAfford ? theme.colors.textPrimary : theme.colors.textSecondary};
`
const Description = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.3;
`
const ApprovalHint = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warning};
`
const TimerHint = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`
const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`
const Cost = styled.span`
  font-size: 15px;
  font-weight: 900;
  color: ${({ $canAfford, theme }) => 
    $canAfford ? theme.colors.warning : theme.colors.textSecondary};
`
const RedeemButton = styled.button`
  background: ${({ $canAfford, theme }) => 
    $canAfford ? theme.colors.primary : theme.colors.background};
  color: ${({ $canAfford, theme }) => 
    $canAfford ? '#FFFFFF' : theme.colors.textSecondary};
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: ${({ $canAfford }) => ($canAfford ? 'pointer' : 'not-allowed')};
`
