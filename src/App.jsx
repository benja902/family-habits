/**
 * Punto de entrada principal del Panel Familiar de Hábitos y Recompensas.
 * Configura los providers globales y los estilos base de la aplicación.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { Toaster } from 'sonner';
import AppRouter from './router/AppRouter';

// Configuración del cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Detecta cuando el usuario vuelve a la pantalla
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Estilos globales de la aplicación
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background: #F8FAFC;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
  }
`;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GlobalStyle />
        <Toaster
          position="top-center"
          richColors
          duration={2500}
          toastOptions={{
            style: {
              zIndex: 99999,
            }
          }}
        />
        <AppRouter />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
