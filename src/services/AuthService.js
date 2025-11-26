import api from './api';
const USER_TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData';
const LOCAL_CART_KEY = 'localCart';

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

export const registerUser = async (userData) => {
  const res = await api.post('/register', {
    nomUtilisateur: userData.nomUtilisateur,     
    email: userData.email,
    contact: userData.contact,
    motDePasse: userData.motDePasse,
    motDePasse_confirmation: userData.motDePasse_confirmation
  });
  return res.data;
};

export const loginUser = async (loginData) => {
   const localCartItems = getLocalCart();

   
    const res = await api.post('/login', {
    email: loginData.email,
    motDePasse: loginData.motDePasse,
    local_cart_items: localCartItems 
  });
  
  if (res.data.access_token) {
       localStorage.setItem(USER_TOKEN_KEY, res.data.access_token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(res.data.user));
    
       clearLocalCart(); 
    
     }
  return res.data;
};
export const changeAdminPassword = async (payload) => {
  const token = sessionStorage.getItem(USER_TOKEN_KEY);
     const res = await api.post('/admin/change-password', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    new_password_confirmation: payload.newPasswordConfirmation
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; 
};

export const logoutUser = async () => {
 const token = localStorage.getItem(USER_TOKEN_KEY);
    try {
           await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion côté serveur:", error);
    }
  
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  }