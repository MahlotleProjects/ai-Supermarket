import React from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import { Toaster } from 'react-hot-toast';

function App() {
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