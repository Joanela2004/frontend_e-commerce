import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNewOrdersCount, markCommandeAsConsulted, fetchCommandes } from '../services/commandeService';

const NouvelleCommandeContext = createContext(null);

export const useNouvelleCommande = () => {
    const context = useContext(NouvelleCommandeContext);
    if (!context) throw new Error("useNouvelleCommande doit être utilisé dans un Provider");
    return context;
};

export const NouvelleCommandeProvider = ({ children }) => {
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadNewOrders = async () => {
        setLoading(true);
        try {
            const count = await getNewOrdersCount();
            setNewOrdersCount(count);
        } catch (err) {
            console.error("Erreur chargement nouvelles commandes", err);
            setNewOrdersCount(0);
        } finally {
            setLoading(false);
        }
    };

    const markAsConsulted = async (numCommande) => {
        try {
            await markCommandeAsConsulted(numCommande);
            setNewOrdersCount(prev => Math.max(0, prev - 1));
                await loadNewOrders();
        } catch (err) {
            console.error("Erreur markAsConsulted", err);
            throw err;
        }
    };

    useEffect(() => {
        loadNewOrders();
        const interval = setInterval(loadNewOrders, 30000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <NouvelleCommandeContext.Provider value={{
            newOrdersCount,
            loading,
            refreshOrders: loadNewOrders,
            markAsConsulted
        }}>
            {children}
        </NouvelleCommandeContext.Provider>
    );
};