import React, { useState } from 'react'
import styled from 'styled-components'
import { PageContainer } from '../components/layout/PageContainer'
import { AppHeader } from '../components/layout/AppHeader'
import useRanking from '../hooks/useRanking'
import { useAuthStore } from '../stores/useAuthStore'
import { RankingPodium } from '../components/ranking/RankingPodium'
import { RankingList } from '../components/ranking/RankingList'
import { BsTrophyFill } from 'react-icons/bs'

export default function Ranking() {
  const [mode, setMode] = useState('general') // 'daily', 'weekly', 'general'
  const { ranking, isLoading } = useRanking(mode)
  const { currentUser } = useAuthStore()

  // Separar Top 3 del resto
  const top3 = ranking.slice(0, 3)
  const restOfFamily = ranking.slice(3)

  return (
    <PageContainer>
      <AppHeader title="Ranking Familiar" />

      {/* Interruptor para cambiar de ranking */}
      <ToggleContainer>
        <ToggleButton 
          $isActive={mode === 'daily'} 
          onClick={() => setMode('daily')}
        >
          Hoy
        </ToggleButton>
        <ToggleButton 
          $isActive={mode === 'weekly'} 
          onClick={() => setMode('weekly')}
        >
          Semanal
        </ToggleButton>
        <ToggleButton 
          $isActive={mode === 'general'} 
          onClick={() => setMode('general')}
        >
          General
        </ToggleButton>
      </ToggleContainer>

      {isLoading ? (
        <LoadingText>Calculando posiciones...</LoadingText>
      ) : ranking.length === 0 ? (
        <EmptyStateContainer>
          <TrophyIcon>
            <BsTrophyFill />
          </TrophyIcon>
          <EmptyTitle>¡Aún no hay puntos registrados!</EmptyTitle>
          <EmptySubtitle>Completa hábitos para aparecer en el ranking</EmptySubtitle>
        </EmptyStateContainer>
      ) : (
        <>
          <RankingPodium top3={top3} currentUser={currentUser} />
          <RankingList users={restOfFamily} currentUser={currentUser} />
        </>
      )}
    </PageContainer>
  )
}

// ==================== STYLED COMPONENTS (Solo del Layout) ====================
const LoadingText = styled.p`
  text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary};
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
const EmptyStateContainer = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; text-align: center; min-height: 400px;
`
const TrophyIcon = styled.div`
  font-size: 80px; color: ${({ theme }) => theme.points.gold};
  margin-bottom: 24px; opacity: 0.8;
`
const EmptyTitle = styled.h2`
  font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`
const EmptySubtitle = styled.p`
  font-size: 15px; color: ${({ theme }) => theme.colors.textSecondary};
`