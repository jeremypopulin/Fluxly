import React from 'react';
import LoginForm from '@/components/LoginForm';
import Dashboard from './Dashboard';
import { useAuth } from '@/contexts/AuthContext';



const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <Dashboard />
    </div>
  );
};

export default AppLayout;
