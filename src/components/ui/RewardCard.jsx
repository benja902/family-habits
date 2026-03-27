import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  BsCashCoin,
  BsController,
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
const REWARD_ICONS = {
  dinero: BsCashCoin,
  tv_extra: BsTvFill,
  elegir_pelicula: BsFilm,
  elegir_comida: BsCupHotFill,
  especial: BsStarFill
}

function resolveRewardIcon(reward) {
  const normalizedName = (reward?.name || '').toLowerCase()

  if (normalizedName.includes('videojuego')) return BsController
  if (normalizedName.includes('siesta') || normalizedName.includes('dormir')) return BsMoonStarsFill
  if (normalizedName.includes('animal')) return BsEmojiHeartEyesFill
  if (normalizedName.includes('compra')) return BsShop
  if (normalizedName.includes('yogurt') || normalizedName.includes('adoquin')) return BsGiftFill

  return REWARD_ICONS[reward?.type] || BsStarFill
}

export function RewardCard({ reward, onRedeem, userPoints = 0, isRedeeming }) {
  const Icon = resolveRewardIcon(reward)
  const canAfford = userPoints >= reward.points_required

  return (
    <Card
      $canAfford={canAfford}
      whileTap={canAfford && !isRedeeming ? { scale: 0.96 } : {}}
    >
      <IconWrapper $canAfford={canAfford}>
        <Icon size={24} />
      </IconWrapper>
      
      <Info>
        <Title $canAfford={canAfford}>{reward.name}</Title>
        {reward.description && <Description>{reward.description}</Description>}
      </Info>

      <ActionArea>
        <Cost $canAfford={canAfford}>{reward.points_required} pts</Cost>
        <RedeemButton 
          $canAfford={canAfford} 
          onClick={() => onRedeem(reward)}
          disabled={!canAfford || isRedeeming}
        >
          {!canAfford ? 'Faltan puntos' : isRedeeming ? '...' : 'Canjear'}
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
