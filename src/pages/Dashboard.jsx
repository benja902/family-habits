/**
 * Dashboard principal del usuario — versión móvil-first.
 * Muestra ProgressRing, puntos del día, estado y grid de hábitos.
 */

import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { getGreeting, getTodayString } from '../utils/dates.utils';
import { getPointTransactionsByCategory } from '../services/supabase';
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
import useCoexistenceModule from '../hooks/useCoexistenceModule';
import { MAIN_FLOW_HABIT_KEYS } from '../constants/habits.constants';
import { getFoodStatus } from '../utils/food-status.utils';
import {
  getCleaningStatus,
  getCoexistenceStatus,
  getHouseholdStatus,
  getMorningRoutineStatus,
  getMovementStatus,
  getNightRoutineStatus,
  getPhoneUseStatus,
  getStudyStatus,
} from '../utils/habit-progress.utils';

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
  const today = getTodayString();

  // Cargar datos de castigos para la alerta
  const { punishments } = usePunishments();
  const pendingPunishments = punishments?.filter(p => p.status === 'pendiente') || [];

  // Cargar datos del registro diario desde Supabase
  // Los puntos se sincronizan automáticamente con useDayStore
  useDailyRecord();

  // Cargar hábitos completados del día
  const { completedHabits, completedCount } = useCompletedHabits();

  // Cargar datos de módulos para pasar a QuickChecklist y DayTimeline
  const { sleepRecord } = useSleepModule();
  const { mealRecords, hydrationRecord } = useFoodModule();
  const { movementRecord } = useMovementModule();
  const { studyRecord } = useStudyModule();
  const { cleaningRecord } = useCleaningModule();
  const { householdData, hasRecord: hasHouseholdRecord } = useHouseholdModule();
  const { coexistenceRecord } = useCoexistenceModule();
  const { data: phoneUseTransactions } = useQuery({
    queryKey: ['phoneUseTransactions', currentUser?.id, today],
    queryFn: () => getPointTransactionsByCategory(currentUser?.id, today, 'phone_use'),
    enabled: !!currentUser?.id,
  })
  const hasPhoneUseRecord = (phoneUseTransactions?.length || 0) > 0
  const foodStatus = getFoodStatus(mealRecords, hydrationRecord);
  const morningStatus = getMorningRoutineStatus(sleepRecord, cleaningRecord)
  const movementStatus = getMovementStatus(movementRecord)
  const studyStatus = getStudyStatus(studyRecord)
  const householdStatus = getHouseholdStatus(householdData)
  const cleaningStatus = getCleaningStatus(cleaningRecord)
  const phoneUseStatus = getPhoneUseStatus(sleepRecord, hasPhoneUseRecord)
  const coexistenceStatus = getCoexistenceStatus(coexistenceRecord)
  const nightRoutineStatus = getNightRoutineStatus(sleepRecord)
  const progressCardMeta = {
    'morning-routine': morningStatus,
    movement: movementStatus,
    food: foodStatus,
    study: studyStatus,
    cleaning: cleaningStatus,
    'phone-use': phoneUseStatus,
    coexistence: coexistenceStatus,
    'night-routine': nightRoutineStatus,
    household: householdStatus,
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHabitClick = (habitKey) => {
    navigate(`/habits/${habitKey}`);
  };

  const greeting = getGreeting();
  const headerTitle = `${greeting}, ${currentUser?.name}`;

  const logoutButton = (
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
  )

  const adminButton = (
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
  )

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {currentUser?.role === 'admin' && adminButton}
      {logoutButton}
    </div>
  )
  return (
    <PageContainer>
      <AppHeader
        title={headerTitle}
        rightAction={headerActions}
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
          {completedCount} de {MAIN_FLOW_HABIT_KEYS.length} hábitos completados
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
          {MAIN_FLOW_HABIT_KEYS.map((habitKey) => {
            const progressMeta = progressCardMeta[habitKey]

            return (
            <HabitCategoryCard
              key={habitKey}
              habitKey={habitKey}
              isCompleted={progressMeta ? progressMeta.isCompleted : completedHabits[habitKey]}
              isInProgress={progressMeta ? progressMeta.isInProgress : false}
              statusLabel={progressMeta ? progressMeta.label || progressMeta.statusLabel : undefined}
              progressPct={progressMeta ? progressMeta.progressPct : undefined}
              progressLabel={progressMeta ? progressMeta.progressLabel : undefined}
              onClick={() => handleHabitClick(habitKey)}
            />
            )
          })}
        </HabitsGrid>
      </HabitsSection>
      {/* 👇 AGREGA ESTE BLOQUE AQUÍ 👇 */}
      <div style={{ marginTop: '32px' }}>
        <QuickChecklist
          sleepRecord={sleepRecord}
          mealRecords={mealRecords}
          hydrationRecord={hydrationRecord}
          movementRecord={movementRecord}
          studyRecord={studyRecord}
          cleaningRecord={cleaningRecord}
          householdData={householdData}
          hasHouseholdRecord={hasHouseholdRecord}
        />
        <DayTimeline
          sleepRecord={sleepRecord}
          mealRecords={mealRecords}
          hydrationRecord={hydrationRecord}
          movementRecord={movementRecord}
          studyRecord={studyRecord}
          cleaningRecord={cleaningRecord}
          coexistenceRecord={coexistenceRecord}
          householdData={householdData}
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
