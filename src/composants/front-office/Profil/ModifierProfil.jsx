// src/composants/front-office/Profil/ModifierProfil.js
import React, { useState, useEffect } from "react";
import { getProfilUtilisateur, updateProfilUtilisateur } from "../../../services/utilisateurService";
import "../../../styles/front-office/Profil/profil.css";
const VITE_IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ModifierProfil = ({ onClose }) => {
  const [userData, setUserData] = useState({
    nomUtilisateur: "",
    contact: "",
    image: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadUser = async () => {
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = stored.numUtilisateur || stored.id;

      if (!userId) {
        setMessage({ type: "error", text: "Utilisateur non trouvé" });
        return;
      }

      try {
        const data = await getProfilUtilisateur(userId);
        setUserData({
          nomUtilisateur: data.nomUtilisateur || "",
          contact: data.contact || "",
          image: null,
        });
        if (data.image) {
          setPreviewImage(`${VITE_IMAGE_BASE_URL}${data.image}`);
        }
      } catch (err) {
        setMessage({ type: "error", text: "Impossible de charger le profil" });
      }
    };
    loadUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Format non supporté" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image trop lourde (max 3 Mo)" });
      return;
    }

    setUserData({ ...userData, image: file });
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    const stored = JSON.parse(localStorage.getItem("userData") || "{}");
    const userId = stored.numUtilisateur || stored.id;

    const formData = new FormData();
    formData.append("nomUtilisateur", userData.nomUtilisateur);
    formData.append("contact", userData.contact);
    if (userData.image instanceof File) {
      formData.append("image", userData.image);
    }
    formData.append("_method", "PUT");

    try {
      const res = await updateProfilUtilisateur(userId, formData);
      const updatedUser = res.utilisateur || res;

      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });

      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Erreur lors de la sauvegarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-profil-edit">
      <button className="modal-close-x" onClick={onClose} aria-label="Fermer">
        ×
      </button>

      <div className="photo-upload-section">
        <div className="photo-preview">
          {previewImage ? (
            <img src={previewImage} alt="Photo de profil" />
          ) : (
            <div className="photo-placeholder">
              {(userData.nomUtilisateur || "?")[0].toUpperCase()}
            </div>
          )}
        </div>

        <label className="btn-change-photo">
          Changer la photo
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="edit-form">
        <div className="groupe-formulaire">
          <label>Nom d'utilisateur</label>
          <input
            type="text"
            value={userData.nomUtilisateur}
            onChange={(e) => setUserData({ ...userData, nomUtilisateur: e.target.value })}
            required
            placeholder="Ex: Jean Dupont"
          />
        </div>

        <div className="groupe-formulaire">
          <label>Téléphone</label>
          <input
            type="tel"
            value={userData.contact}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 10) setUserData({ ...userData, contact: val });
            }}
            required
            placeholder="0341234567"
          />
        </div>

        {message.text && (
          <div className={`message-alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="modal-buttons">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifierProfil;