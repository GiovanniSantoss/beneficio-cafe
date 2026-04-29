import { useState } from "react";

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


function App() {

  const [vista, setVista] = useState("productores");

  return (

    <DashboardLayout vista={vista} setVista={setVista}>

      {vista === "productores" && <Productores />}

      {vista === "cafetales" && <Cafetales />}

      {vista === "recepciones" && <Recepciones />}

    </DashboardLayout>

  );

}

export default App;