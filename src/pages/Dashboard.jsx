/**
 * Dashboard principal del usuario — versión móvil-first.
 * Muestra ProgressRing, puntos del día, estado y grid de hábitos.
 */

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BsBoxArrowRight, BsShieldLockFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { PageContainer } from '../components/layout/PageContainer';
import { AppHeader } from '../components/layout/AppHeader';
import { ProgressRing } from '../components/ui/ProgressRing';
import { DayStatusBadge } from '../components/ui/DayStatusBadge';
import HabitCategoryCard from '../components/habits/HabitCategoryCard';
import QuickChecklist from '../components/dashboard/QuickChecklist';
import DayTimeline from '../components/dashboard/DayTimeline';
import { theme } from '../styles/theme';
import { getGreeting } from '../utils/dates.utils';
import { useAuthStore } from '../stores/useAuthStore';
import { useDayStore } from '../stores/useDayStore';
import useDailyRecord from '../hooks/useDailyRecord';
import useCompletedHabits from '../hooks/useCompletedHabits';
import usePunishments from '../hooks/usePunishments';
import useSleepModule from '../hooks/useSleepModule';
import useFoodModule from '../hooks/useFoodModule';
import useMovementModule from '../hooks/useMovementModule';
import useStudyModule from '../hooks/useStudyModule';
import useCleaningModule from '../hooks/useCleaningModule';
import useHouseholdModule from '../hooks/useHouseholdModule';

// Mensajes motivacionales por estado del día
const MOTIVATIONAL_MESSAGES = {
  'sin iniciar': '¡Empieza tu día!',
  'crítico': '¡Vamos, aún puedes mejorar!',
  'regular': '¡Vas bien, sigue así!',
  'bien': '¡Muy bien! Ya casi llegas.',
  'excelente': '¡Día perfecto! 🎉',
};

const MAIN_FLOW_HABIT_KEYS = [
  'morning-routine',
  'movement',
  'food',
  'study',
  'cleaning',
  'phone-use',
  'coexistence',
  'night-routine',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const dayPoints = useDayStore((state) => state.dayPoints);
  const completionPct = useDayStore((state) => state.completionPct);
  const dayStatus = useDayStore((state) => state.dayStatus);

  // Cargar datos de castigos para la alerta
  const { punishments } = usePunishments();
  const pendingPunishments = punishments?.filter(p => p.status === 'pendiente') || [];

  // Cargar datos del registro diario desde Supabase
  // Los puntos se sincronizan automáticamente con useDayStore
  useDailyRecord();

  // Cargar hábitos completados del día
  const { completedHabits } = useCompletedHabits();

  // Cargar datos de módulos para pasar a QuickChecklist y DayTimeline
  const { sleepRecord } = useSleepModule();
  const { mealRecords } = useFoodModule();
  const { movementRecord } = useMovementModule();
  const { studyRecord } = useStudyModule();
  const { cleaningRecord } = useCleaningModule();
  const { hasRecord: hasHouseholdRecord } = useHouseholdModule();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHabitClick = (habitKey) => {
    navigate(`/habits/${habitKey}`);
  };

  const greeting = getGreeting();
  const headerTitle = `${greeting}, ${currentUser?.name}`;

  const mainFlowCompletedHabits = {
    'morning-routine': !!sleepRecord?.wake_time || !!cleaningRecord?.bed_made,
    movement: !!completedHabits.movement,
    food: !!completedHabits.food,
    study: !!completedHabits.study,
    cleaning: !!completedHabits.cleaning,
    'phone-use': !!(
      sleepRecord?.device_delivered ||
      sleepRecord?.device_delivered_at ||
      sleepRecord?.device_in_bathroom ||
      sleepRecord?.device_in_bed
    ),
    coexistence: !!completedHabits.coexistence,
    'night-routine': !!(sleepRecord?.sleep_time || sleepRecord?.slept_by_11),
  };

  const mainFlowCompletedCount = MAIN_FLOW_HABIT_KEYS.filter(
    (habitKey) => mainFlowCompletedHabits[habitKey]
  ).length;

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
  // Botón exclusivo para Benjamín (Admin)
  const AdminButton = () => (
    <motion.button
      onClick={() => navigate('/admin')}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 8,
        borderRadius: 8,
        color: theme.colors.primary, // Le damos color primario para que resalte
        marginRight: 4,
      }}
    >
      <BsShieldLockFill size={20} />
    </motion.button>
  );

  // Agrupamos los botones de la cabecera
  const HeaderActions = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Solo se muestra si el rol es exactamente 'admin' */}
      {currentUser?.role === 'admin' && <AdminButton />}
      <LogoutButton />
    </div>
  );
  return (
    <PageContainer>
      <AppHeader
        title={headerTitle}
        rightAction={<HeaderActions />}
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
          {mainFlowCompletedCount} de {MAIN_FLOW_HABIT_KEYS.length} hábitos completados
        </ProgressText>
      </Hero>
      {/* 👇 ALERTA DINÁMICA DE CASTIGOS 👇 */}
      {pendingPunishments.length > 0 && (
        <PunishmentAlert 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/punishments')}
        >
          <BsExclamationTriangleFill size={24} />
          <div>
            <AlertTitle>¡Atención, {currentUser?.name}!</AlertTitle>
            <AlertText>Tienes {pendingPunishments.length} castigo(s) pendiente(s). Toca aquí para resolverlo.</AlertText>
          </div>
        </PunishmentAlert>
      )}

      {/* Grid de hábitos */}
      <HabitsSection>
        <SectionTitle>Mis hábitos de hoy</SectionTitle>
          <HabitsGrid>
          {MAIN_FLOW_HABIT_KEYS.map((habitKey) => (
            <HabitCategoryCard
              key={habitKey}
              habitKey={habitKey}
              isCompleted={mainFlowCompletedHabits[habitKey]}
              onClick={() => handleHabitClick(habitKey)}
            />
          ))}
        </HabitsGrid>
      </HabitsSection>
      {/* 👇 AGREGA ESTE BLOQUE AQUÍ 👇 */}
      <div style={{ marginTop: '32px' }}>
        <QuickChecklist
          sleepRecord={sleepRecord}
          mealRecords={mealRecords}
          movementRecord={movementRecord}
          studyRecord={studyRecord}
          cleaningRecord={cleaningRecord}
          hasHouseholdRecord={hasHouseholdRecord}
        />
        <DayTimeline
          sleepRecord={sleepRecord}
          mealRecords={mealRecords}
          movementRecord={movementRecord}
          studyRecord={studyRecord}
        />
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
const PunishmentAlert = styled(motion.div)`
  background: ${({ theme }) => `${theme.colors.danger}15`};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const AlertTitle = styled.h4`
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 15px;
  font-weight: 800;
`;

const AlertText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
`;

export default Dashboard;
