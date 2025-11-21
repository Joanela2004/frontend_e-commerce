import React, { useState, useEffect } from "react";
import { FaUserCircle, FaCaretDown, FaSignOutAlt, FaLock, FaBell } from "react-icons/fa";
import profile from '../../assets/icones/log.png';
import ChangePasswordModal from "../../composants/front-office/Profil/ChangePasswordModal";
import "../../styles/back-office/Header.css";
import { useNouvelleCommande } from "../../contexts/Actualisation"; // 👈 IMPORT DU HOOK

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Utilisation du compteur global du Context
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

            <div 
              className="notification-icon"
              onClick={() => window.location.href = "/admin/commandes"}
            >
              <FaBell className="bell-icon" />

              {/* Affichage du compteur global */}
              {newOrdersCount > 0 && !loading && (
                <span className="notification-badge">{newOrdersCount}</span>
              )}
            </div>

            <div className="profile-menu-container">
              <div 
                className="profile-toggle"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <FaUserCircle className="profile-icon" />
                <span className="profile-name">
                  {userData?.prenom || userData?.nom || 'Admin'}
                </span>
                <FaCaretDown className={`caret-icon ${isProfileMenuOpen ? 'rotate' : ''}`} />
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
                    <FaLock className="dropdown-option-icon" />
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