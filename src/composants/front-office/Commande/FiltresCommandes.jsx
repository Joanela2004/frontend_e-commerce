import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
const FiltresCommandes = ({ filtreStatut, setFiltreStatut, filtreDate, setFiltreDate, statutsDisponibles }) => {
  return (
    <div className="filtres-commandes-conteneur" style={{marginTop:"80px"}}>
      <div className="filtre-item">
        <p>Rechercher par date</p>
      <DatePicker
  selected={filtreDate ? new Date(filtreDate) : null}
  onChange={(date) => setFiltreDate(date ? date.toISOString().slice(0, 10) : "")}
  dateFormat="dd/MM/yyyy"
  locale={fr}
  placeholderText="jj/mm/aaaa"
  className="form-control"
  isClearable
  showYearDropdown
  scrollableYearDropdown
  yearDropdownItemNumber={15}
/>
      </div>

      <div className="filtre-item">
        <p>Filtrer par statut</p>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="select-statut"
        >
          {statutsDisponibles.map((statut) => (
            <option key={statut} value={statut}>
              {statut === "Tous" ? "Tous les statuts" : statut}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FiltresCommandes;