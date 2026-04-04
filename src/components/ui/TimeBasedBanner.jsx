/**
 * Banner contextual que muestra estado del módulo según horario del día.
 * Usado para motivar o advertir al usuario sobre el mejor momento para registrar.
 */

import styled from 'styled-components'
import { motion } from 'framer-motion'
import { BsClockFill, BsExclamationTriangleFill, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs'

/**
 * TimeBasedBanner - Componente de banner contextual
 * @param {string} type - Tipo de banner: 'blocked' | 'warning' | 'suggested'
 * @param {string} message - Mensaje a mostrar (opcional si hay badge)
 * @param {string} badge - Badge motivacional (opcional si hay message)
 * @returns {JSX.Element|null}
 */
export function TimeBasedBanner({ type = 'warning', message, badge }) {
  // Si no hay mensaje ni badge, no renderizar nada
  if (!message && !badge) return null
  
  // Configuración por tipo de banner
  const config = {
    blocked: { 
      bg: '#EF4444',
      color: '#FFFFFF',
      icon: <BsXCircleFill size={18} />
    },
    warning: { 
      bg: '#F59E0B',
      color: '#FFFFFF',
      icon: <BsClockFill size={18} />
    },
    suggested: { 
      bg: '#22C55E',
      color: '#FFFFFF',
      icon: <BsCheckCircleFill size={18} />
    }
  }
  
  const { bg, color, icon } = config[type] || config.warning
  
  return (
    <Banner
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      $bgColor={bg}
      $textColor={color}
    >
      <IconWrapper>{icon}</IconWrapper>
      <Message>{badge || message}</Message>
    </Banner>
  )
}

// ==================== STYLED COMPONENTS ====================

const Banner = styled(motion.div)`
  background: ${({ $bgColor }) => $bgColor};
  color: ${({ $textColor }) => $textColor};
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (min-width: 768px) {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    padding: 16px 24px;
  }
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Message = styled.span`
  flex: 1;
  text-align: center;
  line-height: 1.4;
`
