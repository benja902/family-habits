/**
 * Pantalla de bienvenida - Selector de usuario familiar.
 * Primera pantalla que ve la familia al entrar a la app.
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import { getAllUsers } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { theme } from '../styles/theme';

// Función auxiliar para obtener el saludo según la hora del día
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

// Función auxiliar para obtener las iniciales del nombre
const getInitials = (name) => {
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Función auxiliar para obtener el color del avatar según el índice
const getAvatarColor = (index) => {
  const colors = Object.values(theme.HABIT_COLORS);
  return colors[index % colors.length];
};

const Welcome = () => {
  const navigate = useNavigate();
  const selectUser = useAuthStore((state) => state.selectUser);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const handleUserClick = (user) => {
    selectUser(user);
    navigate('/pin');
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingText>Cargando...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>Error al cargar los usuarios. Por favor, recarga la página.</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Title>{getGreeting()}</Title>
        <Subtitle>¿Quién eres tú hoy?</Subtitle>

        <UsersGrid>
          {users?.map((user, index) => (
            <UserCard key={user.id} onClick={() => handleUserClick(user)}>
              {user.avatar_url ? (
                <Avatar src={user.avatar_url} alt={user.name} />
              ) : (
                <AvatarPlaceholder color={getAvatarColor(index)}>
                  {getInitials(user.name)}
                </AvatarPlaceholder>
              )}
              <UserName>{user.name}</UserName>
            </UserCard>
          ))}
        </UsersGrid>
      </Content>
    </Container>
  );
};

// Styled Components

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Content = styled.div`
  width: 100%;
  max-width: 900px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.display};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 12px;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.xxl};
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: ${({ theme }) => `${theme.spacing.xl} ${theme.spacing.lg}`};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.hover};
    transform: translateY(-4px);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props) => props.color};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.surface};
`;

const UserName = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  max-width: 500px;
`;

export default Welcome;
