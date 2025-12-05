import React, { useEffect, useRef, useState } from 'react'
import panierViande from "../../../assets/images/panier2.png";
import panierLegume from "../../../assets/images/panier1.png";
import cercle from "../../../assets/images/cercle.png";
import "../../../styles/front-office/Accueil/AboutSection.css"
const AboutSection = () => {

  return (
    <section  className='about-section'>
      <div className='about-images'>
       
        
          <img src={cercle} alt='cercle' className='cercle'/>
          <div className='panier'>
          <img src={panierViande} alt='panierViande' className='panierViande'/>
          <img src={panierLegume} alt='panierLegume' className='panierLegume'/>
          </div>
       
      </div>
      
      <div className='about-text'>
        <h3>A propos</h3>
      <p>Chez Arato Agri, nous  vendons   des légumes, de la viande  : nous livrons le goût de la vraie campagne malgache directement à votre table.
Chaque jour, nous travaillons main dans la main avec des agriculteurs et éleveurs passionnés des Hauts-Plateaux, de Fianarantsoa, et bien d’autres régions. Ils cultivent et élèvent avec soin, sans excès de produits chimiques, pour vous offrir des produits sains, savoureux et 100 % locaux.
</p>
      </div>
    </section>
  )
}

export default AboutSection
