import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsTrophyFill } from 'react-icons/bs'
import { FaCrown } from 'react-icons/fa'
import { PageContainer } from '../components/layout/PageContainer'
import { AppHeader } from '../components/layout/AppHeader'
import useRanking from '../hooks/useRanking'
import { useAuthStore } from '../stores/useAuthStore'

export default function Ranking() {
  const { ranking, isLoading } = useRanking()
  const { currentUser } = useAuthStore()

  if (isLoading) {
    return (
      <PageContainer>
        <AppHeader title="Ranking Familiar" />
        <LoadingText>Calculando posiciones...</LoadingText>
      </PageContainer>
    )
  }

  // Separar Top 3 del resto
  const top3 = ranking.slice(0, 3)
  const restOfFamily = ranking.slice(3)

  // Configuración EXACTA por posición (0 = 1ro, 1 = 2do, 2 = 3ro)
  const PODIUM_CONFIG = {
    0: { height: '180px', color: '#F59E0B', crownColor: '#F59E0B', delay: 0.3 }, // Oro
    1: { height: '140px', color: '#94A3B8', crownColor: '#94A3B8', delay: 0.1 }, // Plata
    2: { height: '110px', color: '#B45309', crownColor: '#B45309', delay: 0.5 }, // Bronce
  }

  // Orden visual en pantalla de izquierda a derecha: 2do lugar, 1er lugar, 3er lugar
  const visualOrder = [1, 0, 2] 

  return (
    <PageContainer>
      <AppHeader title="Ranking Familiar" />

      <PodiumSection>
        <PodiumContainer>
          {visualOrder.map((rankIndex) => {
            const user = top3[rankIndex]
            if (!user) return <PodiumSlot key={`empty-${rankIndex}`} />

            const isFirst = rankIndex === 0
            const isMe = user.id === currentUser?.id
            const config = PODIUM_CONFIG[rankIndex]

            return (
              <PodiumSlot key={user.id}>
                <AvatarWrapper
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: config.delay }}
                >
                  <CrownWrapper
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: config.delay + 0.3, type: 'spring', bounce: 0.6 }}
                    $color={config.crownColor}
                    $isFirst={isFirst}
                  >
                    <FaCrown />
                  </CrownWrapper>

                  {/* 👇 ACTUALIZADO: AHORA MUESTRA FOTO 👇 */}
                  <AvatarContainer $isFirst={isFirst} $isMe={isMe} $borderColor={config.color}>
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    ) : (
                      // Fallback si no hay foto
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    )}
                  </AvatarContainer>

                  <Name>{user.name}</Name>
                  <Points>{user.totalEarned.toLocaleString()} pts</Points>
                </AvatarWrapper>

                <PodiumBar
                  $height={config.height}
                  $color={config.color}
                  initial={{ height: 0 }}
                  animate={{ height: config.height }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.1 }}
                >
                  <PositionLabel $isFirst={isFirst}>
                    {rankIndex + 1}
                  </PositionLabel>
                </PodiumBar>
              </PodiumSlot>
            )
          })}
        </PodiumContainer>
      </PodiumSection>

      <ListSection>
        {restOfFamily.map((user, index) => {
          const position = index + 4
          const isMe = user.id === currentUser?.id

          return (
            <ListItem 
              key={user.id} 
              $isMe={isMe}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <PositionCircle>{position}</PositionCircle>
              
              {/* 👇 ACTUALIZADO: AHORA MUESTRA FOTO EN LA LISTA 👇 */}
              <ListAvatarContainer $isMe={isMe}>
                {user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </ListAvatarContainer>

              <ListName $isMe={isMe}>{user.name}</ListName>
              <ListPoints>{user.totalEarned.toLocaleString()} pts</ListPoints>
            </ListItem>
          )
        })}
      </ListSection>
    </PageContainer>
  )
}

// ==================== STYLED COMPONENTS ====================

const LoadingText = styled.p` text-align: center; padding: 40px; color: ${({ theme }) => theme.colors.textSecondary}; `

const PodiumSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 360px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 16px;
  margin-bottom: 24px;
`

const PodiumContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 400px;
`

const PodiumSlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
`

const AvatarWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
`

const CrownWrapper = styled(motion.div)`
  color: ${({ $color }) => $color};
  font-size: ${({ $isFirst }) => ($isFirst ? '32px' : '22px')};
  margin-bottom: -10px;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
`

// Contenedor principal del avatar (ahora es solo el marco con borde)
const AvatarContainer = styled.div`
  width: ${({ $isFirst }) => ($isFirst ? '68px' : '52px')};
  height: ${({ $isFirst }) => ($isFirst ? '68px' : '52px')};
  border-radius: 50%;
  background: ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.border)};
  border: 4px solid ${({ $borderColor }) => $borderColor};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.card};
  margin-bottom: 8px;
  z-index: 5;
  overflow: hidden; /* Importante para que la foto no se salga */
`

// Componente para la foto real
const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ajusta la foto sin deformarla */
`

// Estilo para cuando no hay foto y mostramos la inicial
const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white; /* Asumimos fondo de color */
  font-weight: 800;
  font-size: inherit; /* Hereda del padre (68px/52px) */
`

const Name = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`

const Points = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const PodiumBar = styled(motion.div)`
  width: 100%;
  background: ${({ $color }) => $color};
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 16px;
  box-shadow: inset 0 10px 20px rgba(255, 255, 255, 0.25);
`

const PositionLabel = styled.span`
  font-size: ${({ $isFirst }) => ($isFirst ? '56px' : '40px')};
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
`

const ListItem = styled(motion.div)`
  display: flex;
  align-items: center;
  background: ${({ $isMe, theme }) => ($isMe ? `${theme.colors.primary}15` : theme.colors.surface)};
  border: 1px solid ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.border)};
  padding: 12px 16px;
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`

const PositionCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  margin-right: 12px;
`

// Contenedor del avatar en la lista
const ListAvatarContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.border)};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  margin-right: 12px;
  overflow: hidden;
`

const ListName = styled.span`
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: ${({ $isMe, theme }) => ($isMe ? theme.colors.primary : theme.colors.textPrimary)};
`

const ListPoints = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textSecondary};
`