import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../../composants/back-office/SideBar";
import Header from "../../composants/back-office/Header";

const TableauLayout = () => {
  return (
    <div className="dashboard-layout">
      <SideBar />
        
        <div className="dashboard-content">
          <Header />
          <Outlet />
        
      </div>
    </div>
  );
};

export default TableauLayout;