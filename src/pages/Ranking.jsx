import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RankingPodium } from '../components/dashboard/RankingPodium';
import { useRanking } from '../hooks/useRanking';

// Contenedor principal con padding-bottom para el BottomNav (80px)
const PageWrapper = styled.div`
  padding: 24px 16px 100px 16px;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Title = styled.h2`
  text-align: center;
  font-weight: 900;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-bottom: 24px;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
`;

const RankRow = styled(motion.div)`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  border: ${props => props.$isMe ? `2px solid ${props.theme.colors.primary}` : '1px solid transparent'};
`;

const Position = styled.span`
  width: 28px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 12px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  object-fit: cover;
`;

const UserName = styled.span`
  flex: 1;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserPoints = styled.span`
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
`;

const Ranking = () => {
  const { data: participants, isLoading, isError } = useRanking('week');
  
  // Aquí asumo que tienes el user en un store de Zustand
  const myId = 'ID_DEL_USUARIO_ACTUAL'; 

  if (isLoading) return <PageWrapper><Subtitle>Cargando posiciones...</Subtitle></PageWrapper>;
  if (isError) return <PageWrapper><Subtitle>Error al cargar el ranking</Subtitle></PageWrapper>;

  // Separamos Top 3 para el podio y el resto para la lista
  const top3 = participants?.slice(0, 3) || [];
  const others = participants?.slice(3) || [];

  return (
    <PageWrapper>
      <Title>Ranking Familiar</Title>
      <Subtitle>¿Quién lidera la disciplina hoy?</Subtitle>
      
      {/* Podio visual para los 3 primeros */}
      <RankingPodium top3={top3} />

      <ListContainer>
        {others.map((user, index) => (
          <RankRow 
            key={user.id}
            $isMe={user.id === myId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }} // Feedback visual de Duolingo
          >
            <Position>{user.position}</Position>
            <UserAvatar 
              src={user.photoUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
              alt={user.name} 
            />
            <UserName>
              {user.name} {user.id === myId && " (Tú)"}
            </UserName>
            <UserPoints>{user.points.toLocaleString()} pts</UserPoints>
          </RankRow>
        ))}
      </ListContainer>
    </PageWrapper>
  );
};

export default Ranking;