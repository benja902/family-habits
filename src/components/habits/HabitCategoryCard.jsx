/**
 * Tarjeta de categoría de hábito con estados completado/pendiente
 * Muestra diferente diseño y animación según el estado
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsCheckCircleFill } from 'react-icons/bs';
import * as Icons from 'react-icons/bs';
import { theme } from '../../styles/theme';
import { HABIT_LABELS, HABIT_COLORS, HABIT_ICONS } from '../../constants/habits.constants';

const HabitCategoryCard = ({ habitKey, isCompleted, onClick }) => {
  const color = HABIT_COLORS[habitKey];
  const IconComponent = Icons[HABIT_ICONS[habitKey]];

  return (
    <Card
      color={color}
      $isCompleted={isCompleted}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: isCompleted ? [1, 1.08, 0.96, 1.02, 1] : 1 }}
      transition={{ duration: 0.4 }}
    >
      <ColorBar color={color} />

      <CardContent>
        <IconWrapper color={color}>
          {IconComponent && <IconComponent size={28} />}
        </IconWrapper>

        <HabitName color={color} $isCompleted={isCompleted}>
          {HABIT_LABELS[habitKey]}
        </HabitName>

        <StatusText color={color} $isCompleted={isCompleted}>
          {isCompleted ? '✓ Listo' : 'Pendiente'}
        </StatusText>
      </CardContent>

      {isCompleted && (
        <CheckIcon>
          <BsCheckCircleFill size={16} />
        </CheckIcon>
      )}
    </Card>
  );
};

// Styled Components

const Card = styled(motion.div)`
  background: ${({ color, $isCompleted, theme }) =>
    $isCompleted ? `${color}14` : theme.colors.surface}; /* 8% opacidad = 14 en hex */
  border: ${({ color, $isCompleted, theme }) =>
    $isCompleted
      ? `1.5px solid ${color}66` /* 40% opacidad = 66 en hex */
      : `1px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const ColorBar = styled.div`
  height: 4px;
  background: ${({ color }) => color};
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const IconWrapper = styled.div`
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
`;

const HabitName = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ color, $isCompleted, theme }) =>
    $isCompleted ? color : theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

const StatusText = styled.p`
  font-size: 12px;
  font-weight: ${({ $isCompleted, theme }) =>
    $isCompleted ? theme.typography.weights.bold : theme.typography.weights.normal};
  color: ${({ color, $isCompleted, theme }) =>
    $isCompleted ? color : theme.colors.textSecondary};
  margin: 0;
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: ${({ theme }) => theme.colors.success};
`;

export default HabitCategoryCard;
