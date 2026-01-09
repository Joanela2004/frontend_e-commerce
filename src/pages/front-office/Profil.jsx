
import React, { useState } from "react";
import Header from "../../composants/Header";
import Footer from "../../composants/FooterSection";
import CarteProfil from "../../composants/front-office/Profil/CarteProfil";
import ModifierProfil from "../../composants/front-office/Profil/ModifierProfil";
import Authentifier from "../../composants/front-office/Profil/Authentifier";
import SeConnecter from "../../composants/front-office/Profil/SeConnecter";
import { logoutUser } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

import "../../styles/front-office/global.css";
import "../../styles/front-office/Profil/profil.css";

const Profil = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const token = localStorage.getItem("userToken");
  const isAuthenticated = !!token;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/", { replace: true });
    window.location.reload();
  };

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);

  return (
    <>
      <Header/>

      <main className="profil-page">
        <div className="profil-container">

          {isAuthenticated ? (
            <div className="profil-connected">
              <CarteProfil onEditClick={openEditModal} onLogout={handleLogout} />
              {showEditModal && (
                <div className="modal-overlay" onClick={closeEditModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                   
                    <ModifierProfil onClose={closeEditModal} />
                  </div>
                </div>
              )}
            </div>
          ) : (
           
            <div className="profil-guest">
                        <div className="forms-grid">
                <div className="form-card">
                  <Authentifier />
                </div>
                
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profil;