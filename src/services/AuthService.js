// src/services/authService.js
import api from './api';

const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';
const LOCAL_CART_KEY = 'localCart';

// Récupère le panier local (invité)
export const getLocalCart = () => {
  const cartData = localStorage.getItem(LOCAL_CART_KEY);
  try {
    return cartData ? JSON.parse(cartData) : [];
  } catch (e) {
    console.error("Erreur de parsing du panier local", e);
    return [];
  }
};

const clearLocalCart = () => {
  localStorage.removeItem(LOCAL_CART_KEY);
};

// Inscription
export const registerUser = async (userData) => {
  const res = await api.post('/register', {
    nomUtilisateur: userData.nomUtilisateur,
    email: userData.email,
    contact: userData.contact,
    motDePasse: userData.motDePasse,
    motDePasse_confirmation: userData.motDePasse_confirmation,
  });
  return res.data;
};

// Connexion
export const loginUser = async (loginData) => {
  const localCartItems = getLocalCart();
  const res = await api.post('/login', {
    email: loginData.email,
    motDePasse: loginData.motDePasse,
    local_cart_items: localCartItems,
  });

  if (res.data.access_token) {
    localStorage.setItem(USER_TOKEN_KEY, res.data.access_token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(res.data.user));
    clearLocalCart();

    // === NOUVELLE LOGIQUE : Redirection intelligente après login ===
    const redirectAfterLogin = localStorage.getItem("redirectAfterLogin");

    if (redirectAfterLogin === "/panier") {
            const savedStep = localStorage.getItem("checkoutStepAfterLogin") || "2"; // par défaut étape 2

     localStorage.removeItem("redirectAfterLogin");
      localStorage.removeItem("checkoutStepAfterLogin");

           localStorage.setItem("pendingCheckoutRedirect", JSON.stringify({
        path: "/panier",
        step: Number(savedStep)
      }));
    }
    // ================================================================

  }

  return res.data;
};

export const changeAdminPassword = async (payload) => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  const res = await api.post('/change-password', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    new_password_confirmation: payload.newPasswordConfirmation,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json', 
    },
  });
  return res.data;
};

export const logoutUser = async () => {
  const token = localStorage.getItem(USER_TOKEN_KEY);

  if (!token) {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    return;
  }

  try {
    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',        // OBLIGATOIRE pour éviter le 500
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
       console.warn("Erreur serveur lors du logout (ignorée) :", error.message);
     } finally {
   
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
 
  }
};
export const envoyerCodeReset = (data) => {
  return api.post(`/mot-de-passe-oublie`, data);
};

export const verifierCodeEtReset = ({ email, code, password, password_confirmation }) => {
  return api.post('/reinitialiser-mot-de-passe', {
    email,
    code,
    password,
    password_confirmation
  });
};