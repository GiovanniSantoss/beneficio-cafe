
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({
  children,
  setVista,
  vista,
  usuario,
  onLogout
}) {

  return (
    <div className="dashboard">

      <Sidebar
        setVista={setVista}
        vista={vista}
        usuario={usuario}
      />

      <div className="main">

        <Header usuario={usuario} onLogout={onLogout} />

        <main className="content">
          {children}
        </main>

      </div>

    </div>
  );
}

