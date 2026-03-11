import "./styles/base.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/header.css";
import "./styles/tables.css";
import "./styles/buttons.css";
import "./styles/forms.css";

import Productores from "./pages/Productores";
import DashboardLayout from "./layout/DashboardLayout";


function App() {
  return (
    <DashboardLayout>
      <Productores />
    </DashboardLayout>
  );
}

export default App;