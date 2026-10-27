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


function App() {

  const [vista, setVista] = useState("productores");

  return (

    <>

      <DashboardLayout vista={vista} setVista={setVista}>

        {vista === "productores" && <Productores />}

        {vista === "cafetales" && <Cafetales />}

        {vista === "recepciones" && <Recepciones />}

        {vista === "procesos" && <Procesos />}

      </DashboardLayout>

      {/* Notificaciones interactivas fuera del layout: flotan sobre los modales.
          Sileo las renderiza en un portal propio; no ocupan espacio en el layout. */}
      <Toaster position="bottom-center" theme="light" />

    </>

  );

}

export default App;