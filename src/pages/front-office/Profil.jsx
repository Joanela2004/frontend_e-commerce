// src/pages/front-office/Profil.js
import React, { useState } from "react";
import Header from "../../composants/Header";
import Footer from "../../composants/FooterSection";
import SeConnecter from "../../composants/front-office/Profil/SeConnecter";
import Authentifier from "../../composants/front-office/Profil/Authentifier";
import ModifierProfil from "../../composants/front-office/Profil/ModifierProfil";
import CarteProfil from "../../composants/front-office/Profil/CarteProfil";
import { logoutUser } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import "../../styles/front-office/global.css";
import "../../styles/front-office/Profil/profil.css";

const Profil = () => {
  const [showModal, setShowModal] = useState(false);
  const token = sessionStorage.getItem("userToken");
  const isAuthenticated = !!token;
  const navigate = useNavigate();

  const handleEditProfile = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate("/", { replace: true });
    window.location.reload();
  };

  return (
    <div>
      <Header />
      
      <div className="profil-container">
        {isAuthenticated ? (
          <>
            {/* Carte profil au-dessus des deux formulaires */}
            <div className="profil-carte-wrapper">
              <CarteProfil 
                onEditClick={handleEditProfile}
                onLogout={handleLogout}
              />
            </div>

            {/* Les deux formulaires restent visibles mais peuvent être désactivés visuellement */}
            <div className={`profil-forms-container ${isAuthenticated ? 'forms-disabled' : ''}`}>
              <div className="profil-box">
                <Authentifier />
              </div>

              <div className="profil-box">
                <SeConnecter />
              </div>
            </div>

            {/* Modal pour modifier le profil */}
            {showModal && (
              <div className="modal-overlay" onClick={handleCloseModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close-btn" onClick={handleCloseModal}>
                    ×
                  </button>
                  <ModifierProfil onClose={handleCloseModal} />
                </div>
              </div>
            )}
          </>
        ) : (
          // Affichage normal quand non connecté
          <>
            <div className="profil-box">
              <Authentifier />
            </div>

            <div className="profil-box">
              <SeConnecter />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Profil;