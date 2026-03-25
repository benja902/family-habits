import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { 
  BsShieldFillExclamation, 
  BsGiftFill, 
  BsPeopleFill, 
  BsStarFill,
  BsBarChartFill 
} from 'react-icons/bs'
import { PageContainer } from '../../components/layout/PageContainer'
import { AppHeader } from '../../components/layout/AppHeader'

// Importamos tus componentes refactorizados
import AdminRewards from './AdminRewards'
import AdminPunishments from './AdminPunishments'

// Placeholders temporales para las opciones que aún no programamos
const AdminUsers = () => <PlaceholderText>Módulo de Usuarios en construcción...</PlaceholderText>
const AdminPoints = () => <PlaceholderText>Editor de Puntos en construcción...</PlaceholderText>
const AdminStats = () => <PlaceholderText>Módulo de Estadísticas en construcción...</PlaceholderText>

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('rewards')
  const navigate = useNavigate()

  // Renderiza el contenido según lo que toques en la barra horizontal
  const renderContent = () => {
    switch(activeTab) {
      case 'rewards': return <AdminRewards />
      case 'punishments': return <AdminPunishments />
      case 'users': return <AdminUsers />
      case 'points': return <AdminPoints />
      case 'stats': return <AdminStats />
      default: return <AdminRewards />
    }
  }

  return (
    <PageContainer>
      {/* 1. Tu Header original vuelve con el modo oscuro 
        2. Le activamos la flecha para volver al Dashboard principal
      */}
      <AppHeader 
        title="Panel de Control" 
        showBack={true} 
        onBack={() => navigate('/dashboard')} 
      />

      {/* Tu menú horizontal deslizable (Reemplaza a la hamburguesa) */}
      <ScrollableNav>
        <ToggleContainer>
          <ToggleButton 
            $isActive={activeTab === 'users'} 
            onClick={() => setActiveTab('users')}
          >
            <BsPeopleFill style={{ marginRight: 6 }} /> Usuarios
          </ToggleButton>
          <ToggleButton 
            $isActive={activeTab === 'points'} 
            onClick={() => setActiveTab('points')}
          >
            <BsStarFill style={{ marginRight: 6 }} /> Reglas
          </ToggleButton>
          <ToggleButton 
            $isActive={activeTab === 'rewards'} 
            onClick={() => setActiveTab('rewards')}
          >
            <BsGiftFill style={{ marginRight: 6 }} /> Premios
          </ToggleButton>
          <ToggleButton 
            $isActive={activeTab === 'punishments'} 
            onClick={() => setActiveTab('punishments')}
          >
            <BsShieldFillExclamation style={{ marginRight: 6 }} /> Castigos
          </ToggleButton>
          <ToggleButton 
            $isActive={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
          >
            <BsBarChartFill style={{ marginRight: 6 }} /> Estadísticas
          </ToggleButton>
        </ToggleContainer>
      </ScrollableNav>

      <ContentSection>
        {renderContent()}
      </ContentSection>
    </PageContainer>
  )
}

// ==================== STYLED COMPONENTS DEL CASCARÓN ====================

const ScrollableNav = styled.div`
  width: 100%;
  overflow-x: auto;
  /* Ocultar barra de scroll para que se vea limpio */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`

const ToggleContainer = styled.div`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 4px;
  margin: 16px;
  min-width: max-content; /* Permite que crezca hacia la derecha */
`

const ToggleButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap; /* Evita que el texto se rompa */
  background: ${({ $isActive, theme }) => ($isActive ? theme.colors.surface : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.textPrimary : theme.colors.textSecondary)};
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadows.card : 'none')};
  transition: all 0.2s ease;
`

const ContentSection = styled.div`
  padding: 0 16px 100px 16px;
`

const PlaceholderText = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  margin-top: 16px;
`