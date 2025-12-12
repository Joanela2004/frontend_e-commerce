import React, { useState } from "react";
import Header from "../../composants/Header";
import Footer from "../../composants/FooterSection";
import SeConnecter from "../../composants/front-office/Profil/SeConnecter";

import "../../styles/front-office/global.css";
import "../../styles/front-office/Profil/profil.css";

const Profil = () => {
  return (
    <>
      <Header />

      <div className="profil-guest">
        <div className="forms-grid">
          <div className="form-card">
            <SeConnecter />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profil;
