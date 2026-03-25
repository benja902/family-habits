import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { AppHeader } from '../../components/layout/AppHeader'
import useAdmin from '../../hooks/useAdmin'
import { BsGiftFill, BsPeopleFill } from 'react-icons/bs'

export default function AdminDashboard() {
  // Traemos los datos para mostrar un pequeño resumen
  const { pendingRedemptions, familyMembers } = useAdmin()

  return (
    <Container>
      <AppHeader title="Resumen General" />
      
      <ContentSection>
        <WelcomeCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Title>¡Hola, Admin!</Title>
          <Text>Bienvenido a tu centro de mando. Desde el menú lateral puedes gestionar los premios, aplicar castigos y administrar las reglas del sistema.</Text>
        </WelcomeCard>

        <StatsGrid>
          <StatBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <IconWrapper $color="#F59E0B">
              <BsGiftFill size={24} />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{pendingRedemptions.length}</StatNumber>
              <StatLabel>Premios Pendientes</StatLabel>
            </StatInfo>
          </StatBox>

          <StatBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <IconWrapper $color="#3B82F6">
              <BsPeopleFill size={24} />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{familyMembers.length}</StatNumber>
              <StatLabel>Usuarios Activos</StatLabel>
            </StatInfo>
          </StatBox>
        </StatsGrid>
      </ContentSection>
    </Container>
  )
}

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`
const ContentSection = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`
const WelcomeCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 24px;
  padding: 32px 24px;
  color: white;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
`
const Title = styled.h2`
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 900;
`
const Text = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  opacity: 0.9;
`
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`
const StatBox = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};
`
const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
`
const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`
const StatNumber = styled.span`
  font-size: 24px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
  margin-bottom: 4px;
`
const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`