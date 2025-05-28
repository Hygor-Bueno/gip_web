import React from 'react';
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
import 'react-notifications-component/dist/theme.css'; // Tema básico
import 'animate.css/animate.min.css'; // Animações opcionais
import { ConnectionProvider } from './Context/ConnContext';
import Cfpp from './Modules/CFPP/Cfpp';
import Gapp from './Modules/GAPP/Gapp';
import Infraction from './Modules/GAPP/Infraction/Infraction';


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
          <Route path="/home" element={withPrivateProvider(<Home />)} />
          <Route path="/home/GTPP" element={withPrivateProvider(<GtppWsProvider><Gtpp /></GtppWsProvider>)} />
          <Route path="/home/CFPP" element={withPrivateProvider(<Cfpp />)} />
          <Route path="/home/GAPP" element={withPrivateProvider(<Gapp/>)} />
          <Route path="/home/Infraction" element={withPrivateProvider(<Infraction />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ConnectionProvider>
  );

}

export default App;
