import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMyContext } from './Context/MainContext';
import RenderPage from './Components/RenderPage';
import { WebSocketProvider } from './Context/WsContext';
import { isTokenExpired } from './Util/Util';
import { useConnection } from './Context/ConnContext';
type Props = {
    children: JSX.Element; // Tipo para o children
}

export default function PrivateRoute({ children }: Props) {
    const { isLogged } = useConnection();
    return isLogged ?
        <WebSocketProvider>
            <RenderPage>
                {children}
            </RenderPage>
        </WebSocketProvider>
        :
        <Navigate to="/" />;
} 