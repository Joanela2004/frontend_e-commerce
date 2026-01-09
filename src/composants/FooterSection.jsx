// src/components/front-office/FooterSection.jsx
import React from "react";
import "../styles/front-office/global.css";
import Map from "../assets/icones/MapPin.png";
import Phone from "../assets/icones/Phone.png";
import Mail from "../assets/icones/mess.png";
import FB from "../assets/icones/FacebookLogo.png";
import LK from "../assets/icones/LinkedinLogo.png";
import TW from "../assets/icones/TwitterLogo.png";
import logo from "../assets/icones/log.png";

const FooterSection = () => {
  return (
    <footer id="footer" >
      {/* Partie basse du footer */}
      <div style = {{padding:"10px 80px"}}className="footer-bottom">
        <div className="footer-bottom-top">
          {/* Colonne Navigation */}
          <div className="footer-column">
            <h4>Navigation</h4>
            <ul>
              <li><a href="/accueil">Accueil</a></li>
              <li><a href="/produit">Produits</a></li>
              <li><a href="/actualite">Actualités</a></li>
            </ul>
          </div>

          {/* Colonne Ce qu'on fait */}
          <div className="footer-column">
            <h4>Ce qu'on fait</h4>
            <ul>
              <li>Vendre des produits agricoles</li>
              <li>Espace Coworking</li>
              <li>Développement de solutions numériques</li>
              <li>Formations sur des solutions numériques</li>
              <li>Intégration de solutions intelligentes</li>
              <li>Communication digitale & Community Management</li>
              <li>Gaming & eSport</li>
            </ul>
          </div>

          {/* Colonne Informations légales */}
          <div className="footer-column">
            <h4>Informations légales</h4>
            <ul>
              <li>Politique de confidentialité</li>
              <li>Conditions de vente</li>
            </ul>
          </div>

          {/* Colonne Contact + Réseaux sociaux */}
          <div className="footer-contact-social">
            <div className="footer-column">
              <h4>Nous contacter</h4>
              <ul>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={Map} alt="Adresse" style={{ width: "20px", height: "auto" }} />
                  Tambohobe arrêt bus 21
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={Phone} alt="Téléphone" style={{ width: "20px", height: "auto" }} />
                  034 98 816 19 - 032 87 709 95
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={Mail} alt="Email" style={{ width: "20px", height: "auto" }} />
                  contact@arato.mg
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Réseaux sociaux</h4>
              <ul>
                <li>
                  <a href="https://www.linkedin.com/company/arato-officiel" target="_blank" rel="noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/aratoofficiel" target="_blank" rel="noreferrer">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <hr className="footer-bottom-middle" />

        {/* Bas du footer : logo, copyright, réseaux sociaux */}
        <div className="footer-bottom-bottom">
          <div className="footer-logo">
            <img src={logo} alt="Arato Agri" />
          </div>

          <div className="footer-copy">
            <p>© 2025 Arato Agri. Tous droits réservés.</p>
          </div>

          <div className="footer-social">
            <a href="https://www.facebook.com/aratoofficiel" target="_blank" rel="noreferrer">
              <img src={FB} alt="Facebook" />
            </a>
            <a href="https://www.linkedin.com/company/arato-officiel" target="_blank" rel="noreferrer">
              <img src={LK} alt="LinkedIn" />
            </a>
            <a href="https://x.com/AratoOfficiel" target="_blank" rel="noreferrer">
              <img src={TW} alt="Twitter" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;