/**
 * Componente wrapper para todas las páginas de usuarios normales.
 * Maneja el scroll vertical y deja espacio para el BottomNav.
 */

import styled from 'styled-components';

const PageContainer = ({ children, noPadding = false }) => {
  return (
    <OuterContainer>
      <InnerContainer $noPadding={noPadding}>{children}</InnerContainer>
    </OuterContainer>
  );
};

const OuterContainer = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const InnerContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ $noPadding }) =>
    $noPadding ? '0' : '16px 16px 80px 16px'};
`;

export { PageContainer };
export default PageContainer;
