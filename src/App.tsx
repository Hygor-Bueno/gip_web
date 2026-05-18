import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './Components/Login';
import { MyProvider } from './Context/MainContext';
import RenderPage from './Components/RenderPage';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './Components/Home';
import PrivateRoute from './PrivateRoute';
import Gtpp from './Modules/GTPP/Gtpp';
import GtppLayout from './Modules/GTPP/GtppLayout';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';
import { ConnectionProvider } from './Context/ConnContext';
import Cfpp from './Modules/CFPP/Cfpp';
import Infraction from './Modules/GAPP/Infraction/Infraction';
import Stores from './Modules/GAPP/Business/Stores';
import ExpensesRegister from './Modules/GAPP/ExpensesRegister/ExpensesRegister';
import ProfileGIPP from './Modules/ProfileGIPP/ProfileGIPP';
import Gepp from './Modules/GEPP/Gepp';
import CreateTheme from './Modules/GTPP/CreateTheme/CreateTheme';
import Active from './Modules/GAPP/Active/Active';
import GappSettings from './Modules/GAPP/Settings/Settings';
import GappMovement from './Modules/GAPP/Movement/Movement';
import EppMain from './Modules/EPP_V2/Epp';

function App() {
  return (
    <ConnectionProvider>
      <HashRouter>
        {/* MyProvider lifted para fora do <Routes> — fica montado uma
            vez e sobrevive à navegação entre rotas. Isso elimina os
            refetches duplicados de Token.php e LoginGipp.php que
            aconteciam a cada mudança de rota antes. */}
        <MyProvider>
          <Routes>
            {/* Rota pública: Login. RenderPage continua envolvendo
                para o header funcionar. */}
            <Route path="/" element={<RenderPage><Login /></RenderPage>} />

            {/* Layout privado: monta NotificationHub + WebSocket +
                RenderPage + RenderedModules uma única vez. As rotas
                filhas renderizam dentro do <Outlet /> do PrivateRoute. */}
            <Route element={<PrivateRoute />}>
              <Route path="/GIPP" element={<Home />} />
              <Route path="/GIPP/EPP" element={<EppMain />} />
              <Route path="/GIPP/CFPP" element={<Cfpp />} />
              <Route path="/GIPP/configuration/profile" element={<ProfileGIPP />} />

              {/* GAPP */}
              <Route path="/GIPP/GAPP" element={<Navigate to="/GIPP/GAPP/Active" replace />} />
              <Route path="/GIPP/GAPP/Stores" element={<Stores />} />
              <Route path="/GIPP/GAPP/Infraction" element={<Infraction />} />
              <Route path="/GIPP/GAPP/Active" element={<Active />} />
              <Route path="/GIPP/GAPP/Settings" element={<GappSettings />} />
              <Route path="/GIPP/GAPP/Movement" element={<GappMovement />} />
              <Route path="/GIPP/GAPP/ExpensesRegister" element={<ExpensesRegister />} />

              {/* GEPP */}
              <Route path="/GIPP/GEPP" element={<Gepp />} />

              {/* GTPP: layout próprio para o GtppWsProvider sobreviver
                  à navegação entre Tarefas e Temas. */}
              <Route element={<GtppLayout />}>
                <Route path="/GIPP/GTPP" element={<Gtpp />} />
                <Route path="/GIPP/GTPP/create/theme" element={<CreateTheme />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MyProvider>
      </HashRouter>
    </ConnectionProvider>
  );
}

export default App;
