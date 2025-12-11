import React, { useState, useEffect } from "react";
import { FaTruck, FaMapMarkerAlt, FaUser, FaTag, FaBox, FaTimes } from "react-icons/fa";

const ModalLivraison = ({ isOpen, onClose, onSubmit, initialData }) => {
const [data, setdata] = useState({});

  useEffect(() => {
    if (initialData) {
      setdata({
        numCommande: initialData.numCommande || '',
        referenceColis: initialData.referenceColis ||'',
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
    setdata(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
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
                                <label><FaTag /> Référence Colis</label>
                                <input
                                    type="text"
                                    name="referenceColis"
                                    value={data.referenceColis}
                                    disabled
                                    className="form-control"
                                />
                            </div>

                            {/* Transporteur */}
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

                            {/* Lieu de Livraison */}
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

                            {/* Contact Transporteur */}
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

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>

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
