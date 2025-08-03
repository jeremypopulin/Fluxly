import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DebugUser: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log("🔍 USER DEBUG:", user);
  }, [user]);

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#eee', padding: '8px', fontSize: '12px' }}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
};

export default DebugUser;
