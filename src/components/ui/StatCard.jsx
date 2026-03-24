/**
 * Tarjeta de estadística reutilizable.
 * Muestra un valor numérico con su etiqueta y color opcional.
 */

import styled from 'styled-components';
import { theme } from '../../styles/theme';

const StatCard = ({ label, value, color = theme.colors.textPrimary, icon }) => {
  return (
    <Card>
      {icon && <Icon>{icon}</Icon>}
      <Value $color={color}>{value}</Value>
      <Label>{label}</Label>
    </Card>
  );
};

// Styled Components

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`;

const Icon = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Value = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.display};
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const Label = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

export default StatCard;
