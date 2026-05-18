import { Navigate, Outlet } from 'react-router-dom';
import RenderPage from './Components/RenderPage';
import RenderedModules from './Components/RenderedModules';
import { WebSocketProvider } from './Context/WsContext';
import { useConnection } from './Context/ConnContext';
import { NotificationHubProvider } from './Context/NotificationHubContext';

/**
 * Layout route. Não recebe mais `children` por props — agora é montado
 * uma única vez via `element={<PrivateRoute />}` no <Routes> e renderiza
 * `<Outlet />` no slot. Assim, ao navegar entre rotas privadas, os
 * providers (NotificationHub, WebSocket, GTPP) e o layout (RenderPage,
 * RenderedModules) permanecem montados — sem disparar refetch de
 * Token.php / LoginGipp.php / ChatLog.php nem reconectar o WebSocket.
 */
export default function PrivateRoute() {
    const { isLogged } = useConnection();
    if (!isLogged) return <Navigate to="/" />;
    return (
        <NotificationHubProvider>
            <WebSocketProvider>
                <RenderPage>
                    <RenderedModules>
                        <Outlet />
                    </RenderedModules>
                </RenderPage>
            </WebSocketProvider>
        </NotificationHubProvider>
    );
}
