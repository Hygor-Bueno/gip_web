import React, { useState, useEffect } from "react";
import CardInfo from "./Component/CardInfo/CardInfo";
import Form from "./Component/Form/Form";
import NavBar from "../../../Components/NavBar";
import useWindowSize from "./hook/useWindowSize";
import { IFormData } from "./Interfaces/IFormGender";
import { useMyContext } from "../../../Context/MainContext";
import { useConnection } from "../../../Context/ConnContext";
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
  const [visibilityList, setVisibilityList] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"0" | "1">("1");
  const { isTablet, isMobile, isDesktop } = useWindowSize();
  const { fetchData } = useConnection();
  const [dataStore, setDataStore] = useState<IFormData[]>([]);
  const [dataStoreTrash, setDataStoreTrash] = useState<IFormData[]>([]);
  const { setLoading } = useMyContext();

  useEffect(() => {
    const loadActiveData = async () => {
      await fetchInfractionData("1");
    };
    loadActiveData();
  }, []);

  const fetchInfractionData = async (status: "1" | "0") => {
    setLoading(true);
    try {
      const response: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GAPP/Infraction.php",
        urlComplement: `&status_infractions=${status}`,
      });
      if (status === "1") {
        setDataStore(response.data || []);
      } else {
        setDataStoreTrash(response.data || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const resetStore = () => {
    setDataStore([]);
    setDataStoreTrash([]);
    fetchInfractionData("1");
    if (currentStatus === "0") {
      fetchInfractionData("0");
    }
  };

  const resetForm = () => {
    setData({
      infraction: "",
      points: "",
      gravitity: "",
      status_infractions: "",
    });
  };

  const handleTrashToggle = async () => {
    const newStatus: "0" | "1" = currentStatus === "1" ? "0" : "1";
    setCurrentStatus(newStatus);
    if (newStatus === "0" && dataStoreTrash.length === 0) {
      await fetchInfractionData("0");
    }
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
    <>
      {(isMobile || isTablet) && (
        <button className="btn" onClick={() => setHiddeNav((prev) => !prev)}>
          <i className={`fa-regular ${hiddenNav ? "fa-eye" : "fa-eye-slash"}`} />
        </button>
      )}
      {(isMobile || isTablet) && (
        <button className="btn" onClick={() => setHiddeForm((prev) => !prev)}>
          <i className={`fa-solid ${hiddenForm ? "fa-caret-up fa-rotate-180" : "fa-caret-up"}`} />
        </button>
      )}
      <button className="btn" onClick={resetForm}>
        <i className="fa-solid fa-eraser" />
      </button>
      <button className="btn" onClick={handleTrashToggle}>
        <i className={`fa-solid fa-trash ${currentStatus === "0" ? "text-danger" : ""}`} />
      </button>
    </>
  );

  const visibilityInterleave = () => {
    const CardInfoSimplify = () => (
      <CardInfo
        resetDataStore={resetStore}
        visibilityTrash={currentStatus === "1"}
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
              <i className="fa-solid fa-square-poll-horizontal" />
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
