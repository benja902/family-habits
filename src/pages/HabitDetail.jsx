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
import { HABIT_LABELS_FULL, HABIT_COLORS } from '../constants/habits.constants';
import { theme } from '../styles/theme';

// ==================== STYLED COMPONENTS ====================

const Container = styled(motion.div)`
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxl};
  text-align: center;
  min-height: 60vh;
  gap: ${theme.spacing.lg};
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.md};
`;

const EmptyStateTitle = styled.h2`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const EmptyStateMessage = styled.p`
  font-size: ${theme.typography.sizes.md};
  color: ${theme.colors.textSecondary};
  margin: 0;
  margin-bottom: ${theme.spacing.lg};
`;

const BackButton = styled(motion.button)`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.sizes.md};
  font-weight: ${theme.typography.weights.medium};
  font-family: ${theme.typography.fontFamily};
  cursor: pointer;
  box-shadow: ${theme.shadows.card};
`;

// ==================== COMPONENTE ====================

export default function HabitDetail() {
  const { habitId } = useParams();
  const navigate = useNavigate();

  // Mapa de módulos disponibles
  const HABIT_MODULES = {
    sleep: <SleepModule />,
    // Los demás se agregan en los siguientes prompts:
    // movement: <MovementModule />,
    // food: <FoodModule />,
    // study: <StudyModule />,
    // cleaning: <CleaningModule />,
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