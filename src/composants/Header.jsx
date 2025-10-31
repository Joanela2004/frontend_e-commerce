import React, { useState } from "react";
import logo from "../assets/icones/log.png";
import panier from "../assets/icones/panier.png";
import profil from "../assets/icones/profil1.png";
import "../styles/front-office/global.css";

import {NavLink, Link } from "react-router-dom";
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="main-header">
     
      <img src={logo} alt="Logo" className="header-logo" />

      
      
      <div className="header-nav">
      <nav className={`header-nav-toggle ${menuOpen ? "active" : ""}`}>
  <ul>
    <li>
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        Accueil
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/produit"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        Produits
      </NavLink>
    </li>
    <li>
      <NavLink
        to="/actualite"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
        Actualités
      </NavLink>
    </li>
    
    <li>
      <a 
    href="#footer" 
    onClick={(e) => {
      e.preventDefault(); 
      const footer = document.getElementById("footer");
      footer?.scrollIntoView({ behavior: "smooth" });
    }}
    className="nav-link"
  >
    Contact
  </a>
    </li>
     <li>
      <NavLink
        to="/commandes"
        className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }
      >
       Mes commandes
      </NavLink>
    </li>
  </ul>
</nav>


      
      <div className="header-icons">
        <Link to="/panier">
        <img src={panier} alt="Panier" />
        </Link>
         <Link to="/profil">
        <img src={profil} alt="Profil" />
        </Link>
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
