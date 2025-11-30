import React from "react";
import { FaUser, FaEdit } from "react-icons/fa";

const VITE_IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const CarteProfil = ({ onEditClick }) => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  
  const userImage = userData.image ? `${VITE_IMAGE_BASE_URL}${userData.image}` : null;

  return (
    
      <div className="carte-profil">
        <div className="carte-profil-header">
          <div className="carte-profil-avatar">
            {userImage ? (
              <img
                src={userImage}
                alt="Profil"
                 className="carte-profil-image-cercle"            />
            ) : (
              <div className="carte-profil-avatar-placeholder"><FaUser size={40} /></div>
            )}
          </div>
          <div className="carte-profil-info">
            <h3>{userData.nomUtilisateur || "Utilisateur"}</h3>
            <p>{userData.email || "Email"}</p>
          </div>
        </div>
        <div className="carte-profil-actions">
          <button onClick={onEditClick}><FaEdit /> Modifier le profil</button>
        </div>
      </div>
  
  );
};

export default CarteProfil;