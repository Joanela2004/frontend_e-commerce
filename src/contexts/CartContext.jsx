import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

const STORAGE_KEY = "cartData";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

 const addToCart = (item) => {
  setCartItems((prev) => {
    const existingIndex = prev.findIndex((i) =>
      i.numProduit && item.numProduit ? i.numProduit === item.numProduit : i.nom === item.nom
    );

    if (existingIndex !== -1) {
      const next = [...prev];
      next[existingIndex].poids = Number(next[existingIndex].poids || 0) + Number(item.poids || 1);
      return next;
    }

    return [
      ...prev,
      {
        ...item,
        id: `${Date.now()}-${Math.random()}`,
      prixApresDecoupe: item.prixPerKg * (item.coefficient || 1)
 
      },
    ];
  });
};


  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

const updateQuantity = (id, newPoids, newCuttingOption = null, newPrixUnit = null) => {
    setCartItems((prevItems) =>
        prevItems.map((item) =>
            item.id === id
                ? {
                      ...item,
                      poids: newPoids,
                      cuttingOption: newCuttingOption ?? item.cuttingOption,
                      prixApresDecoupe: newPrixUnit ?? item.prixApresDecoupe
                  }
                : item
        )
    );
};


  const clearCart = () => {
    setCartItems([]);
  };

  const totalWeight = cartItems.reduce(
    (sum, item) => sum + Number(item.poids || 0),
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) => total + item.prixApresDecoupe * Number(item.poids),
  0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalWeight,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};