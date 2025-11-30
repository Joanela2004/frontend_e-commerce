import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaCheck, FaTimes } from "react-icons/fa";
import { getProfilUtilisateur, updateProfilUtilisateur } from "../../../services/utilisateurService";

const VITE_IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ModifierProfil = ({ onClose }) => {
  const [userData, setUserData] = useState({
    nomUtilisateur: "",
    email: "",
    contact: "",
    image: null, // File sélectionné
  });

  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
  const fetchUserData = async () => {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
   const userId = storedUser.numUtilisateur ;

if (!userId) {
  setMessage({ type: "error", text: "ID utilisateur non disponible." });
  return;
}

    try {
      const data = await getProfilUtilisateur(userId);
      console.log("data API:", data);
      setUserData({
        nomUtilisateur: data.nomUtilisateur,
        contact: data.contact,
        image: null,
      });

      if (data.image) {
        setPreviewImage(`${VITE_IMAGE_BASE_URL}${data.image}`);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement du profil." });
    }
  };

  fetchUserData();
}, []);


  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      setMessage({ type: "error", text: "Format d'image invalide !" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "L'image ne doit pas dépasser 2 Mo !" });
      return;
    }

    setUserData({ ...userData, image: file });

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage({ type: "", text: "" });
  setIsLoading(true);

  try {
    const formData = new FormData();

    // Champs obligatoires
    formData.append("nomUtilisateur", userData.nomUtilisateur);
    formData.append("contact", userData.contact || "");

    // Image : seulement si nouvelle photo sélectionnée
    if (userData.image instanceof File) {
      console.log("Image ajoutée :", userData.image.name);
      formData.append("image", userData.image);
    }

    // LA CLÉ MAGIQUE – OBLIGATOIRE
    formData.append("_method", "PUT");

    // Récupération sécurisée de l'ID
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const userId = storedUser.numUtilisateur || storedUser.id;

    if (!userId) {
      setMessage({ type: "error", text: "ID utilisateur manquant. Reconnectez-vous." });
      setIsLoading(false);
      return;
    }

    // Envoi
    const response = await updateProfilUtilisateur(userId, formData);

    // Mise à jour réussie
    const updatedUser = response.utilisateur || response;

    localStorage.setItem("userData", JSON.stringify(updatedUser));

    setUserData({
      nomUtilisateur: updatedUser.nomUtilisateur,
      contact: updatedUser.contact,
      image: null,
    });

    if (updatedUser.image) {
      setPreviewImage(`${VITE_IMAGE_BASE_URL}${updatedUser.image}`);
    }

    setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
    setTimeout(() => onClose(), 1200);

  } catch (error) {
    console.error("Erreur complète :", error.response?.data);

    let msg = "Erreur lors de la mise à jour du profil.";
    if (error.response?.data?.errors?.image) {
      msg = error.response.data.errors.image.join(" ");
    } else if (error.response?.data?.message) {
      msg = error.response.data.message;
    } else if (error.response?.status === 401) {
      msg = "Session expirée. Veuillez vous reconnecter.";
    }

    setMessage({ type: "error", text: msg });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="conteneur-formulaire modal-form">
      <form onSubmit={handleSubmit}>
        <div className="titre">
          <h1>Modifier mon profil</h1>
          <h2>Mettez à jour vos informations personnelles</h2>
        </div>

        {/* Photo de profil */}
        <div className="photo-profil-section">
          <div className="photo-profil-container">
            <div className="photo-profil">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="profil"
                 
                />
              ) : (
                <div className="photo-profil-placeholder"><FaUser size={40} /></div>
              )}
            </div>

            <label htmlFor="image-upload" className="bouton-modifier-photo">
              <FaCamera /> Modifier la photo
            </label>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Champs texte */}
        <div className="groupe-formulaire">
          <label>Nom d'utilisateur</label>
          <div className="champ-avec-icone">
            <FaUser className="icone-champ" />
            <input type="text" name="nomUtilisateur" value={userData.nomUtilisateur} onChange={handleChange} required />
          </div>
        </div>

       

        <div className="groupe-formulaire">
          <label>Téléphone</label>
          <div className="champ-avec-icone">
            <FaPhone className="icone-champ" />
            <input type="tel" name="contact" value={userData.contact} onChange={handleChange} required />
          </div>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`message-status ${message.type}`}>
            {message.type === "success" ? <FaCheck /> : <FaTimes />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="bouton bouton-secondaire" onClick={onClose} disabled={isLoading}>
            Annuler
          </button>
          <button type="submit" className="bouton bouton-primaire" disabled={isLoading}>
            {isLoading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierProfil;
