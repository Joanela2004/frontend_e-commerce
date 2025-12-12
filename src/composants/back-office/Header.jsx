import React, { useState, useEffect } from "react";
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaLock, FaBell } from "react-icons/fa";
import profile from '../../assets/icones/log.png';
import ChangePasswordModal from "../../composants/front-office/Profil/ChangePasswordModal";
import "../../styles/back-office/Header.css";
import { useNouvelleCommande } from "../../contexts/Actualisation";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/AuthService"; // Assure-toi que c'est bien le bon chemin

const Header = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { newOrdersCount, loading } = useNouvelleCommande();

  useEffect(() => {
    const data = localStorage.getItem('userData');
    if (data) {
      try {
        setUserData(JSON.parse(data));
      } catch (e) {
        console.error("Erreur parsing userData", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false); // Ferme le menu

    try {
      await logoutUser(); 
    } catch (err) {
      console.warn("Erreur serveur lors du logout (ignorée)", err);
    } finally {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('localCart');

      
      document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
      document.body.style.overflow = 'auto';

      navigate("/", { replace: true });
    }
  };

  const handleChangePassword = () => {
    setIsProfileMenuOpen(false);
    setIsPasswordModalOpen(true);
  };

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo-mobile">
              <img src={profile} alt="admin-profile" />
            </div>
          </div>

          <div className="header-right">
            {/* Notification */}
            <div className="notification-container">
              <div
                className="notification-icon"
                onClick={() => navigate("/admin/commandes")}
                title="Nouvelles commandes"
                style={{ cursor: "pointer" }}
              >
                <FaBell className="bell-icon" style={{ color: "#28a745" }} />
                {newOrdersCount > 0 && !loading && (
                  <span className="notification-badge">
                    {newOrdersCount > 99 ? '99+' : newOrdersCount}
                  </span>
                )}
              </div>
            </div>

            {/* Menu profil */}
            <div className="profile-menu-container">
              <div
                className="profile-toggle"
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                style={{ cursor: "pointer" }}
              >
                <FaUserCircle className="profile-icon" />
                <span className="profile-name">
                  {userData?.email}
                </span>
                <FaCaretDown
                  className={`caret-icon ${isProfileMenuOpen ? 'rotate' : ''}`}
                  style={{ color: "#28a745" }}
                />
              </div>

              {isProfileMenuOpen && (
                <div className="profile-dropdown" style={{display:"flex",alignItems:"center",flexDirection:"column",justifyContent:"center"}}>
                  

                  <button onClick={handleChangePassword} className="dropdown-option change-password-btn">
                    <FaLock className="dropdown-option-icon" style={{ color: "#28a745" }} />
                    Changer mot de passe
                  </button>

                  <button onClick={handleLogout} className="btn" style={{fontSize:"1rem", margin:"10px 10px"}}>
                Se déconnecter
              </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal changement mot de passe */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;