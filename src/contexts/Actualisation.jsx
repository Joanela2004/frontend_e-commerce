import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCommandes } from '../services/commandeService'; 

const NouvelleCommandeContext = createContext(null);

export const useNouvelleCommande = () => {
  const context = useContext(NouvelleCommandeContext);
  if (!context) {
    throw new Error('useNouvelleCommande doit être utilisé à l\'intérieur d\'un NouvelleCommandeProvider');
  }
  return context;
};

export const NouvelleCommandeProvider = ({ children }) => {
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNewOrders = async () => {
    setLoading(true);
    try {
      const commandes = await fetchCommandes(); 
      const count = commandes.filter(cmd => !cmd.estConsulte).length; 
      setNewOrdersCount(count);
    } catch (e) {
      setNewOrdersCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewOrders();
  }, []);

  const contextValue = {
    newOrdersCount,
    loading,
    refreshOrders: loadNewOrders, 
  };

  return (
    <NouvelleCommandeContext.Provider value={contextValue}>
      {children}
    </NouvelleCommandeContext.Provider>
  );
};