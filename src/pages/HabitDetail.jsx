/**
 * Página de detalle de hábito - enrutador de módulos
 * Recibe :habitId de la URL y renderiza el módulo correspondiente
 */

import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsArrowRight, BsMoonStarsFill, BsPhoneFill, BsSunFill } from 'react-icons/bs';
import AppHeader from '../components/layout/AppHeader';
import PageContainer from '../components/layout/PageContainer';
import PhoneUseModule from '../components/habits/PhoneUseModule';
import NightRoutineModule from '../components/habits/NightRoutineModule';
import MorningRoutineModule from '../components/habits/MorningRoutineModule';
import MovementModule from '../components/habits/MovementModule';
// Agrega esta línea junto a los otros imports de módulos
import FoodModule from '../components/habits/FoodModule'
import StudyModule from '../components/habits/StudyModule'; // <--- ¡ESTA ES LA LÍNEA QUE TE FALTA!
import CleaningModule from '../components/habits/CleaningModule';
import CoexistenceModule from '../components/habits/CoexistenceModule';
import HouseholdModule from '../components/habits/HouseholdModule';
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

const LegacyBridge = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
`;

const BridgeCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const BridgeTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`;

const BridgeText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.5;
`;

const BridgeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BridgeOption = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  border: 1px solid ${({ $color }) => `${$color}33`};
  background: ${({ $color }) => `${$color}12`};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  text-align: left;
`;

const BridgeOptionContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BridgeIcon = styled.div`
  color: ${({ $color }) => $color};
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BridgeOptionTitle = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

const BridgeOptionText = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-top: 2px;
`;

function LegacySleepBridge({ navigate }) {
  const options = [
    {
      id: 'morning-routine',
      title: 'Rutina de mañana',
      text: 'Levantarte a tiempo y tender la cama.',
      icon: <BsSunFill />,
      color: HABIT_COLORS.sleep,
    },
    {
      id: 'phone-use',
      title: 'Rutina del celular',
      text: 'Entrega del celular y uso en baño o cama.',
      icon: <BsPhoneFill />,
      color: HABIT_COLORS.sleep,
    },
    {
      id: 'night-routine',
      title: 'Rutina de noche',
      text: 'Hora de dormir y cierre del día.',
      icon: <BsMoonStarsFill />,
      color: HABIT_COLORS.sleep,
    },
  ];

  return (
    <LegacyBridge>
      <BridgeCard>
        <BridgeTitle>Este módulo ya no se usa directamente</BridgeTitle>
        <BridgeText>
          La antigua ruta <strong>sleep</strong> fue reemplazada por tres módulos más claros.
          Elige a cuál quieres ir.
        </BridgeText>
      </BridgeCard>

      <BridgeGrid>
        {options.map((option) => (
          <BridgeOption
            key={option.id}
            $color={option.color}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/habits/${option.id}`)}
          >
            <BridgeOptionContent>
              <BridgeIcon $color={option.color}>{option.icon}</BridgeIcon>
              <div>
                <BridgeOptionTitle>{option.title}</BridgeOptionTitle>
                <BridgeOptionText>{option.text}</BridgeOptionText>
              </div>
            </BridgeOptionContent>
            <BridgeIcon $color={option.color}>
              <BsArrowRight />
            </BridgeIcon>
          </BridgeOption>
        ))}
      </BridgeGrid>

      <BackButton whileTap={{ scale: 0.96 }} onClick={() => navigate('/dashboard')}>
        Volver al Dashboard
      </BackButton>
    </LegacyBridge>
  );
}

// ==================== COMPONENTE ====================

export default function HabitDetail() {
  const { habitId } = useParams();
  const navigate = useNavigate();

  // Mapa de módulos disponibles
  const HABIT_MODULES = {
    sleep: <LegacySleepBridge navigate={navigate} />,
    'morning-routine': <MorningRoutineModule />,
    'phone-use': <PhoneUseModule />,
    'night-routine': <NightRoutineModule />,
    movement: <MovementModule />,
    food: <FoodModule />, // <-- ¡Le quitamos los // del principio!
    study: <StudyModule />,
    cleaning: <CleaningModule />,
    coexistence: <CoexistenceModule />,
    household: <HouseholdModule />
  };

  const HABIT_TITLES = {
    ...HABIT_LABELS_FULL,
    'morning-routine': 'Rutina de mañana',
    'phone-use': 'Rutina del celular',
    'night-routine': 'Rutina de noche',
  };

  const HABIT_PAGE_COLORS = {
    ...HABIT_COLORS,
    'morning-routine': HABIT_COLORS.sleep,
    'phone-use': HABIT_COLORS.sleep,
    'night-routine': HABIT_COLORS.sleep,
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
          title={HABIT_TITLES[habitId]}
          showBack={true}
          color={HABIT_PAGE_COLORS[habitId]}
          onBack={() => navigate('/dashboard')}
        />
      <PageContainer noPadding={false}>
        {HABIT_MODULES[habitId]}
      </PageContainer>
    </Container>
  );
}

export { HabitDetail };
