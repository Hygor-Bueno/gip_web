import { Navigate } from 'react-router-dom';
import RenderPage from './Components/RenderPage';
import { WebSocketProvider } from './Context/WsContext';
import { useConnection } from './Context/ConnContext';
import { NotificationHubProvider } from './Context/NotificationHubContext';
type Props = {
    children: JSX.Element; // Tipo para o children
}

export default function PrivateRoute({ children }: Props) {
    const { isLogged } = useConnection();
    return isLogged ?
        <NotificationHubProvider>
            <WebSocketProvider>
                <RenderPage>
                    {children}
                </RenderPage>
            </WebSocketProvider>
        </NotificationHubProvider>
        :
        <Navigate to="/" />;
}