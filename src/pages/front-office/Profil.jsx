import React from "react";

import Header from "../../composants/Header";
import Footer from "../../composants/FooterSection";
import SeConnecter from "../../composants/front-office/Profil/SeConnecter";
import Authentifier from "../../composants/front-office/Profil/Authentifier";
import "../../styles/front-office/global.css";
import "../../styles/front-office/Profil/profil.css";

const Profil = () => {
  return (
    <div>
      <Header />


      <div className="profil-container">
        <div className="profil-box">
          <Authentifier />
        </div>

        <div className="profil-box">
          <SeConnecter />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profil;
