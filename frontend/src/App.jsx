
import { useState } from "react";
import { Toaster } from "sileo";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/header.css";
import "./styles/tables.css";
import "./styles/buttons.css";
import "./styles/forms.css";

import Productores from "./pages/Productores";
import Cafetales from "./pages/Cafetales";
import DashboardLayout from "./layout/DashboardLayout";
import Recepciones from "./pages/Recepciones";
import Procesos from "./pages/Procesos";
import Inventario from "./pages/Inventario";
import Login from "./pages/Login";

function App() {
  const [vista, setVista] = useState("productores");
  const [usuario, setUsuario] = useState(null);

  const handleLogin = (datos) => {
    setUsuario(datos);
    setVista("productores");
  };

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <DashboardLayout
        vista={vista}
        setVista={setVista}
        usuario={usuario}
        onLogout={() => setUsuario(null)}
      >
        {vista === "productores" && <Productores />}
        {vista === "cafetales" && <Cafetales />}
        {vista === "recepciones" && <Recepciones />}
        {vista === "procesos" && <Procesos />}
        {vista === "inventario" && <Inventario />}
      </DashboardLayout>

      {/* Notificaciones interactivas fuera del layout: flotan sobre los modales.
          Sileo las renderiza en un portal propio; no ocupan espacio en el layout. */}
      <Toaster position="bottom-center" theme="light" />
    </>
  );
}

export default App;
