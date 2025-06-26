import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// Lazy load de vistas principales
const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));
const ClientView = lazy(() => import('./components/ClientView'));
const AdminView = lazy(() => import('./components/AdminView'));
const DriverView = lazy(() => import('./components/DriverView'));
import { Loader2 } from 'lucide-react';
import { useApp } from './hooks/useApp';

const PRIMARY_COLOR = 'text-blue-800'; // Cambia por el color principal de la empresa
const SECONDARY_COLOR = 'text-orange-400'; // Cambia por el color secundario de la empresa

function AppRoutes() {
  const location = useLocation();

  // Si estamos en login o register, solo carga esos componentes, sin hooks globales ni lógica de usuario
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen"><Loader2 className={`w-10 h-10 ${PRIMARY_COLOR} animate-spin mb-4`} /><span className={`${PRIMARY_COLOR} font-medium`}>Cargando...</span></div>}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // El resto de la app (con useApp y lógica de usuario)
  const {
    currentUser,
    logout,
    isAuthLoading
  } = useApp();

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

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className={`w-10 h-10 ${PRIMARY_COLOR} animate-spin mb-4`} />
        <span className={`${PRIMARY_COLOR} font-medium`}>Verificando sesión...</span>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen"><Loader2 className={`w-10 h-10 ${PRIMARY_COLOR} animate-spin mb-4`} /><span className={`${PRIMARY_COLOR} font-medium`}>Cargando...</span></div>}>
      <Routes>
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
                  <Loader2 className={`w-10 h-10 ${PRIMARY_COLOR} animate-spin mb-4`} />
                  <span className={`${PRIMARY_COLOR} font-medium`}>Cargando usuario...</span>
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
                  <Loader2 className={`w-10 h-10 ${PRIMARY_COLOR} animate-spin mb-4`} />
                  <span className={`${PRIMARY_COLOR} font-medium`}>Cargando usuario...</span>
                </div>
              )}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;