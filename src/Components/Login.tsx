import React, { useState } from "react";
import CustomForm from "./CustomForm";
import { useMyContext } from "../Context/MainContext";
import { useNavigate } from "react-router-dom";
import { fieldsetsData } from "../Configs/LoginConfigs";
import DefaultPassword from "./DefaultPassword";
import { ReactNotifications } from "react-notifications-component";
import { useConnection } from "../Context/ConnContext";
import User from "../Class/User";
import { loadLocalStorage } from "../Util/Util";

export default function Login() {
    const [defaultPassword, setDefaulPassword] = useState<boolean>(false);
    const [user, setUser] = useState<{
        login: string
        password: string
    }>({ login: "", password: "" });

    const navigate = useNavigate();
    const { setLoading, setTitleHead, configUserData } = useMyContext();
    const { setIsLogged } = useConnection();
    const { fetchData } = useConnection();

    React.useEffect(() => {
        setTitleHead({ title: "Gestão Integrada Peg Pese - GIPP", simpleTitle: "GIPP", icon: "" });
        setIsLogged(false);
    }, []);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        login();
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 w-100">
            <DefaultPassword user={user} open={defaultPassword} onClose={() => setDefaulPassword(false)} />
            <CustomForm
                fieldsets={fieldsetsData}
                onSubmit={handleSubmit}
                method="post"
                className="d-flex flex-column align-items-center justify-content-center col-8 col-sm-6 col-md-4 col-lg-3 col-xl-2 rounded p-2"
                id="loginCustomForm"
            />
            <a href="http://gigpp.com.br:72/global.html">Versão antiga</a>
            <ReactNotifications />
        </div>
    );

    function openModalChangePassword(message: string) {
        const passDefault = message.toLowerCase().includes("default password is not permited");
        if (passDefault) {
            setTimeout(() => {
                setDefaulPassword(true);
            }, 5000);
        }
    }
    function configLocalStoranger(user: any) {
        localStorage.setItem("tokenGIPP", user.session);
        localStorage.setItem("codUserGIPP", user.id);
    }
    function buildUserLogin(): { login: string, password: string } {
        return {
            login: (document.getElementById("loginUserInput") as HTMLInputElement).value,
            password: (document.getElementById("passwordUserInput") as HTMLInputElement).value
        }
    }
    async function login() {
        setLoading(true);
        try {
            const userLogin = buildUserLogin();
            setUser(userLogin);
            let req: any = await fetchData({ method: "POST", params: { user: userLogin.login, password: userLogin.password }, pathFile: "CCPP/Login.php", urlComplement: "&login=" });
            if (!req) throw new Error("No response from server");
            if (req.error) throw new Error(req.message);
            configLocalStoranger(req.data);
            loadLocalStorage(req.data);
            await configUserData({ id: req.data["id"], session: req.data["session"] });
            setIsLogged(true);
            navigate("/GIPP");
        } catch (error: any) {
            openModalChangePassword(error.message);
        }
        setLoading(false);
    }

}