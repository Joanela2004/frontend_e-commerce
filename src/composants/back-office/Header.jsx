import React, { useState, useEffect } from "react";
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaLock, FaBell } from "react-icons/fa";
import profile from '../../assets/icones/log.png';
import ChangePasswordModal from "../../composants/front-office/Profil/ChangePasswordModal";
import "../../styles/back-office/Header.css";
import { useNouvelleCommande } from "../../contexts/Actualisation";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { newOrdersCount, loading } = useNouvelleCommande(); 

  useEffect(() => {
    const userDataFromStorage = localStorage.getItem('userData');
    if (userDataFromStorage) {
      setUserData(JSON.parse(userDataFromStorage));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    window.location.href = '/profil';
  };

  const handleChangePassword = () => {
    setIsProfileMenuOpen(false);
    setIsPasswordModalOpen(true);
  };

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
            {/* Conteneur de notification */}
            <div className="notification-container">
              <div 
                className="notification-icon"
                onClick={() => window.location.href = "/admin/commandes"}
                title="Nouvelles commandes"
              >
                <FaBell style={{ color: "#28a458" }} className="bell-icon" />
                {/* Affichage du compteur global */}
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
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <FaUserCircle className="profile-icon" />
                <span className="profile-name">
                  { userData?.nomUtilisateur || 'Admin'}
                </span>
                <FaCaretDown style={{ color: "#28a458" }} className={`caret-icon ${isProfileMenuOpen ? 'rotate' : ''}`} />
              </div>
              
              {isProfileMenuOpen && (
                <div className="profile-dropdown">
                  <div className="profile-info">
                    <p className="profile-email">{userData?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleChangePassword}
                    className="dropdown-option change-password-btn"
                  >
                    <FaLock className="dropdown-option-icon" style={{ color: "#28a458" }} />
                    Changer mot de passe
                  </button>

                  <button
                    onClick={handleLogout}
                    className="dropdown-option logout-btn"
                  >
                    <FaSignOutAlt className="dropdown-option-icon" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Header;