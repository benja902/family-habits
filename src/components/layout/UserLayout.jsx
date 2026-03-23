/**
 * Layout para páginas de usuarios normales.
 * Incluye el BottomNav siempre visible.
 */

import styled from 'styled-components';
import BottomNav from './BottomNav';

const UserLayout = ({ children }) => {
  return (
    <Container>
      {children}
      <BottomNav />
    </Container>
  );
};

const Container = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

export default UserLayout;