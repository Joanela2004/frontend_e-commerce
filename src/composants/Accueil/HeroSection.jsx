import React from "react";
import "../../styles/front-office/Accueil/HeroSection.css";
import  "../../styles/front-office/global.css";
import viandeImage from '../../assets/images/market-Photoroom.png'
export default function HeroSection(){
    return (
        <section className="hero">
            <div className="hero-text">
                <h1>Arato Agri, votre partenaire en <span className="green">produits agricole</span> et <span className="green">viande</span>saine</h1>
                <button className="btn">Voir détails</button>
            </div>
           <div className="hero-image">
            <img src={viandeImage} alt="paniers" className="image"/>
           </div>
        </section>
    )
}