import React, { useEffect, useState } from "react";
import { fetchLivraisons, updateLivraison, deleteLivraison } from "../../../services/livraisonService";
import { FaTruck, FaSearch } from "react-icons/fa";
import "../../../styles/back-office/livraison.css";
import { useNavigate } from "react-router-dom";

const LivraisonModal = ({ isOpen, onClose, livraison, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (livraison) setFormData(livraison);
  }, [livraison]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { ...formData };

    // Si le statut est passé à "livrée", mettre la date de livraison à maintenant
    if (updatedData.statutLivraison === "livrée" && !updatedData.dateLivraison) {
      updatedData.dateLivraison = new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    await updateLivraison(updatedData.numLivraison, updatedData);
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modifier Livraison N°{formData.numCommande}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transporteur</label>
            <input
              type="text"
              name="transporteur"
              value={formData.transporteur || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Référence Colis</label>
            <input
              type="text"
              name="referenceColis"
              value={formData.referenceColis || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Lieu de livraison</label>
            <input
              type="text"
              name="lieuLivraison"
              value={formData.lieuLivraison || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Transporteur</label>
            <input
              type="text"
              name="contactTransporteur"
              value={formData.contactTransporteur || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select name="statutLivraison" value={formData.statutLivraison || ""} onChange={handleChange} required>
              <option value="en cours">en cours</option>
              <option value="livrée">livrée</option>
            </select>
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

const Livraisons = () => {
  const [livraisons, setLivraisons] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLivraison, setCurrentLivraison] = useState(null);
  const navigate = useNavigate();

  const loadData = async () => {
    const data = await fetchLivraisons();
    setLivraisons(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = livraisons.filter((l) =>
    [
      l.numCommande,
      l.transporteur,
      l.referenceColis,
      l.lieuLivraison,
      l.statutLivraison
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="livraison-container">
      <div className="livraison-header">
        <h2><FaTruck /> Gestion des Livraisons</h2>
        <div className="livraison-tabs">
          <button className="tab-active">Livraisons</button>
          <button onClick={() => navigate("/admin/livraisons/frais")}>Frais de livraison</button>
          <button onClick={() => navigate("/admin/livraisons/lieux")}>Lieux de livraison</button>
        </div>
      </div>

      <div className="livraison-search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Rechercher par commande, transporteur, référence ou statut..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="livraison-table">
        <thead>
          <tr>
            <th>Commande</th>
            <th>Transporteur</th>
            <th>Référence Colis</th>
            <th>Lieu de livraison</th>
            <th>Date d'expédition</th>
            <th>Date de livraison</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.numLivraison}>
              <td>{l.numCommande}</td>
              <td>{l.transporteur || "-"}</td>
              <td>{l.referenceColis || "-"}</td>
              <td>{l.lieuLivraison || "-"}</td>
              <td>{l.dateExpedition || "-"}</td>
              <td>{l.dateLivraison || "-"}</td>
              <td>{l.statutLivraison || "-"}</td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => {
                    setCurrentLivraison(l);
                    setIsModalOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    if (window.confirm("Supprimer cette livraison ?")) {
                      deleteLivraison(l.numLivraison).then(loadData);
                    }
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && currentLivraison && (
        <LivraisonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          livraison={currentLivraison}
          onSave={loadData}
        />
      )}
    </div>
  );
};

export default Livraisons;
