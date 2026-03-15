import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ children, setVista, vista }) {

  return (

    <div className="dashboard">

      {/* Sidebar */}
      <Sidebar setVista={setVista} vista={vista} />

      {/* Área principal */}
      <div className="main">

        {/* Header superior */}
        <Header />

        {/* Contenido dinámico de las páginas */}
        <main className="content">
          {children}
        </main>

      </div>

    </div>

  );

}