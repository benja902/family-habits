/**
 * Navegación principal fija en la parte inferior.
 * Las 4 tabs: Hoy, Stats, Ranking, Premios.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  BsHouseFill,
  BsBarChartFill,
  BsTrophyFill,
  BsGiftFill,
} from 'react-icons/bs';

const TABS = [
  { id: 'dashboard', label: 'Hoy', path: '/dashboard', Icon: BsHouseFill },
  { id: 'stats', label: 'Stats', path: '/stats', Icon: BsBarChartFill },
  { id: 'ranking', label: 'Ranking', path: '/ranking', Icon: BsTrophyFill },
  { id: 'rewards', label: 'Premios', path: '/rewards', Icon: BsGiftFill },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Nav>
      {TABS.map(({ id, label, path, Icon }) => {
        const active = isActive(path);

        return (
          <TabButton
            key={id}
            onClick={() => navigate(path)}
            whileTap={{ scale: 0.85 }}
            $active={active}
          >
            <IconWrapper
              animate={{ scale: active ? 1.15 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={24} />
            </IconWrapper>
            <Label>{label}</Label>
          </TabButton>
        );
      })}
    </Nav>
  );
};

const Nav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  z-index: 200;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const TabButton = styled(motion.button)`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  transition: color 0.2s ease;
`;

const IconWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Label = styled.span`
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
`;

export default BottomNav;
