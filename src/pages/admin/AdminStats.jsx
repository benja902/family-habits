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
  getAdminStats,
  getAdminWeeklyRanking,
  getPointsActivity,
  getHabitsStats,
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

export default function AdminStats() {
  // Queries
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })

  const { data: weeklyRanking, isLoading: isLoadingRanking } = useQuery({
    queryKey: ['adminWeeklyRanking'],
    queryFn: getAdminWeeklyRanking,
    staleTime: 1000 * 60 * 5,
  })

  const { data: pointsActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['pointsActivity'],
    queryFn: getPointsActivity,
    staleTime: 1000 * 60 * 5,
  })

  const { data: habitsStats, isLoading: isLoadingHabits } = useQuery({
    queryKey: ['habitsStats'],
    queryFn: getHabitsStats,
    staleTime: 1000 * 60 * 5,
  })

  // Datos para gráfica de actividad de puntos (líneas)
  const pointsActivityData = {
    labels: pointsActivity?.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
    }) || [],
    datasets: [
      {
        label: 'Puntos totales',
        data: pointsActivity?.map(d => d.totalPoints) || [],
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
  }

  // Datos para gráfica de ranking (barras horizontales)
  const rankingData = {
    labels: weeklyRanking?.slice(0, 5).map(u => u.name) || [],
    datasets: [
      {
        label: 'Puntos de la semana',
        data: weeklyRanking?.slice(0, 5).map(u => u.totalPoints) || [],
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
  }

  // Datos para gráfica de hábitos (barras verticales)
  const habitsData = {
    labels: habitsStats?.map(h => h.habit) || [],
    datasets: [
      {
        label: 'Veces completado',
        data: habitsStats?.map(h => h.completions) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
      },
    ],
  }

  // Opciones de gráficas
  const lineOptions = {
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

  const barOptions = {
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

  const habitsBarOptions = {
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

  if (isLoadingStats || isLoadingRanking || isLoadingActivity || isLoadingHabits) {
    return (
      <Container>
        <AppHeader title="Estadísticas" />
        <LoadingMessage>Cargando estadísticas...</LoadingMessage>
      </Container>
    )
  }

  return (
    <Container>
      <AppHeader title="Estadísticas del Sistema" />

      <ContentSection>
        {/* Cards de resumen */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <IconWrapper $color="#3B82F6">
              <BsPeopleFill />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{stats?.activeUsers || 0}</StatNumber>
              <StatLabel>Usuarios Activos</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <IconWrapper $color="#F59E0B">
              <BsStarFill />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{stats?.totalPointsToday || 0}</StatNumber>
              <StatLabel>Puntos Hoy</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <IconWrapper $color="#22C55E">
              <BsCheckCircleFill />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{stats?.habitsCompletedToday || 0}</StatNumber>
              <StatLabel>Días Completos</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <IconWrapper $color="#EC4899">
              <BsGiftFill />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{stats?.pendingRewards || 0}</StatNumber>
              <StatLabel>Premios Pendientes</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <IconWrapper $color="#EF4444">
              <BsShieldFillExclamation />
            </IconWrapper>
            <StatInfo>
              <StatNumber>{stats?.pendingPunishments || 0}</StatNumber>
              <StatLabel>Castigos Activos</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        {/* Gráfica de actividad de puntos */}
        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartTitle>Actividad de Puntos (Últimos 7 Días)</ChartTitle>
          <ChartWrapper>
            <Line data={pointsActivityData} options={lineOptions} />
          </ChartWrapper>
        </ChartCard>

        {/* Gráficas lado a lado */}
        <ChartsRow>
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChartTitle>Top 5 de la Semana</ChartTitle>
            <ChartWrapper>
              <Bar data={rankingData} options={barOptions} />
            </ChartWrapper>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ChartTitle>Hábitos Más Completados</ChartTitle>
            <ChartWrapper>
              <Bar data={habitsData} options={habitsBarOptions} />
            </ChartWrapper>
          </ChartCard>
        </ChartsRow>
      </ContentSection>
    </Container>
  )
}

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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;

  @media (min-width: 768px) {
    padding: 48px 24px;
    font-size: 16px;
  }
`
