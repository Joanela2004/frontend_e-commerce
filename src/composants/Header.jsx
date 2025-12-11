import React, { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/icones/log.png";
import panier from "../assets/icones/panier.png";
import profil from "../assets/icones/profil1.png";
import "../styles/front-office/global.css";
import "../styles/front-office/Profil/profil.css";
import ModalConnexion from "../composants/front-office/ModalConnexion";
import { logoutUser } from "../services/AuthService";
import { CartContext } from "../contexts/CartContext"; 
import PromoBanner from "./front-office/PromoBanner";
const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("userToken");
const userData = JSON.parse(localStorage.getItem("userData") || "{}");
 const isAuthenticated = !!token;
  const isClient = isAuthenticated && userData.role !== "admin";
  const { totalWeight } = useContext(CartContext);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logoutUser();
   await logoutUser();
localStorage.removeItem("userToken");
localStorage.removeItem("userData");
navigate("/", { replace: true });

    closeMenu();
  };

  const handlePrivateClick = (e, path) => {
    e.preventDefault();
    if (!isAuthenticated) {
      localStorage.setItem("redirectPathAfterLogin", path);
      setShowModal(true);
    } else {
      navigate(path);
    }
    closeMenu();
  };

  const handleLoginRedirect = () => {
    setShowModal(false);
    const redirectPath = localStorage.getItem("redirectPathAfterLogin") || "/profil";
    localStorage.removeItem("redirectPathAfterLogin");
    navigate(redirectPath);
  };
 const getBadgeClass = (weight) => {
    if (weight > 0) return 'cart-badge-small'; 
    return 'hidden';
  };
  
  const badgeClass = getBadgeClass(totalWeight);
  return (
    <>
      <header className="main-header" >
        <Link to="/">
          <img src={logo} alt="Logo" className="header-logo" />
        </Link>

        <div className="header-right">
          <div className="header-nav">
            <nav>
              <ul>
                <li>
                  <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Accueil
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/produit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                    Produits
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/actualite" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
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

                {/* Toujours visible */}
                <li>
                  <a
                    href="/client/mesCommandes"
                    className="nav-link"
                    onClick={(e) => handlePrivateClick(e, "/client/mesCommandes")}
                  >
                    Mes commandes
                  </a>
                </li>

                {isClient && (
                  <li>
                    <button onClick={handleLogout} className="btn">
                      Se déconnecter
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <div className="header-icons">
            <Link to="/panier" className="icon-link panier-icon-wrapper">
              <img src={panier} alt="Panier" />
              {totalWeight > 0 && (
                <span className="cart-notification cart-badge-total">
                  {totalWeight} 
                </span>
              )}
            </Link>
            <Link to="/profil" className="icon-link">
              <img src={profil} alt="Profil" className="icone-profil" />
            </Link>
          </div>

          <div className="bouton-toggle" onClick={toggleMenu}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </header>
<PromoBanner />
      {/* Overlay menu mobile */}
      <div className={`menu-overlay ${menuOpen ? "active" : ""}`} onClick={closeMenu}></div>

      {/* Menu mobile */}
      <nav className={`header-nav-toggle ${menuOpen ? "active" : ""}`}>
        <button className="close-btn" onClick={closeMenu} aria-label="Fermer le menu">
          ×
        </button>
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink to="/produit" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
              Produits
            </NavLink>
          </li>
          <li>
            <NavLink to="/actualite" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
              Actualités
            </NavLink>
          </li>
          <li>
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                const footer = document.getElementById("footer");
                footer?.scrollIntoView({ behavior: "smooth" });
              }}
              className="nav-link"
            >
              Contact
            </a>
          </li>

          {/* Toujours visible */}
          <li>
            <a
              href="/client/mesCommandes"
              className="nav-link"
              onClick={(e) => handlePrivateClick(e, "/client/mesCommandes")}
            >
              Mes commandes
            </a>
          </li>

          {isClient && (
            <li>
              <button onClick={handleLogout} className="btn" style={{fontSize:"1rem", margin:"10px 10px"}}>
                Se déconnecter
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Modal connexion */}
      <ModalConnexion
        show={showModal}
        onClose={() => setShowModal(false)}
        onLoginRedirect={handleLoginRedirect}
      />
    </>
  );
};

export default Header;
