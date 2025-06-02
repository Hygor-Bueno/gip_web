import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import StructureModal, { MessageModal } from "../Components/CustomModal";
import User from "../Class/User";
import { useConnection } from "./ConnContext";

const logo = require("../Assets/Image/peg_pese_loading.png");

// Definindo o tipo dos dados no contexto
interface MyMainContext {
  loading: boolean;
  setLoading: (step: boolean) => void;

  modal: boolean;
  setModal: (step: boolean) => void;

  newProgressBar: any;
  setNewProgressBar: any;

  reset: any;
  setResetState: React.Dispatch<React.SetStateAction<any>>; // Expondo diretamente o setter

  setMessage: (value: { text: string; type: 1 | 2 | 3 | 4 }) => void;

  setModalPage: (step: boolean) => void;

  setModalPageElement: (value: JSX.Element) => void;
  configUserData: (user: { id: number, session?: string; administrator?: number }) => void;
  titleHead: { title: string; simpleTitle: string, icon?: string };
  setTitleHead: (value: { title: string; simpleTitle: string; icon?: string }) => void;

  userLog: User;
  setUserLog: (value: User) => void;
  token: any;
  setToken: ({ }: any) => void;
  loadDetailsToken: () => void;
  contactList: User[];
  ctlSearchUser:boolean;
  setCtlSearchUser:(value:boolean)=>void;
  appIdSearchUser:number | null;
  setAppIdSearchUser:(value:number | null)=>void;
}

interface Props {
  children: JSX.Element; // Tipo para o children
}

// Criar o contexto
export const MyContext = createContext<MyMainContext | undefined>(undefined);

// Componente que fornece o contexto
export function MyProvider({ children }: Props) {
  const { fetchData } = useConnection();
  const [loading, setLoading] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [modalPage, setModalPage] = useState<boolean>(false);
  const [newProgressBar, setNewProgressBar] = useState<number | string | null>(null);
  const [token, setToken] = useState<any>({});
  const [ctlSearchUser, setCtlSearchUser] = useState<boolean>(false);
  const [appIdSearchUser, setAppIdSearchUser] = useState<number | null>(0);


  const [message, setMessage] = useState<{ text: string; type: 1 | 2 | 3 | 4 }>({
    text: "",
    type: 1,
  });
  const [modalPageElement, setModalPageElement] = useState<JSX.Element>(<div></div>);

  const [titleHead, setTitleHead] = useState<{ title: string; simpleTitle: string; icon?: string }>({
    title: "Gestão Integrada Peg Pese - GIPP",
    simpleTitle: "GIPP",
    icon: "",
  });
  const [userLog, setUserLog] = useState<User>(
    new User({ id: parseInt(localStorage.getItem('codUserGIPP') || "0"), session: "", administrator: 0 })
  );
  const [contactList, setContactList] = useState<User[]>([]);
  const [reset, setResetState] = useState<any>(1);
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notificações não são suportadas neste navegador.");
      return;
    }
    if (Notification.permission === "granted") {
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Som liberado após a autorização.");
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    configUserData({ id: parseInt(localStorage.getItem('codUserGIPP') || "0") });
  }, []);

  useEffect(() => {
    (async () => {
      await loadDetailsToken();
    })();
    // loadInitialDatas();
  }, [userLog]);

  // async function loadInitialDatas() {
  //   if (localStorage.tokenGIPP) {
  //     const company = await fetchData({ method: "GET", params: null, pathFile: 'CCPP/Company.php' });
  //     console.log(company);
  //   }
  // }

  async function configUserData(user: { id: number, session?: string; administrator?: number }) {
    if (user.id) {
      const newUser = new User({
        id: user.id,
        session: user.session,
        administrator: user.administrator ? user.administrator : 0
      })
      await newUser.loadInfo(true);
      setUserLog(newUser);
    }
  }

  async function loadDetailsToken() {
    if (userLog.id) {
      try {
        const token = await fetchData({ method: "GET", params: null, pathFile: 'CCPP/Token.php', urlComplement: `&application_id=18&user_id=${userLog.id}` });
        if (token.error) throw new Error(token.message);
        setToken(token.data[0]);
      } catch (error) {
        console.error(error);
      }
    }
  }
  return (
    <MyContext.Provider
      value={{
        loading,
        setLoading,
        modal,
        setModal,
        setMessage,

        titleHead,
        setTitleHead,
        userLog,
        setUserLog,
        contactList,
        setModalPage,
        setModalPageElement,

        newProgressBar,
        setNewProgressBar,
        configUserData,
        reset,
        setResetState,
        token,
        setToken,
        loadDetailsToken,

        ctlSearchUser, 
        setCtlSearchUser,
        appIdSearchUser, 
        setAppIdSearchUser
      }}
    >
      {loading && (
        <StructureModal className="StructureModal ModalBgWhite">
          <div className="d-flex flex-column align-items-center">
            <img className="spinner-grow-img" src={logo} alt="Logo Peg Pese" />
          </div>
        </StructureModal>
      )}

      {modal && (
        <StructureModal className="StructureModal ModalBgBlack">
          <MessageModal
            message={message.text}
            type={message.type}
            onClose={() => {
              setModal(false);
            }}
          />

        </StructureModal>
      )}
      {modalPage && (
        <StructureModal className="StructureModal ModalBgBlack">
          {modalPageElement}
        </StructureModal>
      )}

      {children}
    </MyContext.Provider>
  );
}

// Hook personalizado para usar o contexto
export const useMyContext = (): MyMainContext => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
