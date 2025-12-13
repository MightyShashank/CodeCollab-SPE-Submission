import './App.css'
import React from 'react';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes'; 
import { Toaster } from 'react-hot-toast'; // import Toaster

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AppRoutes />
        {/* Toast container (will render toast popups) */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2000, // default duration (2s)
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              padding: '10px 16px',
            },
          }}
        />
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
