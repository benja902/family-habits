import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import {
  BsPeopleFill,
  BsStarFill,
  BsGiftFill,
  BsShieldFillExclamation,
  BsCheckCircleFill,
} from 'react-icons/bs'
import {
  getAdminDashboardAnalytics,
} from '../../services/supabase'
import { AppHeader } from '../../components/layout/AppHeader'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const LINE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
      ticks: { font: { size: 12 } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 } },
    },
  },
}

const RANKING_BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
    y: {
      grid: { display: false },
    },
  },
}

const HABITS_BAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
    x: {
      grid: { display: false },
    },
  },
}

export default function AdminStats() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['adminDashboardAnalytics'],
    queryFn: getAdminDashboardAnalytics,
    staleTime: 1000 * 60 * 5,
    placeholderData: previousData => previousData,
  })

  const stats = analytics?.stats
  const weeklyRanking = analytics?.weeklyRanking || []
  const pointsActivity = analytics?.pointsActivity || []
  const habitsStats = analytics?.habitsStats || []
  const hasPointsActivity = pointsActivity.length > 0
  const hasWeeklyRanking = weeklyRanking.length > 0
  const hasHabitsStats = habitsStats.length > 0

  const pointsActivityData = React.useMemo(() => ({
    labels: pointsActivity.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Puntos totales',
        data: pointsActivity.map(d => d.totalPoints),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }), [pointsActivity])

  const rankingData = React.useMemo(() => ({
    labels: weeklyRanking.slice(0, 5).map(u => u.name),
    datasets: [
      {
        label: 'Puntos de la semana',
        data: weeklyRanking.slice(0, 5).map(u => u.totalPoints),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',  // Oro
          'rgba(148, 163, 184, 0.8)', // Plata
          'rgba(180, 83, 9, 0.8)',    // Bronce
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(34, 197, 94, 0.8)',   // Verde
        ],
        borderRadius: 8,
      },
    ],
  }), [weeklyRanking])

  const habitsData = React.useMemo(() => ({
    labels: habitsStats.map(h => h.habit),
    datasets: [
      {
        label: 'Veces completado',
        data: habitsStats.map(h => h.completions),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  }), [habitsStats])

  return (
    <Container>
      <AppHeader title="Estadísticas del Sistema" />

      <ContentSection>
        <StatsGrid>
          <SummaryCard
            color="#3B82F6"
            icon={<BsPeopleFill />}
            label="Usuarios Activos"
            value={stats?.activeUsers}
            isLoading={isLoading}
            delay={0}
          />
          <SummaryCard
            color="#F59E0B"
            icon={<BsStarFill />}
            label="Puntos Hoy"
            value={stats?.totalPointsToday}
            isLoading={isLoading}
            delay={0.1}
          />
          <SummaryCard
            color="#22C55E"
            icon={<BsCheckCircleFill />}
            label="Días Completos"
            value={stats?.habitsCompletedToday}
            isLoading={isLoading}
            delay={0.2}
          />
          <SummaryCard
            color="#EC4899"
            icon={<BsGiftFill />}
            label="Premios Pendientes"
            value={stats?.pendingRewards}
            isLoading={isLoading}
            delay={0.3}
          />
          <SummaryCard
            color="#EF4444"
            icon={<BsShieldFillExclamation />}
            label="Castigos Activos"
            value={stats?.pendingPunishments}
            isLoading={isLoading}
            delay={0.4}
          />
        </StatsGrid>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartTitle>Actividad de Puntos (Últimos 7 Días)</ChartTitle>
          <ChartWrapper>
            <LineChartSection
              isLoading={isLoading}
              hasData={hasPointsActivity}
              data={pointsActivityData}
            />
          </ChartWrapper>
        </ChartCard>

        <ChartsRow>
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChartTitle>Top 5 de la Semana</ChartTitle>
            <ChartWrapper>
              <RankingChartSection
                isLoading={isLoading}
                hasData={hasWeeklyRanking}
                data={rankingData}
              />
            </ChartWrapper>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ChartTitle>Hábitos Más Completados</ChartTitle>
            <ChartWrapper>
              <HabitsChartSection
                isLoading={isLoading}
                hasData={hasHabitsStats}
                data={habitsData}
              />
            </ChartWrapper>
          </ChartCard>
        </ChartsRow>
      </ContentSection>
    </Container>
  )
}

const SummaryCard = React.memo(function SummaryCard({ color, icon, label, value, isLoading, delay }) {
  return (
    <StatCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <IconWrapper $color={color}>
        {icon}
      </IconWrapper>
      <StatInfo>
        {isLoading ? <NumberSkeleton /> : <StatNumber>{value ?? 0}</StatNumber>}
        <StatLabel>{label}</StatLabel>
      </StatInfo>
    </StatCard>
  )
})

const LineChartSection = React.memo(function LineChartSection({ isLoading, hasData, data }) {
  if (isLoading) return <ChartSkeleton />
  if (!hasData) return <ChartEmptyState>Sin datos recientes</ChartEmptyState>

  return <Line data={data} options={LINE_OPTIONS} />
})

const RankingChartSection = React.memo(function RankingChartSection({ isLoading, hasData, data }) {
  if (isLoading) return <ChartSkeleton />
  if (!hasData) return <ChartEmptyState>Sin ranking disponible</ChartEmptyState>

  return <Bar data={data} options={RANKING_BAR_OPTIONS} />
})

const HabitsChartSection = React.memo(function HabitsChartSection({ isLoading, hasData, data }) {
  if (isLoading) return <ChartSkeleton />
  if (!hasData) return <ChartEmptyState>Sin hábitos registrados</ChartEmptyState>

  return <Bar data={data} options={HABITS_BAR_OPTIONS} />
})

// ==================== STYLED COMPONENTS ====================
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  @media (min-width: 768px) {
    padding: 0 24px;
  }
`

const ContentSection = styled.div`
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    padding: 16px 0;
    gap: 24px;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
`

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: box-shadow 0.2s;
  min-height: 80px;

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 20px;
    gap: 16px;
    min-height: 90px;
  }

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.hover};
  }
`

const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 12px;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 16px;
  }

  svg {
    width: 20px;
    height: 20px;

    @media (min-width: 768px) {
      width: 24px;
      height: 24px;
    }
  }
`

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`

const StatNumber = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1;
  margin-bottom: 4px;

  @media (min-width: 768px) {
    font-size: 24px;
  }
`

const StatLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (min-width: 768px) {
    font-size: 13px;
    white-space: nowrap;
    -webkit-line-clamp: unset;
  }
`

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 24px;
  }
`

const ChartTitle = styled.h3`
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 16px 0;

  @media (min-width: 768px) {
    font-size: 16px;
    margin: 0 0 20px 0;
  }
`

const ChartWrapper = styled.div`
  height: 250px;
  position: relative;

  @media (min-width: 768px) {
    height: 300px;
  }
`

const ChartsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const NumberSkeleton = styled.div`
  width: 72px;
  height: 24px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.border};
  margin-bottom: 6px;

  @media (min-width: 768px) {
    height: 28px;
  }
`

const ChartSkeleton = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background:
    linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.border} 0%,
      ${({ theme }) => theme.colors.border} 72%,
      transparent 72%
    );
  opacity: 0.7;
`

const ChartEmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  padding: 16px;
`
