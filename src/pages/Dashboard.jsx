/**
 * Dashboard principal del usuario — versión móvil-first.
 * Muestra ProgressRing, puntos del día, estado y grid de hábitos.
 */

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsBoxArrowRight } from 'react-icons/bs';
import { PageContainer } from '../components/layout/PageContainer';
import { AppHeader } from '../components/layout/AppHeader';
import { ProgressRing } from '../components/ui/ProgressRing';
import { DayStatusBadge } from '../components/ui/DayStatusBadge';
import HabitCategoryCard from '../components/habits/HabitCategoryCard';
import { theme } from '../styles/theme';
import { HABIT_KEYS } from '../constants/habits.constants';
import { getGreeting } from '../utils/dates.utils';
import { useAuthStore } from '../stores/useAuthStore';
import { useDayStore } from '../stores/useDayStore';
import useDailyRecord from '../hooks/useDailyRecord';
import useCompletedHabits from '../hooks/useCompletedHabits';
import QuickChecklist from '../components/dashboard/QuickChecklist';
import DayTimeline from '../components/dashboard/DayTimeline';
// Mensajes motivacionales por estado del día
const MOTIVATIONAL_MESSAGES = {
  'sin iniciar': '¡Empieza tu día!',
  'crítico': '¡Vamos, aún puedes mejorar!',
  'regular': '¡Vas bien, sigue así!',
  'bien': '¡Muy bien! Ya casi llegas.',
  'excelente': '¡Día perfecto! 🎉',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const dayPoints = useDayStore((state) => state.dayPoints);
  const completionPct = useDayStore((state) => state.completionPct);
  const dayStatus = useDayStore((state) => state.dayStatus);

  // Cargar datos del registro diario desde Supabase
  // Los puntos se sincronizan automáticamente con useDayStore
  useDailyRecord();

  // Cargar hábitos completados del día
  const { completedHabits, completedCount } = useCompletedHabits();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHabitClick = (habitKey) => {
    navigate(`/habits/${habitKey}`);
  };

  const greeting = getGreeting();
  const headerTitle = `${greeting}, ${currentUser?.name}`;

  const LogoutButton = () => (
    <motion.button
      onClick={handleLogout}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 8,
        borderRadius: 8,
        color: theme.colors.textSecondary,
      }}
    >
      <BsBoxArrowRight size={20} />
    </motion.button>
  );

  return (
    <PageContainer>
      <AppHeader
        title={headerTitle}
        rightAction={<LogoutButton />}
      />

      {/* Hero Section */}
      <Hero>
        <ProgressRing
          size={130}
          progress={completionPct}
          color={theme.colors.primary}
        />
        <PointsText>{dayPoints} pts hoy</PointsText>
        <DayStatusBadge status={dayStatus} />
        <MotivationalText>
          {MOTIVATIONAL_MESSAGES[dayStatus] || '¡A por ello!'}
        </MotivationalText>
        <ProgressText>
          {completedCount} de 7 hábitos completados
        </ProgressText>
      </Hero>

      {/* Grid de hábitos */}
      <HabitsSection>
        <SectionTitle>Mis hábitos de hoy</SectionTitle>
        <HabitsGrid>
          {HABIT_KEYS.map((habitKey) => (
            <HabitCategoryCard
              key={habitKey}
              habitKey={habitKey}
              isCompleted={completedHabits[habitKey]}
              onClick={() => handleHabitClick(habitKey)}
            />
          ))}
        </HabitsGrid>
      </HabitsSection>
      {/* 👇 AGREGA ESTE BLOQUE AQUÍ 👇 */}
      <div style={{ marginTop: '32px' }}>
        <QuickChecklist />
        <DayTimeline />
      </div>
    </PageContainer>
  );
};

// Styled Components

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const PointsText = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const MotivationalText = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const ProgressText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const HabitsSection = styled.section`
  margin-top: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const HabitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export default Dashboard;
