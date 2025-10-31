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
    <div>
      <footer id="footer">
        <div className="footer-top">
          {/* partie gauche */}
          <div className="footer-contact">
            <h3>Contactez-nous</h3>
            <div className="footer-info">
              <p>
                <img src={Map} alt="map-icon" /> Tambohobe arrêt bus 21
              </p>
              <p>
                <img src={Phone} alt="phone-icon" /> 0349881619 - 0328770995
              </p>
              <p>
                <img src={Mail} alt="mail-icon" /> contact@arato.mg
              </p>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/aratoofficiel">
                <img src={FB} alt="facebook-icon" />
              </a>

              <a href="https://www.linkedin.com/authwall?trk=gf&trkInfo=AQFTT9PWWMl79AAAAZoL0P0I2x8Cg-YR3ALSStdGZH5dtFGvoO3oU6zwjjPEYUIY7JRCB2Dh0klOCBmtpTBZIy9r7BSXwdYQON3NN9ldVwGpHNsSG_CTGoluKtK5aqIvlL3Rjjs=&original_referer=https://arato.mg/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Farato-officiel-233a481b5">
                <img src={LK} alt="linkedIn-icon" />
              </a>
              <a href="https://x.com/AratoOfficiel">
                <img src={TW} alt="Twitter-icon" />
              </a>
            </div>
          </div>

          {/* Partie droite :formulaire */}
          <div className="footer-form">
            <form>
              <input type="email" placeholder="Adresse e-mail" required />
              <input type="text" placeholder="Objet" required />
              <textarea placeholder="Message" rows="4" required />
              <button className="btn">Envoyer</button>
            </form>
          </div>
        </div>

        {/* partie en bas */}
        <div className="footer-bottom">
          <div className="footer-bottom-top">
          <div className="footer-column">
            <h4>Navigation</h4>
            <ul>
              <li>
                <a href="/accueil">Accueil</a>
              </li>
              <li>
                <a href="/produits">Produits</a>
              </li>
              <li>
                <a href="/actualites">Actualités</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

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

          <div className="footer-column">
            <h4>Informations légales</h4>
            <ul>
              <li>Politique de confidentialité</li>
              <li>Condition de vente</li>
            </ul>
          </div>
          
          <div className="footer-contact-social">
            <div className="footer-column">
              <h4>Nous contactez</h4>
              <ul>
                <li>contact@arato.mg</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Réseaux sociaux</h4>
              <ul>
                <li>
                  <a href="https://www.linkedin.com/authwall?trk=gf&trkInfo=AQFTT9PWWMl79AAAAZoL0P0I2x8Cg-YR3ALSStdGZH5dtFGvoO3oU6zwjjPEYUIY7JRCB2Dh0klOCBmtpTBZIy9r7BSXwdYQON3NN9ldVwGpHNsSG_CTGoluKtK5aqIvlL3Rjjs=&original_referer=https://arato.mg/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Farato-officiel-233a481b5">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/aratoofficiel">Facebook</a>
                </li>
              </ul>
            </div>
          </div>
          </div>
          {/* Ligne de separation */}
          <hr className="footer-bottom-middle"/>
       
        {/* Copyright */}
        <div className="footer-bottom-bottom">
         
        <div className="footer-logo">
                  <img src={logo} alt="AratoLogo" />
        </div>
        
        <div className="footer-copy">
           <p> @2025 Arato Agri. Tous droits réservés.</p>
        </div>
       
         <div className="footer-social">
              <a href="https://www.facebook.com/aratoofficiel">
                <img src={FB} alt="facebook-icon" />
              </a>

              <a href="https://www.linkedin.com/authwall?trk=gf&trkInfo=AQFTT9PWWMl79AAAAZoL0P0I2x8Cg-YR3ALSStdGZH5dtFGvoO3oU6zwjjPEYUIY7JRCB2Dh0klOCBmtpTBZIy9r7BSXwdYQON3NN9ldVwGpHNsSG_CTGoluKtK5aqIvlL3Rjjs=&original_referer=https://arato.mg/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Farato-officiel-233a481b5">
                <img src={LK} alt="linkedIn-icon" />
              </a>
              <a href="https://x.com/AratoOfficiel">
                <img src={TW} alt="Twitter-icon" />
              </a>
            
             </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterSection;
