import React from 'react';
import { LoginView } from './components/LoginView';
import { ClientView } from './components/ClientView';
import { AdminView } from './components/AdminView';
import { useApp } from './hooks/useApp';

function App() {
  const {
    currentUser,
    view,
    login,
    logout,
    purchaseTicket,
    confirmTicket,
    useTicket,
    getUserTickets,
    getPendingTickets,
    getConfirmedTickets
  } = useApp();

  if (view === 'login') {
    return <LoginView onLogin={login} />;
  }

  if (view === 'client' && currentUser) {
    return (
      <ClientView
        user={currentUser}
        tickets={getUserTickets()}
        onPurchase={purchaseTicket}
        onLogout={logout}
      />
    );
  }

  if (view === 'admin' && currentUser) {
    return (
      <AdminView
        user={currentUser}
        pendingTickets={getPendingTickets()}
        confirmedTickets={getConfirmedTickets()}
        onConfirm={confirmTicket}
        onUseTicket={useTicket}
        onLogout={logout}
      />
    );
  }

  return <LoginView onLogin={login} />;
}

export default App;