import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Login from './Components/Login';
import { MyProvider } from './Context/MainContext';
import RenderPage from './Components/RenderPage';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './Components/Home';
import PrivateRoute from './PrivateRoute';
import Gtpp from './Modules/GTPP/Gtpp';
import RenderedModules from './Components/RenderedModules';
import { GtppWsProvider } from './Modules/GTPP/Context/GtppWsContext';
import 'react-notifications-component/dist/theme.css';
import 'animate.css/animate.min.css';
import { ConnectionProvider } from './Context/ConnContext';
import Cfpp from './Modules/CFPP/Cfpp';
import Infraction from './Modules/GAPP/Infraction/Infraction';
import Stores from './Modules/GAPP/Business/Stores';
import Gapp from './Modules/GAPP/Gapp';
import ProfileGIPP from './Modules/ProfileGIPP/ProfileGIPP';
import Gepp from './Modules/GEPP/Gepp';
import CreateTheme from './Modules/GTPP/CreateTheme/CreateTheme';
import Active from './Modules/GAPP/Active/Active';
import EPP from './Modules/EPP/Epp';
import EppMain from './Modules/EPP_V2/Epp';

function App() {
  function withProvider(component: JSX.Element) {
    return (
      <MyProvider>
        <RenderPage>{component}</RenderPage>
      </MyProvider>
    );
  }

  function withPrivateProvider(component: JSX.Element) {
    return (
      <MyProvider>
        <PrivateRoute>
          <RenderedModules>{component}</RenderedModules>
        </PrivateRoute>
      </MyProvider>
    );
  }

  return (
    <ConnectionProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={withProvider(<Login />)} />
          <Route path="/GIPP" element={withPrivateProvider(<Home />)} />
          <Route path="/GIPP/EPP" element={withPrivateProvider(<EppMain />)} />
          <Route path="/GIPP/GTPP" element={withPrivateProvider(<GtppWsProvider><Gtpp /></GtppWsProvider>)} />
          <Route path="/GIPP/GTPP/create/theme" element={withPrivateProvider(<GtppWsProvider><CreateTheme /></GtppWsProvider>)} />
          <Route path="/GIPP/CFPP" element={withPrivateProvider(<Cfpp />)} />
          <Route path='/GIPP/configuration/profile' element={withPrivateProvider(<ProfileGIPP />)} />
          <Route path="/GIPP/GAPP" element={withPrivateProvider(<Gapp />)} />
          <Route path="/GIPP/GAPP/Stores" element={withPrivateProvider(<Stores />)} />
          <Route path="/GIPP/GAPP/Infraction" element={withPrivateProvider(<Infraction />)} />
          <Route path="/GIPP/GAPP/Active" element={withPrivateProvider(<Active />)} />
          <Route path='/GIPP/GEPP' element={withPrivateProvider(<Gepp />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConnectionProvider>
  );

}

export default App;