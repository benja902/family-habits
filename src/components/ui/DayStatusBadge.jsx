/**
 * Badge del estado del día según los puntos acumulados.
 * Muestra un estado colorido: excelente, bien, regular, crítico, sin iniciar.
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DAY_STATUS_LABELS, DAY_STATUS_COLORS } from '../../constants/points.constants';

const DayStatusBadge = ({ status = 'sin iniciar' }) => {
  const label = DAY_STATUS_LABELS[status] || 'Sin iniciar';
  const color = DAY_STATUS_COLORS[status] || '#64748B';

  return (
    <Badge
      as={motion.div}
      $color={color}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      {label}
    </Badge>
  );
};

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  color: white;
  background: ${({ $color }) => $color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
`;

export { DayStatusBadge };
export default DayStatusBadge;