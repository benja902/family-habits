/**
 * Anillo de progreso animado para el Dashboard.
 * Muestra el progreso del día como un anillo circular.
 */

import { motion } from 'framer-motion';
import styled from 'styled-components';

const ProgressRing = ({ size = 130, progress = 0, color = '#6366F1', strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <Container size={size}>
      <Svg width={size} height={size}>
        {/* Ring de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Ring de progreso animado */}
        <ProgressCircle
          as={motion.circle}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1], // cubic-bezier de CLAUDE.md
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Texto del porcentaje en el centro */}
      <ProgressText
        as={motion.div}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {Math.round(progress)}%
      </ProgressText>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Svg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
`;

const Circle = styled.circle`
  stroke: ${({ theme }) => theme.colors.border};
  transition: stroke 0.3s ease;
`;

const ProgressCircle = styled.circle`
  transition: stroke-dashoffset 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
  line-height: 1;
`;

export { ProgressRing };
export default ProgressRing;
