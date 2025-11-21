import React from 'react';
import AppRoutes from "./routes/AppRoutes";
import ErrorBoundary from "./composants/ErrorBoundary";
export default function App(){
  return (
    <ErrorBoundary>
    <AppRoutes/>
    </ErrorBoundary>
  )
};
