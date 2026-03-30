/**
 * Tarjeta de categoría de hábito con estados completado/pendiente
 * Muestra diferente diseño y animación según el estado
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsCheckCircleFill } from 'react-icons/bs';
import * as Icons from 'react-icons/bs';
import { HABIT_LABELS, HABIT_COLORS, HABIT_ICONS } from '../../constants/habits.constants';

const HabitCategoryCard = ({
  habitKey,
  isCompleted,
  isInProgress = false,
  statusLabel,
  progressPct,
  progressLabel,
  onClick,
}) => {
  const color = HABIT_COLORS[habitKey];
  const IconComponent = Icons[HABIT_ICONS[habitKey]];
  const resolvedStatusLabel = statusLabel || (isCompleted ? '✓ Listo' : isInProgress ? 'En progreso' : 'Pendiente')

  return (
    <Card
      color={color}
      $isCompleted={isCompleted}
      $isInProgress={isInProgress}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: isCompleted ? [1, 1.08, 0.96, 1.02, 1] : isInProgress ? [1, 1.03, 0.99, 1] : 1 }}
      transition={{ duration: 0.4 }}
    >
      <ColorBar color={color} $progressPct={progressPct} />

      <CardContent>
        <IconWrapper color={color}>
          {IconComponent && <IconComponent size={28} />}
        </IconWrapper>

        <HabitName color={color} $isCompleted={isCompleted} $isInProgress={isInProgress}>
          {HABIT_LABELS[habitKey]}
        </HabitName>

        <StatusBadge color={color} $isCompleted={isCompleted} $isInProgress={isInProgress}>
          {resolvedStatusLabel}
        </StatusBadge>

        {progressLabel && <ProgressLabel>{progressLabel}</ProgressLabel>}
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
  background: ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted ? `${color}14` : $isInProgress ? `${color}0E` : theme.colors.surface};
  border: ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted
      ? `1.5px solid ${color}66`
      : $isInProgress
        ? `1.5px solid ${color}40`
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
  background:
    linear-gradient(
      to right,
      ${({ color }) => color} 0%,
      ${({ color }) => color} ${({ $progressPct }) => `${$progressPct ?? 100}%`},
      rgba(148, 163, 184, 0.22) ${({ $progressPct }) => `${$progressPct ?? 100}%`},
      rgba(148, 163, 184, 0.22) 100%
    );
  transition: background 0.35s ease;
`;

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-align: center;
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
  color: ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted || $isInProgress ? color : theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

const StatusBadge = styled.p`
  font-size: 12px;
  font-weight: ${({ $isCompleted, $isInProgress, theme }) =>
    $isCompleted || $isInProgress ? theme.typography.weights.bold : theme.typography.weights.normal};
  color: ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted || $isInProgress ? color : theme.colors.textSecondary};
  background: ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted ? `${color}18` : $isInProgress ? `${color}14` : theme.colors.background};
  border: 1px solid ${({ color, $isCompleted, $isInProgress, theme }) =>
    $isCompleted ? `${color}44` : $isInProgress ? `${color}33` : theme.colors.border};
  border-radius: 999px;
  padding: 4px 10px;
  margin: 0;
`;

const ProgressLabel = styled.p`
  margin: 0;
  font-size: 10px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CheckIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: ${({ theme }) => theme.colors.success};
`;

export default HabitCategoryCard;
