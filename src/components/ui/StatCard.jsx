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
      <Value color={color}>{value}</Value>
      <Label>{label}</Label>
    </Card>
  );
};

// Styled Components

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.card};
  padding: ${theme.spacing[24]};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[8]};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${theme.shadows.hover};
  }
`;

const Icon = styled.div`
  font-size: ${theme.typography.sizes.xl};
  margin-bottom: ${theme.spacing[4]};
`;

const Value = styled.div`
  font-size: ${theme.typography.sizes.display};
  font-weight: 700;
  color: ${(props) => props.color};
`;

const Label = styled.div`
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
`;

export default StatCard;
