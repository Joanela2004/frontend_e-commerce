import React from 'react';
import AppRoutes from "./routes/AppRoutes";
import { NouvelleCommandeProvider } from './contexts/Actualisation';
export default function App(){
  return (
  
    <NouvelleCommandeProvider>
    <AppRoutes/>
    </NouvelleCommandeProvider>
    
  )
};
