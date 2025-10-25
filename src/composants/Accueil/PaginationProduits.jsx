import React, { useState } from 'react';
import '../../styles/front-office/Accueil/Pagination.css';

const PaginationProduits = ({ totalProduits, produitsParPage, onPageChange }) => {
  const [pageActuelle, setPageActuelle] = useState(1);
  const totalPages = Math.ceil(totalProduits / produitsParPage);

  const handlePageChange = (nouvellePage) => {
    setPageActuelle(nouvellePage);
    onPageChange(nouvellePage);
  };

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={pageActuelle === 1}
        onClick={() => handlePageChange(pageActuelle - 1)}
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`pagination-btn ${pageActuelle === i + 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={pageActuelle === totalPages}
        onClick={() => handlePageChange(pageActuelle + 1)}
      >
        &gt;
      </button>
    </div>
  );
};

export default PaginationProduits;
