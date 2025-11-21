import api from './api';

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
  const res = await api.post('/login', {
    email: loginData.email,
    motDePasse: loginData.motDePasse
  });
   if(res.data.access_token) {
    sessionStorage.setItem('userToken', res.data.access_token);
    sessionStorage.setItem('userData', JSON.stringify(res.data.user));
}
  return res.data;
};

export const changeAdminPassword = async (payload) => {
   const token = sessionStorage.getItem('userToken');  const res = await api.post('/admin/change-password', {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    new_password_confirmation: payload.newPasswordConfirmation
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; 
};

export const logoutUser = async () => {
  const token = localStorage.getItem('userToken');
  if (token) {
    try {
           await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion côté serveur:", error);
    }
  }
  sessionStorage.removeItem('userToken');
sessionStorage.removeItem('userData');}
