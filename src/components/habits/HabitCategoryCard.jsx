/**
 * Tarjeta de categoría de hábito con estados completado/pendiente/bloqueado
 * Muestra diferente diseño y animación según el estado
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsCheckCircleFill, BsLockFill, BsClockFill } from 'react-icons/bs';
import * as Icons from 'react-icons/bs';
import { HABIT_LABELS, HABIT_COLORS, HABIT_ICONS } from '../../constants/habits.constants';
import { getModuleTimeRules } from '../../utils/time-based-rules.utils';

// Mapeo de habitKey a moduleKey para las reglas de tiempo
const HABIT_TO_MODULE_KEY = {
  'morning-routine': 'morning',
  'night-routine': 'night',
  'phone-use': 'phone',
  movement: 'movement',
  food: 'food',
  study: 'study',
  cleaning: 'cleaning',
  coexistence: 'coexistence',
  household: 'household',
  sleep: 'sleep', // Legacy
};

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
  
  // Obtener reglas de tiempo para este módulo
  const moduleKey = HABIT_TO_MODULE_KEY[habitKey];
  const timeRules = moduleKey ? getModuleTimeRules(moduleKey) : { isOutOfHours: false };
  const isBlocked = timeRules.isOutOfHours;
  
  // Determinar la etiqueta de estado
  let resolvedStatusLabel;
  if (isBlocked) {
    resolvedStatusLabel = `🔒 ${timeRules.availableHours || 'No disponible'}`;
  } else if (statusLabel) {
    resolvedStatusLabel = statusLabel;
  } else if (isCompleted) {
    resolvedStatusLabel = '✓ Listo';
  } else if (isInProgress) {
    resolvedStatusLabel = 'En progreso';
  } else {
    resolvedStatusLabel = 'Pendiente';
  }

  const handleClick = () => {
    if (!isBlocked && onClick) {
      onClick();
    }
  };

  return (
    <Card
      color={color}
      $isCompleted={isCompleted}
      $isInProgress={isInProgress}
      $isBlocked={isBlocked}
      onClick={handleClick}
      whileTap={isBlocked ? {} : { scale: 0.95 }}
      animate={{ scale: isCompleted ? [1, 1.08, 0.96, 1.02, 1] : isInProgress ? [1, 1.03, 0.99, 1] : 1 }}
      transition={{ duration: 0.4 }}
    >
      <ColorBar color={color} $progressPct={isBlocked ? 0 : progressPct} $isBlocked={isBlocked} />

      <CardContent>
        <IconWrapper color={color} $isBlocked={isBlocked}>
          {IconComponent && <IconComponent size={28} />}
        </IconWrapper>

        <HabitName color={color} $isCompleted={isCompleted} $isInProgress={isInProgress} $isBlocked={isBlocked}>
          {HABIT_LABELS[habitKey]}
        </HabitName>

        <StatusBadge 
          color={color} 
          $isCompleted={isCompleted} 
          $isInProgress={isInProgress}
          $isBlocked={isBlocked}
        >
          {resolvedStatusLabel}
        </StatusBadge>

        {progressLabel && !isBlocked && <ProgressLabel>{progressLabel}</ProgressLabel>}
      </CardContent>

      {isCompleted && !isBlocked && (
        <CheckIcon>
          <BsCheckCircleFill size={16} />
        </CheckIcon>
      )}
      
      {isBlocked && (
        <LockIcon>
          <BsLockFill size={14} />
        </LockIcon>
      )}
    </Card>
  );
};

// Styled Components

const Card = styled(motion.div)`
  background: ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.colors.background : 
    $isCompleted ? `${color}14` : 
    $isInProgress ? `${color}0E` : 
    theme.colors.surface};
  border: ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? `1px solid ${theme.colors.border}` :
    $isCompleted ? `1.5px solid ${color}66` :
    $isInProgress ? `1.5px solid ${color}40` :
    `1px solid ${theme.colors.border}`};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: ${({ $isBlocked }) => $isBlocked ? 'not-allowed' : 'pointer'};
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s ease;
  opacity: ${({ $isBlocked }) => $isBlocked ? 0.7 : 1};

  &:hover {
    box-shadow: ${({ $isBlocked, theme }) => $isBlocked ? 'none' : theme.shadows.hover};
  }
`;

const ColorBar = styled.div`
  height: 4px;
  background: ${({ $isBlocked, color, $progressPct, theme }) =>
    $isBlocked 
      ? theme.colors.border
      : `linear-gradient(
          to right,
          ${color} 0%,
          ${color} ${$progressPct ?? 100}%,
          rgba(148, 163, 184, 0.22) ${$progressPct ?? 100}%,
          rgba(148, 163, 184, 0.22) 100%
        )`};
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
  color: ${({ color, $isBlocked, theme }) => $isBlocked ? theme.colors.textSecondary : color};
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $isBlocked }) => $isBlocked ? 0.5 : 1};
`;

const HabitName = styled.h4`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.colors.textSecondary :
    $isCompleted || $isInProgress ? color : 
    theme.colors.textPrimary};
  margin: 0;
  text-align: center;
`;

const StatusBadge = styled.p`
  font-size: 11px;
  font-weight: ${({ $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.typography.weights.medium :
    $isCompleted || $isInProgress ? theme.typography.weights.bold : 
    theme.typography.weights.normal};
  color: ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.colors.textSecondary :
    $isCompleted || $isInProgress ? color : 
    theme.colors.textSecondary};
  background: ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.colors.border :
    $isCompleted ? `${color}18` : 
    $isInProgress ? `${color}14` : 
    theme.colors.background};
  border: 1px solid ${({ color, $isCompleted, $isInProgress, $isBlocked, theme }) =>
    $isBlocked ? theme.colors.border :
    $isCompleted ? `${color}44` : 
    $isInProgress ? `${color}33` : 
    theme.colors.border};
  border-radius: 999px;
  padding: 4px 8px;
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

const LockIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: ${({ theme }) => theme.colors.warning};
`;

export default HabitCategoryCard;
