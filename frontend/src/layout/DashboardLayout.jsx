import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ children }) {

  return (

    <div className="dashboard">

      {/* Sidebar */}
      <Sidebar />

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