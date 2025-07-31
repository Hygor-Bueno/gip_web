import { createContext, useContext, useState } from "react";
import { fetchDataFull } from "../Util/Util";
import { ConnectionContextProps, iReqConn } from "../Interface/iConnection";
import StructureModal from "../Components/CustomModal";

const logo = require("../Assets/Image/peg_pese_loading.png");

const ConnectionContext = createContext<ConnectionContextProps | undefined>(
  undefined
);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isLogged, setIsLogged] = useState<boolean>(true);
  const fetchData = async (req: iReqConn) => {
    setLoading(true);
    const request = await fetchDataFull(req);
    if (request.error && request.message) {
      const tokenExpired =
        request.message.toLowerCase().includes("authorization denied") ||
        request.message.toLowerCase().includes("time expired token 24rs limit");
      if (tokenExpired && isLogged) {
        setIsLogged(false);
        localStorage.clear();
      }
    }
    setLoading(false);
    return request;
  };
  return (
    <ConnectionContext.Provider value={{ fetchData, isLogged, setIsLogged }}>
      {loading && (
        <StructureModal className="StructureModal ModalBgWhite">
          <div className="d-flex flex-column align-items-center">
            <img className="spinner-grow-img" src={logo} alt="Logo Peg Pese" />
          </div>
        </StructureModal>
      )}
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
