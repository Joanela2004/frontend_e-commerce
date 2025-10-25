import React from 'react'
import "../../styles/front-office/Accueil/NewsLetter.css";
import  "../../styles/front-office/global.css";
const NewsLetterSection = () => {
  return (
    <section className='newsLetter'>
      <div className='newsLetter-content'>
        <h2>Joignez-nous pour obtenir une promotion 
au prochain commande</h2>
      
      <form className='newsLetter-form'>
        <input type='email' placeholder='Entrez votre adresse e-mail' required/>
        <button type='submit'>Envoyer</button>
      </form>
      </div>
    </section>
  )
}

export default NewsLetterSection
