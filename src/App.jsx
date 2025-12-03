import React from 'react';
import AppRoutes from "./routes/AppRoutes";
import { NouvelleCommandeProvider } from './contexts/Actualisation';
import "./styles/back-office/toast.css"
import { ToastProvider } from './contexts/ToastContext';
export default function App(){
  return (
   <ToastProvider>
    <NouvelleCommandeProvider>
    <AppRoutes/>
    </NouvelleCommandeProvider>
    </ToastProvider>
  )
};
