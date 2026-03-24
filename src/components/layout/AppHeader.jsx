/**
 * Header sticky para cada pantalla.
 * Soporta botón de back, título, color personalizado y acción derecha.
 * Incluye toggle de tema oscuro/claro.
 */

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsSunFill, BsMoonFill } from 'react-icons/bs';
import useThemeStore from '../../stores/useThemeStore';

const AppHeader = ({
  title,
  showBack = false,
  onBack,
  color,
  rightAction,
}) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useThemeStore();

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
          &#8592;
        </BackButton>
      )}

      <Title $hasColor={!!color}>{title}</Title>

      <RightSection>
        {rightAction}
        <ThemeToggle
          onClick={toggleTheme}
          whileTap={{ scale: 0.85 }}
          $hasColor={!!color}
        >
          {isDark ? (
            <BsSunFill color="#F59E0B" size={20} />
          ) : (
            <BsMoonFill color={color ? '#FFFFFF' : '#64748B'} size={20} />
          )}
        </ThemeToggle>
      </RightSection>
    </Header>
  );
};

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: ${({ $color, theme }) => $color || theme.colors.surface};
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

const BackButton = styled(motion.button)`
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: 700;
  color: ${({ $hasColor, theme }) =>
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
  color: ${({ $hasColor, theme }) =>
    $hasColor ? theme.colors.surface : theme.colors.textPrimary};
  text-align: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThemeToggle = styled(motion.button)`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
`;

export { AppHeader };
export default AppHeader;
