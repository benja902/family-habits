import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsTrophyFill } from 'react-icons/bs';

const PodiumContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  padding: 40px 10px 20px;
  height: 240px;
`;

const Step = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px 16px 8px 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  position: relative;
  border: 2px solid ${({ $color }) => $color};
  padding-bottom: 12px;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid white;
  margin-top: -25px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: #eee;
`;

const Name = styled.span`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  margin-top: 8px;
  text-align: center;
`;

const Points = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 800;
`;

export const RankingPodium = ({ top3 }) => {
  const [p2, p1, p3] = [top3[1], top3[0], top3[2]]; // Reordenar para visual: 2nd - 1st - 3rd

  return (
    <PodiumContainer>
      {/* Segundo Lugar */}
      {p2 && (
        <Step 
          $color="#94A3B8"
          initial={{ height: 0 }}
          animate={{ height: 140 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Avatar src={p2.photoUrl} alt={p2.name} />
          <Name>{p2.name}</Name>
          <Points>{p2.points} pts</Points>
        </Step>
      )}

      {/* Primer Lugar */}
      {p1 && (
        <Step 
          $color="#F59E0B"
          initial={{ height: 0 }}
          animate={{ height: 180 }}
          transition={{ duration: 0.8 }}
        >
          <BsTrophyFill size={28} color="#F59E0B" style={{ marginTop: '-40px' }} />
          <Avatar src={p1.photoUrl} alt={p1.name} />
          <Name>{p1.name}</Name>
          <Points>{p1.points} pts</Points>
        </Step>
      )}

      {/* Tercer Lugar */}
      {p3 && (
        <Step 
          $color="#B45309"
          initial={{ height: 0 }}
          animate={{ height: 110 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Avatar src={p3.photoUrl} alt={p3.name} />
          <Name>{p3.name}</Name>
          <Points>{p3.points} pts</Points>
        </Step>
      )}
    </PodiumContainer>
  );
};