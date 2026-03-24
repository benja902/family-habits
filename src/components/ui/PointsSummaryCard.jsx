import styled from 'styled-components';

export const PointsSummaryCard = ({
  pointsSummary = [],
  totalPoints = 0,
  accentColor = '#6366F1',
}) => {
  return (
    <SummaryCard $accentColor={accentColor}>
      {pointsSummary.map((item, index) => (
        <PointsRow key={index}>
          <PointsLabel>{item.label}</PointsLabel>
          <PointsValue $color={item.color} $isEmpty={item.points === 0}>
            {item.points} pts
          </PointsValue>
        </PointsRow>
      ))}
      <Divider />
      <TotalRow>
        <TotalLabel>Total</TotalLabel>
        <TotalValue $accentColor={accentColor}>{totalPoints} pts</TotalValue>
      </TotalRow>
    </SummaryCard>
  );
};

// --- STYLED COMPONENTS ---

const SummaryCard = styled.div`
  position: sticky;
  bottom: 80px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ $accentColor }) => $accentColor};
  border-radius: 16px;
  padding: 16px;
  margin: 24px 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const PointsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`;

const PointsLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PointsValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ $color, $isEmpty, theme }) =>
    $isEmpty ? theme.colors.textSecondary : $color};
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0.5 : 1)};
`;

const Divider = styled.div`
  height: 2px;
  background: ${({ theme }) => theme.colors.border};
  margin: 12px 0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TotalValue = styled.span`
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.weights.black};
  color: ${({ $accentColor }) => $accentColor};
`;