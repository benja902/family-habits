/**
 * Página de detalle de hábito - enrutador de módulos
 * Recibe :habitId de la URL y renderiza el módulo correspondiente
 */

import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AppHeader from '../components/layout/AppHeader';
import PageContainer from '../components/layout/PageContainer';
import SleepModule from '../components/habits/SleepModule';
import MovementModule from '../components/habits/MovementModule';
// Agrega esta línea junto a los otros imports de módulos
import FoodModule from '../components/habits/FoodModule'
import StudyModule from '../components/habits/StudyModule'; // <--- ¡ESTA ES LA LÍNEA QUE TE FALTA!
import CleaningModule from '../components/habits/CleaningModule';
import { HABIT_LABELS_FULL, HABIT_COLORS } from '../constants/habits.constants';


// ==================== STYLED COMPONENTS ====================

const Container = styled(motion.div)`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  min-height: 60vh;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyStateTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const EmptyStateMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BackButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

// ==================== COMPONENTE ====================

export default function HabitDetail() {
  const { habitId } = useParams();
  const navigate = useNavigate();

  // Mapa de módulos disponibles
  const HABIT_MODULES = {
    sleep: <SleepModule />,
    movement: <MovementModule />,
    food: <FoodModule />, // <-- ¡Le quitamos los // del principio!
    study: <StudyModule />,
    cleaning: <CleaningModule />,
    // coexistence: <CoexistenceModule />,
    // household: <HouseholdModule />,
  };

  // Si el módulo no existe, mostrar EmptyState
  if (!HABIT_MODULES[habitId]) {
    return (
      <Container
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AppHeader
          title="Módulo no encontrado"
          showBack={true}
          onBack={() => navigate('/dashboard')}
        />
        <PageContainer>
          <EmptyStateContainer>
            <EmptyStateIcon>🚧</EmptyStateIcon>
            <EmptyStateTitle>Este módulo está en construcción</EmptyStateTitle>
            <EmptyStateMessage>
              Estamos trabajando para traerte este módulo pronto.
              Por ahora, puedes usar los otros módulos disponibles.
            </EmptyStateMessage>
            <BackButton
              onClick={() => navigate('/dashboard')}
              whileTap={{ scale: 0.96 }}
            >
              Volver al Dashboard
            </BackButton>
          </EmptyStateContainer>
        </PageContainer>
      </Container>
    );
  }

  // Si el módulo existe, renderizarlo
  return (
    <Container
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AppHeader
        title={HABIT_LABELS_FULL[habitId]}
        showBack={true}
        color={HABIT_COLORS[habitId]}
        onBack={() => navigate('/dashboard')}
      />
      <PageContainer noPadding={false}>
        {HABIT_MODULES[habitId]}
      </PageContainer>
    </Container>
  );
}

export { HabitDetail };
