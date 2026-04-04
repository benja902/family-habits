import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsLockFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

/**
 * Pantalla de bloqueo para módulos fuera de horario
 * Se muestra cuando el usuario intenta acceder a un módulo bloqueado
 * NOTA: No incluye header propio - usa el AppHeader de HabitDetail
 */
export function ModuleBlockedScreen({ 
  moduleName, 
  availableHours, 
  icon,
  accentColor 
}) {
  const navigate = useNavigate()
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Content>
        <IconContainer $color={accentColor}>
          <IconWrapper>{icon}</IconWrapper>
          <LockBadge>
            <BsLockFill />
          </LockBadge>
        </IconContainer>
        
        <Title>Módulo no disponible</Title>
        
        <Message>
          Este módulo está disponible de{' '}
          <Strong>{availableHours}</Strong>
        </Message>
        
        <BackToDashboard 
          onClick={() => navigate('/dashboard')}
          whileTap={{ scale: 0.96 }}
          $color={accentColor}
        >
          Volver al Dashboard
        </BackToDashboard>
      </Content>
    </Container>
  )
}

const Container = styled(motion.div)`
  min-height: calc(100vh - 60px);
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  gap: ${({ theme }) => theme.spacing.lg};
`

const IconContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ $color, theme }) => `${$color || theme.colors.primary}15`};
  display: flex;
  align-items: center;
  justify-content: center;
`

const IconWrapper = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.5;
`

const LockBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.warning};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`

const Strong = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`

const BackToDashboard = styled(motion.button)`
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
`
