
import React, { useEffect } from 'react';
import AppRoutes from "./routes/AppRoutes";
import { NouvelleCommandeProvider } from './contexts/Actualisation';
import { ToastProvider } from './contexts/ToastContext';

export default function App() {

  useEffect(() => {
    const nettoyerOverlays = () => {
         if (!localStorage.getItem('userToken')) {
        const overlays = document.querySelectorAll('.modal-overlay');
        console.log(`Nettoyage de ${overlays.length} overlay(s) fantôme(s)`);
        overlays.forEach(el => el.remove());
        
               document.body.style.overflow = 'auto';
      }
    };

    nettoyerOverlays();

     window.addEventListener('storage', nettoyerOverlays);

    return () => window.removeEventListener('storage', nettoyerOverlays);
  }, []);

  return (
    <ToastProvider>
      <NouvelleCommandeProvider>
        <AppRoutes />
      </NouvelleCommandeProvider>
    </ToastProvider>
  );
}