import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaBox, 
  FaNewspaper, 
  FaShoppingBag, 
  FaCreditCard, 
  FaTag, 
  FaUsers,
  FaTruck,
  FaHome
} from 'react-icons/fa';
import logo from '../../assets/icones/log.png';
import "../../styles/back-office/SideBar.css";

const SideBar = () => {
  const menuItems = [

    { label: "Tableau de bord", path: "/admin", icon: FaTachometerAlt },
    { label: "Produits", path: "/admin/produits", icon: FaBox },
    { label: "Articles", path: "/admin/articles", icon: FaNewspaper },
    { label: "Commandes", path: "/admin/commandes", icon: FaShoppingBag },
    { label: "Paiements", path: "/admin/paiements", icon: FaCreditCard },
    { label: "Promotions", path: "/admin/promotion", icon: FaTag },
    { label: "Clients", path: "/admin/clients", icon: FaUsers },
    { label: "Livraisons", path: "/admin/livraisons", icon: FaTruck },
  ];

  return (
    <div className="sidebar">
 
       <div className="sidebar-top">
        <h2 className="sidebar-title"> 
          <img src={logo}  style={{width: '40px',height:"auto",objectFit:"contain"}} />
        </h2>
        
      </div>
      
      {/* Menu principal */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon; 
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                isActive ? "sidebar-item active" : "sidebar-item"
              }
            >
              {IconComponent && <IconComponent className="sidebar-icon" />}
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default SideBar;