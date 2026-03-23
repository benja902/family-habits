/**
 * Header sticky para cada pantalla.
 * Soporta botón de back, título, color personalizado y acción derecha.
 */

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const AppHeader = ({
  title,
  showBack = false,
  onBack,
  color,
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Header $color={color}>
      {showBack && (
        <BackButton
          onClick={handleBack}
          whileTap={{ scale: 0.9 }}
          $hasColor={!!color}
        >
          ←
        </BackButton>
      )}

      <Title $hasColor={!!color}>{title}</Title>

      {rightAction && <RightAction>{rightAction}</RightAction>}
    </Header>
  );
};

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: ${({ $color }) => $color || theme.colors.surface};
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${theme.spacing.md};
  gap: ${theme.spacing.md};
`;

const BackButton = styled(motion.button)`
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: 700;
  color: ${({ $hasColor }) =>
    $hasColor ? theme.colors.surface : theme.colors.textPrimary};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

const Title = styled.h1`
  flex: 1;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: ${({ $hasColor }) =>
    $hasColor ? theme.colors.surface : theme.colors.textPrimary};
  text-align: center;
`;

const RightAction = styled.div`
  display: flex;
  align-items: center;
`;

export { AppHeader };
export default AppHeader;
