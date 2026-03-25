/**
 * Router principal del Panel Familiar de Hábitos.
 * Maneja las rutas públicas, protegidas por autenticación y protegidas por rol admin.
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../stores/useAuthStore';
import UserLayout from '../components/layout/UserLayout';
import Punishments from '../pages/Punishments'; // O la ruta correcta hacia tu carpeta pages
import AdminDashboard from '../pages/AdminDashboard';
// Lazy loading de páginas para mejor performance
const Welcome = React.lazy(() => import('../pages/Welcome'));
const PinEntry = React.lazy(() => import('../pages/PinEntry'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const HabitDetail = React.lazy(() => import('../pages/HabitDetail'));
const Stats = React.lazy(() => import('../pages/Stats'));
const Ranking = React.lazy(() => import('../pages/Ranking'));
const Rewards = React.lazy(() => import('../pages/Rewards'));

// Componente de carga mientras se cargan las páginas
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#64748B'
  }}>
    Cargando...
  </div>
);

// Placeholder temporal para el panel admin (Fase 4)
const AdminComingSoon = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>Panel admin — en construcción</h2>
    <p>Disponible en la Fase 4</p>
  </div>
);

// Wrapper de animación para transiciones entre páginas
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

// Ruta protegida: requiere autenticación
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Ruta protegida: requiere autenticación Y rol admin
const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Ruta de PIN: requiere que haya un usuario seleccionado
const PinRoute = ({ children }) => {
  const selectedUser = useAuthStore((state) => state.selectedUser);

  if (!selectedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRouter = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>          
            {/* Rutas públicas */}
          <Route path="/" element={<Welcome />} />

          {/* Ruta de ingreso de PIN */}
          <Route
            path="/pin"
            element={
              <PinRoute>
                <PinEntry />
              </PinRoute>
            }
          />

          {/* Rutas protegidas por autenticación */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </UserLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/habits/:habitId"
            element={
              <PrivateRoute>
                {/* <UserLayout> */}
                  <PageTransition>
                    <HabitDetail />
                  </PageTransition>
                {/* </UserLayout> */}
              </PrivateRoute>
            }
          />

          <Route
            path="/stats"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PageTransition>
                    <Stats />
                  </PageTransition>
                </UserLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/ranking"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PageTransition>
                    <Ranking />
                  </PageTransition>
                </UserLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/rewards"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PageTransition>
                    <Rewards />
                  </PageTransition>
                </UserLayout>
              </PrivateRoute>
            }
          />
        {/* Ruta protegida: Castigos de los usuarios */}
          <Route
            path="/punishments"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PageTransition>
                    <Punishments />
                  </PageTransition>
                </UserLayout>
              </PrivateRoute>
            }
          />

          {/* Rutas protegidas por rol admin: Panel de Benjamín */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <UserLayout>
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </UserLayout>
              </AdminRoute>
            }
          />

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

export default AppRouter;
