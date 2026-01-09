import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../composants/Header";
import HeroSection from "../../composants/front-office/Accueil/HeroSection";
import ProduitsSection from "../../composants/front-office/Accueil/ProduitsSection";
import PointsFortSection from "../../composants/front-office/Accueil/PointsFortSection";
import AProposSection from "../../composants/front-office/Accueil/AboutSection";
import FooterSection from "../../composants/FooterSection";

export default function Accueil() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("email_verification");

    if (status === "success") {
      toast.success("Votre email a été vérifié avec succès ! 🎉", {
        position: "center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      window.history.replaceState({}, document.title, "/"); // nettoie l'URL
    } else if (status === "failed") {
      toast.error("Échec de la vérification de l'email 😞", {
        position: "center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      window.history.replaceState({}, document.title, "/"); // nettoie l'URL
    }
  }, [location]);

  return (
    <div>
      <Header />
      <HeroSection />
      <ProduitsSection />
      <PointsFortSection />
      <AProposSection />
      <FooterSection />

           <ToastContainer />
    </div>
  );
}
