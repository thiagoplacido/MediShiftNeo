import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Importa o provedor de autenticação e o hook para usá-lo
// CORREÇÃO: Removido o './context/' do caminho
import { AuthProvider, useAuth } from './AuthContext'; 
// Importa as páginas
// CORREÇÃO: Removido o './components/' do caminho
import PaginaLogin from './PaginaLogin';
import PainelDeControle from './PainelDeControle';
// Importa os estilos globais
// CORREÇÃO: Removido o './styles/' do caminho
import GlobalStyle from './GlobalStyle';

/**
 * Componente de Rota Protegida (Helper Component)
 * (Este componente permanece exatamente igual)
 */
function RotaProtegida({ children }) {
  const { autenticado } = useAuth();

  if (!autenticado) {
    // Usuário não autenticado, redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  // Usuário autenticado, permite o acesso ao componente 'children'
  return children;
}

/**
 * Componente que define o conteúdo principal e as rotas
 * (Este componente permanece exatamente igual)
 */
function AppContent() {
  return (
    <>
      <GlobalStyle /> {/* Aplica os estilos globais em toda a aplicação */}
      <Router>
        <Routes> {/* O 'Routes' define a área onde as rotas serão trocadas */}
          
          {/* Rota Pública: Página de Login */}
          <Route path="/" element={<PaginaLogin />} />

          {/* Rota Privada: Painel de Controle */}
          <Route
            path="/painel"
            element={
              <RotaProtegida> {/* Envolvemos o painel na nossa RotaProtegida */}
                <PainelDeControle />
              </RotaProtegida>
            }
          />
          
        </Routes>
      </Router>
    </>
  );
}

/**
 * Componente Principal (App)
 * (Este componente permanece exatamente igual)
 */
function App() {
  return (
    <AuthProvider> {/* O Provedor envolve toda a aplicação */}
      <AppContent /> {/* O conteúdo (incluindo as rotas) é renderizado aqui */}
    </AuthProvider>
  );
}

export default App;