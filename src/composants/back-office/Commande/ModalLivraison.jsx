import React, { useState, useEffect } from "react";
import { FaTruck, FaMapMarkerAlt, FaUser, FaTag, FaBox, FaTimes } from "react-icons/fa";

// Supposons que ce composant reçoit les props suivantes
const ModalLivraison = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        if (isOpen) {
            setData(initialData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validation simple
        if (!data.referenceColis || !data.lieuLivraison || !data.transporteur) {
            alert("Veuillez remplir tous les champs obligatoires (Colis, Lieu, Transporteur).");
            return;
        }
        onSubmit(data);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "600px" }}> {/* Augmentation de la largeur pour 2 colonnes */}
                <div className="modal-header">
                    <h2><FaTruck style={{ marginRight: "10px" }} /> Expédier la commande #{data.numCommande}</h2>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body"> {/* Conteneur du formulaire */}
                        
                        <div className="form-row">
                            {/* Colonne 1: Référence Colis */}
                            <div className="form-group">
                                <label><FaTag /> Référence Colis</label>
                                <input
                                    type="text"
                                    name="referenceColis"
                                    value={data.referenceColis}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            {/* Colonne 2: Transporteur */}
                            <div className="form-group">
                                <label><FaUser /> Transporteur</label>
                                <input
                                    type="text"
                                    name="transporteur"
                                    value={data.transporteur}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            {/* Colonne 1: Lieu de Livraison */}
                            <div className="form-group">
                                <label><FaMapMarkerAlt /> Lieu de Livraison</label>
                                <input
                                    type="text"
                                    name="lieuLivraison"
                                    value={data.lieuLivraison}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            {/* Colonne 2: Contact Transporteur */}
                            <div className="form-group">
                                <label><FaBox /> Contact Transporteur</label>
                                <input
                                    type="text"
                                    name="contactTransporteur"
                                    value={data.contactTransporteur}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>
                        </div>

                    </div>
                    
                    {/* Les actions sont en dehors du modal-body mais utilisent le style .modal-actions */}
                    <div className="modal-actions"> 
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary">
                            <FaTruck style={{marginRight:"5px"}} /> Confirmer Expédition
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalLivraison;