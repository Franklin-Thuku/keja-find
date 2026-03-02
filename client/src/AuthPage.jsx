import React from 'react';
import AuthModal from './AuthModal';

const AuthPage = ({ mode }) => {
  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
    
      <AuthModal initialMode={mode} />
    </div>
  );
};

export default AuthPage;