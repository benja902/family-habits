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
import { theme } from './styles/theme';

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
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  html, body {
    min-height: 100%;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
  }

  button, input, textarea, select {
    font: inherit;
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
