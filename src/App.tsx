import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import User from './Class/User';
import Login from './Components/Login';
import { MyProvider } from './Context/MainContext';
import RenderPage from './Components/RenderPage';
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from './Components/Home';
import PrivateRoute from './PrivateRoute';
import Gtpp from './Modules/GTPP/Gtpp';

function App() {
  React.useEffect(() => {
    const user = new User({ login: 'Hygor', password: '1234' });
  }, []);
  return (
    <HashRouter>
      <Routes>

        <Route path="/" element={
          <MyProvider>
            <RenderPage>
              <Login />
            </RenderPage>
          </MyProvider>
        } />

        <Route path="/home" element={
          <MyProvider>
            <PrivateRoute>
              <RenderPage>
                <Home />
              </RenderPage>
            </PrivateRoute>
          </MyProvider>
        } />
        <Route path="/home/GTPP" element={
          <MyProvider>
            <PrivateRoute>
              <RenderPage>
                <Gtpp />
              </RenderPage>
            </PrivateRoute>
          </MyProvider>
        } />


      </Routes>
    </HashRouter>
  );
}

export default App;
