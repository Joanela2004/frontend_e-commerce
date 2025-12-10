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
import { useToast } from "../../../contexts/ToastContext"; // Importer useToast
import TiptapEditor from "./TiptapEditor"; // Adapte le chemin
const AjouterArticleModal = ({ isOpen, onClose, onSave, articleAEditer }) => {
  const today = new Date().toISOString().split("T")[0];
  const { showToast } = useToast(); // Utiliser le hook toast

  const [form, setForm] = useState({
    titre: "",
    description: "",
    contenu: "",
    auteur: "",
    datePublication: today,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (articleAEditer) {
      setForm({
        titre: articleAEditer.titre || "",
        description: articleAEditer.description || "",
        contenu: articleAEditer.contenu || "",
        auteur: articleAEditer.auteur || "",
        datePublication: articleAEditer.datePublication
          ? articleAEditer.datePublication.split("T")[0]
          : today,
        image: null,
      });
      setImagePreview(
        articleAEditer.image
          ? `${import.meta.env.VITE_IMAGE_BASE_URL}${articleAEditer.image}`
          : null
      );
    } else {
      resetForm();
    }
  }, [articleAEditer, isOpen]);

  const resetForm = () => {
    setForm({
      titre: "",
      description: "",
      contenu: "",
      auteur: "",
      datePublication: today,
      image: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && name === "image") {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setErrors((prev) => ({
            ...prev,
            image: "Le fichier est trop volumineux (max 5 Mo).",
          }));
          setForm((prev) => ({ ...prev, image: null }));
          setImagePreview(null);
          showToast("error", "Le fichier est trop volumineux (max 5 Mo).");
          return;
        }

        setForm((prev) => ({ ...prev, image: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!form.titre.trim()) newErrors.titre = "Le titre est obligatoire.";
    if (!form.description.trim()) newErrors.description = "La description est obligatoire.";
    if (!form.contenu.trim()) newErrors.contenu = "Le contenu est obligatoire.";
    if (!form.auteur.trim()) newErrors.auteur = "L'auteur est obligatoire.";
    if (!form.datePublication) newErrors.datePublication = "La date est obligatoire.";
    if (!articleAEditer && !form.image) newErrors.image = "Une image d'article est requise.";
    
    setErrors(newErrors);
           if (Object.keys(newErrors).length > 0) {
      showToast("error", "Veuillez corriger les erreurs dans le formulaire");
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
    formData.append("datePublication", form.datePublication);

    if (form.image && form.image instanceof File) {
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
      
      // Fermer le modal après un délai
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);

    } catch (err) {
      console.error("Erreur API:", err);
      const msg = err.response?.data?.message ||
        "Une erreur est survenue lors de l'enregistrement.";
      showToast("error", `Erreur : ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className.includes("modal-overlay") && !loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal modal-lg">
        <form onSubmit={handleSubmit} style={{padding:"10px 20px"}}>
          <div className="modal-header">
            <h2>
              {articleAEditer ? "Modifier l'article" : "Nouvel article"}
            </h2>
            <button type="button" className="modal-close" onClick={onClose} disabled={loading}>
              <FaTimes />
            </button>
          </div>

          <div className="modal-body">
            <div className="form-layout-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              
              <div className="form-group" style={{ gridColumn: '1 / 3' }}>
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
                  placeholder="Ex: Les bienfaits du miel bio"
                  required
                />
                {errors.titre && <div className="error-message">{errors.titre}</div>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                <label htmlFor="description" className="required">Description courte (résumé)</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`form-control textarea ${errors.description ? "error" : ""}`}
                  rows="3"
                  maxLength="255"
                  placeholder="Résumé affiché dans la liste des articles..."
                  required
                />
                <small style={{ float: "right", color: "var(--color-text-light)" }}>
                  {form.description.length}/255
                </small>
                {errors.description && <div className="error-message">{errors.description}</div>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / 3' }}>
                <label htmlFor="contenu" className="required">Contenu complet</label>
              
<TiptapEditor
  content={form.contenu}
  onUpdate={(html) => setForm({ ...form, contenu: html })}
/>
{errors.contenu && <div className="error-message">{errors.contenu}</div>}
                {errors.contenu && <div className="error-message">{errors.contenu}</div>}
              </div>

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
                  placeholder="Jean Dupont"
                  required
                />
                {errors.auteur && <div className="error-message">{errors.auteur}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="datePublication" className="required">
                  <FaCalendarAlt /> Date de publication
                </label>
                <input
                  type="date"
                  id="datePublication"
                  name="datePublication"
                  value={form.datePublication}
                  onChange={handleChange}
                  min={today}
                  placeholder="jj/mm/aaaa"
                  className={`form-control ${errors.datePublication ? "error" : ""}`}
                  required
                />
                {errors.datePublication && <div className="error-message">{errors.datePublication}</div>}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / 3' }}>
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
                    required={!articleAEditer}
                  />
                  <div className="file-input-label">
                   
                    <div>
                      <small>JPG, PNG, GIF, WebP • max 5 Mo</small>
                    </div>
                   
                  </div>
                </div>
                {errors.image && <div className="error-message">{errors.image}</div>}
                
                {(imagePreview || (articleAEditer && articleAEditer.image)) && (
                  <div className="file-info">
                    {imagePreview ? (
                      <div className="file-preview" style={{ margin: '0 auto' }}>
                        <img
                          src={imagePreview}
                          alt="Aperçu"
                          style={{ width: "100%", display: "block" }}
                        />
                      </div>
                    ) : (
                      <p>Image actuelle conservée : <strong>{articleAEditer.image.split('/').pop()}</strong></p>
                    )}
                    
                    {form.image && (
                      <p style={{ marginTop: "8px", color: "var(--color-text)" }}>
                        Nouveau fichier : <strong>{form.image.name}</strong>
                      </p>
                    )}
                    {!form.image && articleAEditer && articleAEditer.image && (
                      <p style={{ marginTop: "8px", color: "var(--color-primary)" }}>
                        Aucun nouveau fichier sélectionné.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="actions-container">
            <button 
              type="button" 
              className="edit" 
              onClick={onClose} 
              disabled={loading}
            >
              Annuler
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spin" /> Enregistrement...
                </>
              ) : articleAEditer ? (
                <>
                  <FaSave style={{marginRight:"10px"}} /> Mettre à jour
                </>
              ) : (
                <>
                  <FaPaperPlane style={{marginRight:"10px"}} /> Publier
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