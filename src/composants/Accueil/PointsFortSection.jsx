import React from 'react'

import deliver from "../../assets/images/deliver.png";
import carte from "../../assets/images/carte.png";
import  qualite from "../../assets/images/qualite.png";
import "../../styles/front-office/global.css";
import "../../styles/front-office/Accueil/PointsFortSection.css";

const pointsFort = [
   { id: 3, nom: "deliver", desciption: "Nous livrons dans tout Madagascar avec une chaîne du froid préservée ", image: deliver },
  
  { id: 1, nom: "qualite", desciption: "Nous livrons dans tout Madagascar avec une chaîne du froid préservée", image: qualite},
  { id: 2, nom: "Paiement", desciption: "Mobile Money, Carte bancaire, Virement ou Paiement à la livraison", image: carte },
 
];
const PointsFortSection = () => {
 return (
     <section className="pointsFort-section">
       <div className="pointsFort-header">
       <h3>Nos pointsForts</h3>
       <p>
        Qualité irréprochable. Délais respectés. Support dédié. 
Trois piliers qui font de nous le partenaire idéal
       </p>
       </div>
       <div className="pointsFort-grid">
         {pointsFort.map((point) => (
         
           <div key={point.id} className="pointsFort-card">
             
             <div className="pointsFort-image-container">
             <img src={point.image} alt={point.nom} />
             </div>
             <div className="pointsFort-text">
             <h2>{point.nom}</h2>
             
             <p>{point.desciption}</p>
            
              </div>
           </div>
         ))}
       </div>
     </section>
   );
 };

export default PointsFortSection
