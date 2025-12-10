// src/components/front-office/FooterSection.jsx
import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/front-office/global.css";
import Map from "../assets/icones/MapPin.png";
import Phone from "../assets/icones/Phone.png";
import Mail from "../assets/icones/mess.png";
import FB from "../assets/icones/FacebookLogo.png";
import LK from "../assets/icones/LinkedinLogo.png";
import TW from "../assets/icones/TwitterLogo.png";
import logo from "../assets/icones/log.png";

const FooterSection = () => {
  const [formData, setFormData] = useState({
    email: "",
    sujet: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple
    if (!formData.email || !formData.sujet || !formData.message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        "service_5xdfi2l",           // ← Ton Service ID Gmail
        "template_vwsahph",          // ← Ton Template ID
        {
          from_email: formData.email,
          subject: formData.sujet,
          message: formData.message,
          reply_to: formData.email,
        },
        "5c4mJNrUfARVxparT"           // ← Ta Public Key
      );

      toast.success("Message envoyé avec succès ! Nous vous répondrons bientôt.");
      setFormData({ email: "", sujet: "", message: "" });
    } catch (error) {
      console.error("Erreur EmailJS :", error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer position="bottom-right" autoClose={3000} 
        hideProgressBar={false} 
        closeOnClick={true} />

      <footer id="footer">
        <div className="footer-top">

          <div className="footer-contact">
            <h3>Contactez-nous</h3>
            <div className="footer-info">
              <p>
                <img src={Map} alt="map" /> Tambohobe arrêt bus 21
              </p>
              <p>
                <img src={Phone} alt="phone" /> 034 98 816 19 - 032 87 709 95
              </p>
              <p>
                <img src={Mail} alt="mail" /> contact@arato.mg
              </p>
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

          {/* Partie droite - Formulaire */}
          <div className="footer-form">
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <input
                type="text"
                name="sujet"
                placeholder="Objet"
                value={formData.sujet}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <textarea
                name="message"
                placeholder="Votre message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button type="submit" className="btn" disabled={loading}>
                Envoyer
              </button>
            </form>
          </div>
        </div>

        {/* Partie basse du footer */}
        <div className="footer-bottom">
          <div className="footer-bottom-top">
            <div className="footer-column">
              <h4>Navigation</h4>
              <ul>
                <li><a href="/accueil">Accueil</a></li>
                <li><a href="/produits">Produits</a></li>
                <li><a href="/actualites">Actualités</a></li>
                <li><a href="/contact">Contact</a></li>
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
                <li>Conditions de vente</li>
              </ul>
            </div>

            <div className="footer-contact-social">
              <div className="footer-column">
                <h4>Nous contacter</h4>
                <ul><li>contact@arato.mg</li></ul>
              </div>
              <div className="footer-column">
                <h4>Réseaux sociaux</h4>
                <ul>
                  <li><a href="https://www.linkedin.com/company/arato-officiel">LinkedIn</a></li>
                  <li><a href="https://www.facebook.com/aratoofficiel">Facebook</a></li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="footer-bottom-middle" />

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
    </div>
  );
};

export default FooterSection;