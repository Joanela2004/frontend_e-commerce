import React, { useState, useEffect } from "react";
import "../../../styles/front-office/modal.css"; 

const ModalLivraison = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(initialData);
   
    useEffect(() => {
        
        setFormData(initialData);
    }, [initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Infos de Livraison pour Commande N°{initialData.numCommande}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Transporteur</label>
                        <input
                            type="text"
                            name="transporteur"
                            value={formData.transporteur || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Référence Colis</label>
                        <input
                            type="text"
                            name="referenceColis"
                            value={formData.referenceColis || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                   
                    <div className="form-group">
                        <label>Contact Transporteur</label>
                        <input
                            type="text"
                            name="contactTransporteur"
                            value={formData.contactTransporteur || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Envoyer</button>
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalLivraison;