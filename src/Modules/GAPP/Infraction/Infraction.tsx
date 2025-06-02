import React, { useState, useEffect } from "react";
import CardInfo from "./Component/CardInfo/CardInfo";
import Form from "./Component/Form/Form";
import NavBar from "../../../Components/NavBar";
import { listPath } from "../../GTPP/mock/configurationfile";
import useWindowSize from "./hook/useWindowSize";
import { IFormData } from "./Interfaces/IFormGender";
import { useMyContext } from "../../../Context/MainContext";
import { useConnection } from "../../../Context/ConnContext";
import { handleNotification } from "../../../Util/Util";
import { listPathGAPP } from "../ConfigGapp";

const Infraction: React.FC = () => {
  const [data, setData] = useState<any>({
    infraction: "",
    points: "",
    gravitity: "",
    status_infractions: "",
  });

  const [hiddenNav, setHiddeNav] = useState(false);
  const [hiddenForm, setHiddeForm] = useState(false);
  const [visibilityTrash, setVisibilityTrash] = useState(true);
  const [visibilityList, setVisibilityList] = useState(false);
  const { isTablet, isMobile, isDesktop } = useWindowSize();
  const { fetchData } = useConnection();
  const [dataStore, setDataStore] = useState<IFormData[]>([]);
  const [dataStoreTrash, setDataStoreTrash] = useState<IFormData[]>([]);

  const { setLoading } = useMyContext();

  const connectionBusinessGeneric = async (status: "0" | "1",setData: (data: IFormData[]) => void) => {
    setLoading(true);
    try {
      const data:any = await fetchData({ method:'GET', params: null, pathFile: "GAPP/Infraction.php", urlComplement:`&status_infractions=${status}`});
      setData(data.data || []);
    } catch (error) {
       handleNotification("Erro", `${error}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectionBusinessGeneric("1", setDataStore);
    connectionBusinessGeneric("0", setDataStoreTrash);
  }, []);

  function resetStore() {
    setDataStore([]);
    connectionBusinessGeneric("1", setDataStore);

    setDataStoreTrash([]);
    connectionBusinessGeneric("0", setDataStoreTrash);
  }

  const resetForm = () => {
    setData({
      infraction: "",
      points: "",
      gravitity: "",
      status_infractions: "",
    });
  };

  const FormComponent = () => (
    <div className={`d-flex col-12 col-sm-12 w-100 col-lg-${isTablet ? "3" : "4"}`}>
      <Form
        handleFunction={[
          (value: string) => setData((x: any) => ({ ...x, infraction: value })),
          (value: string) => setData((x: any) => ({ ...x, gravitity: value })),
          (value: string) => setData((x: any) => ({ ...x, points: value })),
          (value: string) => setData((x: any) => ({ ...x, status_infractions: value })),
        ]}
        resetDataStore={resetStore}
        resetForm={resetForm}
        data={data}
        setData={setData}
      />
    </div>
  );

  const menuButtonFilter = () => (
    <React.Fragment>
      {(isMobile || isTablet) && (
        <button className="btn" onClick={() => setHiddeNav((prev) => !prev)}>
          <i className={`fa-regular ${hiddenNav ? "fa-eye" : "fa-eye-slash"} `} />
        </button>
      )}
      {(isMobile || isTablet) && (
        <button className="btn" onClick={() => setHiddeForm((prev) => !prev)}>
          <i className={`fa-solid ${ hiddenForm ? "fa-caret-up fa-rotate-180" : "fa-caret-up"}`} />
        </button>
      )}
      <button className="btn" onClick={resetForm}>
        <i className="fa-solid fa-eraser"/>
      </button>
      <button className="btn" onClick={() => setVisibilityTrash((prev) => !prev)}>
        <i className={`fa-solid fa-trash ${!visibilityTrash ? "text-danger" : ""}`} />
      </button>
    </React.Fragment>
  );

  const visibilityInterleave = () => {
    const CardInfoSimplify = () => (
      <CardInfo
        resetDataStore={resetStore}
        visibilityTrash={visibilityTrash}
        dataStore={dataStore}
        dataStoreTrash={dataStoreTrash}
        setData={setData}
        setHiddenForm={setHiddeForm}
      />
    );

    return isMobile || isTablet ? (
      <React.Fragment>
        {hiddenForm && FormComponent()}
        {!hiddenForm && CardInfoSimplify()}
      </React.Fragment>
    ) : (
      <React.Fragment>
        {FormComponent()}
        {CardInfoSimplify()}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {(isMobile || isTablet) && hiddenNav ? (
        <NavBar list={listPathGAPP} />
      ) : isDesktop ? (
        <NavBar list={listPathGAPP} />
      ) : null}

      <div className="container">
        <div className="justify-content-between align-items-center px-2 position-relative">
          {!isMobile && <div className="w-100"><h1 className="title_business">Cadastro de Infrações</h1></div>}
          <div className="form-control button_filter bg-white bg-opacity-75 shadow m-2 d-flex flex-column align-items-center position-absolute">
            <button className="btn" onClick={() => setVisibilityList((prev) => !prev)}>
              <i className="fa-solid fa-square-poll-horizontal"/>
            </button>
            {visibilityList && menuButtonFilter()}
          </div>
        </div>
        <div className={`justify-content-between gap-5 ${isMobile ? "h-100" : ""}`}>
          {visibilityInterleave()}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Infraction;
