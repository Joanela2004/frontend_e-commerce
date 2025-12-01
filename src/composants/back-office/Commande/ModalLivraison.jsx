import React, { useEffect, useState } from "react";
import { updateLivraison } from "../../../services/livraisonService";
import { updateCommandeAdmin } from "../../../services/commandeService";
// L'import de livraison.css est supprimé et les styles sont dans commandes.css
import "../../../styles/back-office/commandes.css"; 

const ModalLivraison = ({ isOpen, onClose, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        numCommande: initialData.numCommande || '',
        referenceColis: initialData.referenceColis || '',
        lieuLivraison: initialData.lieuLivraison || '',
        transporteur: initialData.transporteur || '',
        contactTransporteur: initialData.contactTransporteur || '',
         statutLivraison: "en cours",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Livraison N°{formData.numCommande}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Référence Colis</label>
            <input type="text" value={formData.referenceColis} disabled />
          </div>
          <div className="form-group">
            <label>Lieu de livraison</label>
            <input type="text" value={formData.lieuLivraison} disabled />
          </div>
          <div className="form-group">
            <label>Transporteur</label>
            <input type="text" name="transporteur" value={formData.transporteur} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Contact Transporteur</label>
            <input type="text" name="contactTransporteur" value={formData.contactTransporteur} onChange={handleChange} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">Enregistrer</button>
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ModalLivraison;