import React, { useState } from "react";
import logo from "../assets/icones/log.png";
import panier from "../assets/icones/panier.png";
import profil from "../assets/icones/profil1.png";
import "../styles/front-office/global.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="main-header">
     
      <img src={logo} alt="Logo" className="header-logo" />

      
      
      <div className="header-nav">
      <nav className={`header-nav-toggle ${menuOpen ? "active" : ""}`}>
        <ul>
          <li><a href="#accueil">Accueil</a></li>
          <li><a href="#produits">Produits</a></li>
          <li><a href="#actus">Actualités</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      
      <div className="header-icons">
        <a href="#panier">
        <img src={panier} alt="Panier" />
        </a>
         <a href="#profil">
        <img src={profil} alt="Profil" />
        </a>
      </div>
     
      <div className="bouton-toggle" onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
       </div>
    </header>
  );
};

export default Header;
