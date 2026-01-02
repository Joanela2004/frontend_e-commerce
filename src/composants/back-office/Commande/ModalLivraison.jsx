import React, { useState, useEffect } from "react";
import { FaTruck, FaMapMarkerAlt, FaUser, FaTag, FaBox, FaTimes } from "react-icons/fa";

const ModalLivraison = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [data, setData] = useState({});

  // Initialisation des données quand initialData change
  useEffect(() => {
    if (initialData) {
      setData({
        numCommande: initialData.numCommande || "",
        referenceColis: initialData.referenceColis || "",
        lieuLivraison: initialData.lieuLivraison || "",
        transporteur: initialData.transporteur || "",
        contactTransporteur: initialData.contactTransporteur || "",
        statutLivraison: "en cours",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  // Gestion générale des changements pour les autres champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion spécifique du contact : uniquement chiffres, max 10
  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // garde uniquement les chiffres
    if (value.length <= 10) {
      setData((prev) => ({ ...prev, contactTransporteur: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
    // Optionnel : reset du formulaire après soumission si vous le souhaitez
    // setData({});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h2>Expédier</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            <div className="form-row">
              {/* Référence Colis */}
              <div className="form-group">
                <label>
                  <FaTag /> Référence Colis
                </label>
                <input
                  type="text"
                  name="referenceColis"
                  value={data.referenceColis || ""}
                  disabled
                  className="form-control"
                />
              </div>

              {/* Transporteur */}
              <div className="form-group">
                <label>
                  <FaUser /> Transporteur
                </label>
                <input
                  type="text"
                  name="transporteur"
                  value={data.transporteur || ""}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              {/* Lieu de Livraison */}
              <div className="form-group">
                <label>
                  <FaMapMarkerAlt /> Lieu de Livraison
                </label>
                <input
                  type="text"
                  name="lieuLivraison"
                  value={data.lieuLivraison || ""}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>

              {/* Contact Transporteur */}
              <div className="form-group">
                <label>
                  <FaBox /> Contact Transporteur
                </label>
                <input
                  type="tel"
                  name="contactTransporteur"
                  value={data.contactTransporteur || ""}
                  onChange={handleContactChange}
                  maxLength={10}
                  className="form-control"
                />
              
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <FaTruck style={{ marginRight: "5px" }} /> Confirmer Expédition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalLivraison;