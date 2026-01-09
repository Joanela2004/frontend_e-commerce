import Header from "../../composants/Header";
import FooterSection from "../../composants/FooterSection";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
