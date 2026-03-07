import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import UserDashboard from './UserDashboard';
import LandlordDashboard from './LandlordDashboard';

function DashboardRouter() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeRole = async () => {
      // 1. Read role directly from localStorage as set by AuthModal
      const role = localStorage.getItem('userRole') || 'student';
      setUserRole(role);

      // 2. Check if a newly Google-Auth'd user needs their Profile row created
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Did they just OAuth without hitting our strict Signup code?
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        // If no profile exists, they are a brand new Google Signup! Create it.
        if (!profile) {
          await supabase.from('profiles').insert([
            { id: session.user.id, role: role }
          ]);
        }
      }

      setLoading(false);
    };

    initializeRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Route significantly based on the fetched user role
  if (userRole === 'landlord') {
    return <LandlordDashboard />;
  }

  // Default to UserDashboard for students and unauthenticated users
  return <UserDashboard />;
}

export default DashboardRouter;