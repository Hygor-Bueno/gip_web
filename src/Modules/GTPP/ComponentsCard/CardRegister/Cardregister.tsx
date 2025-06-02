import { useEffect, useRef, useState } from "react";
import CustomForm from "../../../../Components/CustomForm";
import { fieldsetsRegister } from "../../mock/configurationfile";
import { useConnection } from "../../../../Context/ConnContext";
import { useMyContext } from "../../../../Context/MainContext";

type Cardregister = {
  assistenceFunction?: any;
  reloadtask?: any;
  setReset?: any;
  onClose: () => void;
};

export function convertDataForOptionSelect(data: any[], label: string, value: string): [{ value: string, label: string }] {
  let result: [{ value: string, label: string }] = [{ value: "", label: "" }];
  data.forEach((item: any) => {
    result.push({ value: item[value], label: item[label] })
  })
  return result;
}


const Cardregister: React.FC<Cardregister> = (props) => {
  const { assistenceFunction } = props;

  const [company, setCompany] = useState<any[]>([]);
  const [store, setStore] = useState<any[]>([]);
  const [departament, setDepartament] = useState<any[]>([]);

  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const formDataRef = useRef({
    description: "",
    initial_date: "",
    final_date: "",
    company_id: 0,
    shop_id: 0,
    depart_id: 0,
    priority: 0,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    formDataRef.current = {
      ...formDataRef.current,
      [name]: value,
    };
  };

  const handleSubmit = async (e: any) => {
    try {
      e.preventDefault();
      const response: any = await fetchData({ method: "POST", params: formDataRef.current, pathFile: "GTPP/Task.php" })
      if (response.error) throw new Error(response.message);
      const reqCSDS: any = await fetchData({ method: "POST", params: { ...formDataRef.current, task_id: response["last_id"] }, pathFile: "GTPP/TaskComShoDepSub.php" })
      if (reqCSDS.error) throw new Error(reqCSDS.message);
      props.reloadtask();
      props.onClose();
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    loadCompany();
  }, []);

  async function loadCompany() {
    try {
      setLoading(true);
      const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Company.php" });
      if (req.data) setCompany(req.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStore(idCompany: number) {
    try {
      setLoading(true);
      clearLists();
      const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Shop.php", urlComplement: `&company_id=${idCompany}` });
      if (req.error) throw new Error(req.message);
      setStore(req.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function clearLists() {
    setStore([]);
    setDepartament([]);
  }

  async function loadDepartament(idStore: number) {
    try {
      setLoading(true);
      setDepartament([]);
      if (idStore) {
        const req: any = await fetchData({ method: "GET", params: null, pathFile: "CCPP/Department.php", urlComplement: `&shop_id=${idStore}` });
        if (req.error) throw new Error(req.message);
        setDepartament(req.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="card bodyCard">
      <div className="d-flex justify-content-end align-items-center">
        <div className="w-100 d-flex justify-content-end px-2">
          <button
            className="btn btn-danger fa fa-close"
            onClick={assistenceFunction}
          ></button>
        </div>
      </div>
      <CustomForm
        fieldsets={
          fieldsetsRegister(
            convertDataForOptionSelect(company, "description", "id"),
            loadStore,
            convertDataForOptionSelect(store, "description", "id"),
            loadDepartament,
            convertDataForOptionSelect(departament, "description", "id")
          )
        }
        onSubmit={handleSubmit}
        onChange={(event) => handleChange(event)}
        titleButton={"Enviar"}
        method="post"
        className='p-3'
        id='loginCustomForm'
      />
    </div>
  );
};

export default Cardregister;
