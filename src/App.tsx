import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';
import { DriverView } from './components/DriverView';
import { useApp } from './hooks/useApp';
import { Loader2 } from 'lucide-react';

function App() {
  const {
    currentUser,
    getUserTickets,
    purchaseTicket,
    logout,
    getPendingTickets,
    getConfirmedTickets,
    confirmTicket,
    useTicket,
    isAuthLoading
  } = useApp();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
        <span className="text-green-700 font-medium">Verificando sesión...</span>
      </div>
    );
  }

  // Ruta protegida por rol
  const ProtectedRoute = ({ children, allowedRoles, currentUser }: { children: React.ReactNode, allowedRoles?: string[], currentUser: any }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
      if (currentUser.role === 'chofer') return <Navigate to="/driver" replace />;
      if (currentUser.role === 'usuario') return <Navigate to="/home" replace />;
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
            <ProtectedRoute allowedRoles={['usuario']} currentUser={currentUser}>
              <ClientView
                user={currentUser || { id: '', name: '', email: '', role: 'usuario' }}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']} currentUser={currentUser}>
              {currentUser && currentUser.id ? (
                <AdminView
                  user={currentUser}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                  <span className="text-green-700 font-medium">Cargando usuario...</span>
                </div>
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles={['chofer']} currentUser={currentUser}>
              {currentUser && currentUser.id ? (
                <DriverView
                  user={currentUser}
                  onLogout={logout}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-screen">
                  <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                  <span className="text-green-700 font-medium">Cargando usuario...</span>
                </div>
              )}
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