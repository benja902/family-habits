import React, { useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  BsPeopleFill, 
  BsStarFill, 
  BsGiftFill, 
  BsShieldFillExclamation, 
  BsBarChartFill,
  BsList,
  BsX,
  BsBoxArrowLeft
} from 'react-icons/bs'

const ADMIN_MENU = [
  { path: '/admin/users', label: 'Usuarios', icon: BsPeopleFill },
  { path: '/admin/points', label: 'Reglas de Puntos', icon: BsStarFill },
  { path: '/admin/rewards', label: 'Aprobar Premios', icon: BsGiftFill },
  { path: '/admin/punishments', label: 'Castigos', icon: BsShieldFillExclamation },
  { path: '/admin/stats', label: 'Estadísticas', icon: BsBarChartFill },
]

export default function AdminLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigate = (path) => {
    navigate(path)
    setIsMobileMenuOpen(false)
  }

  return (
    <LayoutContainer>
      {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
      <MobileHeader>
        <MenuButton onClick={() => setIsMobileMenuOpen(true)}>
          <BsList size={28} />
        </MenuButton>
        <MobileTitle>Panel de Control</MobileTitle>
      </MobileHeader>

      {/* SIDEBAR (Fijo en Desktop, Modal en Móvil) */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <>
            {isMobileMenuOpen && (
              <Overlay 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
            )}
            
            <Sidebar
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            >
              <SidebarHeader>
                <Title>Admin Panel</Title>
                <CloseButton onClick={() => setIsMobileMenuOpen(false)}>
                  <BsX size={28} />
                </CloseButton>
              </SidebarHeader>

              <NavList>
                {ADMIN_MENU.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.path)
                  
                  return (
                    <NavItem 
                      key={item.path}
                      $isActive={isActive}
                      onClick={() => handleNavigate(item.path)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon size={20} />
                      <NavLabel>{item.label}</NavLabel>
                    </NavItem>
                  )
                })}
              </NavList>

              <SidebarFooter>
                <ExitButton onClick={() => handleNavigate('/dashboard')}>
                  <BsBoxArrowLeft size={20} />
                  Volver al Dashboard
                </ExitButton>
              </SidebarFooter>
            </Sidebar>
          </>
        )}
      </AnimatePresence>

      {/* CONTENIDO PRINCIPAL */}
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  )
}

// ==================== STYLED COMPONENTS ====================
const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`
const MobileHeader = styled.div`
  display: none;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 768px) {
    display: flex;
  }
`
const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
`
const MobileTitle = styled.h1`
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  
  @media (min-width: 768px) {
    display: none;
  }
`
const Sidebar = styled(motion.aside)`
  width: 280px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
  }
`
const SidebarHeader = styled.div`
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const Title = styled.h2`
  font-size: 20px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`
const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  
  @media (min-width: 768px) {
    display: none;
  }
`
const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
  flex: 1;
`
const NavItem = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: none;
  background: ${({ $isActive, theme }) => ($isActive ? `${theme.colors.primary}15` : 'transparent')};
  color: ${({ $isActive, theme }) => ($isActive ? theme.colors.primary : theme.colors.textSecondary)};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $isActive, theme }) => ($isActive ? `${theme.colors.primary}15` : theme.colors.background)};
  }
`
const NavLabel = styled.span`
  font-size: 15px;
  font-weight: 700;
`
const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`
const ExitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`
const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`