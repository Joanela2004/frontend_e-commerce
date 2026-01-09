import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaImage,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaPaperPlane,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { createArticle, updateArticle } from "../../../services/articleService";
import { useToast } from "../../../contexts/ToastContext";
import TiptapEditor from "./TiptapEditor";
import DatePicker from "react-datepicker"; // ← Ajoutez cette importation
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale"; // ← Pour le format français

const AjouterArticleModal = ({ isOpen, onClose, onSave, articleAEditer }) => {
  const today = new Date();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    titre: "",
    description: "",
    contenu: "",
    auteur: "",
    datePublication: today, // ← On garde un objet Date ici maintenant
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  // Fonction pour formater proprement une date → YYYY-MM-DD (pour l'API)
  const formatDateForAPI = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Chargement des données en édition
  useEffect(() => {
    if (articleAEditer) {
     let publicationDate = articleAEditer.datePublication
  ? new Date(articleAEditer.datePublication)
  : today;

// Si la date est invalide, on remet aujourd'hui
if (isNaN(publicationDate.getTime())) {
  publicationDate = today;
}


      setForm({
        titre: articleAEditer.titre || "",
        description: articleAEditer.description || "",
        contenu: articleAEditer.contenu || "",
        auteur: articleAEditer.auteur || "",
        datePublication: publicationDate,
        image: null,
      });

      setImagePreview(
        articleAEditer.image
          ? `${import.meta.env.VITE_IMAGE_BASE_URL}${articleAEditer.image}`
          : null
      );

      setEditorKey((prev) => prev + 1);
    } else {
      setForm({
        titre: "",
        description: "",
        contenu: "",
        auteur: "",
        datePublication: today,
        image: null,
      });
      setImagePreview(null);
      setEditorKey(0);
    }
    setErrors({});
  }, [articleAEditer, isOpen]);

  const handleChange = (e) => {
    const { name, files } = e.target;

    if (files && name === "image") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showToast("error", "Le fichier est trop volumineux (max 5 Mo).");
          return;
        }
        setForm((prev) => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else if (name) {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, datePublication: date || today }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.titre.trim()) newErrors.titre = "Le titre est obligatoire.";
    if (!form.description.trim()) newErrors.description = "La description est obligatoire.";
    if (!form.contenu.trim()) newErrors.contenu = "Le contenu est obligatoire.";
    if (!form.auteur.trim()) newErrors.auteur = "L'auteur est obligatoire.";
    if (!form.datePublication) newErrors.datePublication = "La date est obligatoire.";
    if (!articleAEditer && !form.image) newErrors.image = "Une image est requise.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("error", "Veuillez corriger les erreurs.");
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("titre", form.titre);
    formData.append("description", form.description);
    formData.append("contenu", form.contenu);
    formData.append("auteur", form.auteur);
    formData.append("datePublication", formatDateForAPI(form.datePublication));

    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    if (articleAEditer) {
      formData.append("_method", "PUT");
    }

    try {
      if (articleAEditer) {
        await updateArticle(articleAEditer.numArticle, formData);
        showToast("success", "Article modifié avec succès !");
      } else {
        await createArticle(formData);
        showToast("success", "Article ajouté avec succès !");
      }
      onSave();
      setTimeout(() => onClose(), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de l'enregistrement.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="modal modal-lg">
        <form onSubmit={handleSubmit} style={{ padding: "10px 20px" }}>
          <div className="modal-header">
            <h2>{articleAEditer ? "Modifier l'article" : "Nouvel article"}</h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            <div
              className="form-layout-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
            >
              {/* Titre */}
              <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                <label htmlFor="titre" className="required">
                  <FaFileAlt /> Titre de l'article
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={form.titre}
                  onChange={handleChange}
                  className={`form-control ${errors.titre ? "error" : ""}`}
                  required
                />
                {errors.titre && <div className="error-message">{errors.titre}</div>}
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                <label htmlFor="description" className="required">
                  Description courte (résumé)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`form-control textarea ${errors.description ? "error" : ""}`}
                  rows="3"
                  maxLength="255"
                  required
                />
                <small style={{ float: "right", color: "var(--color-text-light)" }}>
                  {form.description.length}/255
                </small>
                {errors.description && (
                  <div className="error-message">{errors.description}</div>
                )}
              </div>

              {/* Contenu Tiptap */}
              <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                <label className="required">Contenu complet</label>
                <TiptapEditor
                  key={editorKey}
                  content={form.contenu}
                  onUpdate={(html) => setForm((prev) => ({ ...prev, contenu: html }))}
                />
                {errors.contenu && <div className="error-message">{errors.contenu}</div>}
              </div>

              {/* Auteur */}
              <div className="form-group">
                <label htmlFor="auteur" className="required">
                  <FaUser /> Auteur
                </label>
                <input
                  type="text"
                  id="auteur"
                  name="auteur"
                  value={form.auteur}
                  onChange={handleChange}
                  className={`form-control ${errors.auteur ? "error" : ""}`}
                  required
                />
                {errors.auteur && <div className="error-message">{errors.auteur}</div>}
              </div>

              {/* Date de publication - CORRIGÉE */}
              <div className="form-group">
                <label className="required">
                  <FaCalendarAlt /> Date de publication
                </label>
                <DatePicker
                  selected={form.datePublication}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  locale={fr}
                  className={`form-control ${errors.datePublication ? "error" : ""}`}
                  placeholderText="jj/mm/aaaa"
                  isClearable={false}
                  minDate={today}
                />
                {errors.datePublication && (
                  <div className="error-message">{errors.datePublication}</div>
                )}
              </div>

              {/* Image */}
              <div className="form-group" style={{ gridColumn: "1 / 3" }}>
                <label htmlFor="image">
                  Image de l'article {articleAEditer ? "(facultatif)" : "(requis)"}
                </label>
                <div className={`file-input-container ${errors.image ? "error" : ""}`}>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="form-control"
                  />
                  <small style={{ color: "#6c757d", display: "block", marginTop: "8px" }}>
                    Formats : JPG, PNG, SVG. Max : 5 Mo
                  </small>
                </div>
                {errors.image && <div className="error-message">{errors.image}</div>}

                {imagePreview && (
                  <div style={{ marginTop: "15px", textAlign: "center" }}>
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      style={{
                        maxWidth: "300px",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="actions-container">
            <button type="button" className="edit" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spin" /> Enregistrement...
                </>
              ) : articleAEditer ? (
                <>
                  <FaSave style={{ marginRight: "10px" }} /> Mettre à jour
                </>
              ) : (
                <>
                  <FaPaperPlane style={{ marginRight: "10px" }} /> Publier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterArticleModal;