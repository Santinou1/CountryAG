import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';
import { useApp } from './hooks/useApp';

function App() {
  const {
    currentUser,
    getUserTickets,
    purchaseTicket,
    logout,
    getPendingTickets,
    getConfirmedTickets,
    confirmTicket,
    useTicket
  } = useApp();

  // Proteger rutas y redirigir si no hay usuario autenticado
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = JSON.parse(localStorage.getItem('countryag-user') || 'null');
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <ClientView
                user={currentUser || { id: '', name: '', role: 'client' }}
                tickets={getUserTickets()}
                onPurchase={purchaseTicket}
                onLogout={logout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminView
                user={currentUser || { id: '', name: '', role: 'admin' }}
                pendingTickets={getPendingTickets()}
                confirmedTickets={getConfirmedTickets()}
                onConfirm={confirmTicket}
                onUseTicket={useTicket}
                onLogout={logout}
              />
            </ProtectedRoute>
          }
        />
        {/* Redirigir a login por defecto si no hay sesión */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;