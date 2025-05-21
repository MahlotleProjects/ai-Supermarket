import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import AuthForm from './components/Auth/AuthForm';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';

function App() {
  const [session, setSession] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthForm onSuccess={() => setSession(true)} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <AppProvider>
        <Layout />
      </AppProvider>
    </>
  );
}

export default App;