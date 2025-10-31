import React from "react";
import Header from "../../composants/Header";
import HeroSection from "../../composants/Accueil/HeroSection";
import ProduitsSection from "../../composants/Accueil/ProduitsSection";
import PointsFortSection from "../../composants/Accueil/PointsFortSection";
import AProposSection from "../../composants/Accueil/AboutSection";
import ServiceSection from "../../composants/Accueil/ServiceSection";
import NewsLetterSection from "../../composants/Accueil/NewsLetterSection";
import FooterSection from "../../composants/FooterSection";
export default function Accueil(){
    return (
        <div>
        <Header/>
        <HeroSection/>
        <ProduitsSection/>
        <PointsFortSection/>
        <AProposSection/>
        <ServiceSection/>
        <NewsLetterSection/>
        <FooterSection/>
       
        </div>
    )
}