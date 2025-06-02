import React from 'react';
import CustomForm from '../../../../../Components/CustomForm';
import { fieldsetsFormsBusiness } from '../../mock/configuration';
import { consultingCEP, handleNotification } from '../../../../../Util/Util';
import { Connection } from '../../../../../Connection/Connection';
import { IFormProps } from '../../Interfaces/IFormGender';
import { useMyContext } from '../../../../../Context/MainContext';


const Form: React.FC<IFormProps> = ({ data, handleFunction, resetDataStore, resetForm, setData }) => {

  const defaultFunction = (value: string) => { };
  const { setLoading } = useMyContext();

  const [
    handleFildCNPJ = defaultFunction,
    handleFieldName = defaultFunction,
    handleFieldStreet = defaultFunction,
    handleFieldDistrict = defaultFunction,
    handleFieldCity = defaultFunction,
    handleFieldState = defaultFunction,
    handleFieldNumber = defaultFunction,
    handleFieldZipCode = defaultFunction,
    handleFieldComplement = defaultFunction
  ] = handleFunction || [];

  const isNewStore = !data?.store_id;

  const filter = fieldsetsFormsBusiness(
    handleFildCNPJ,
    handleFieldName,
    handleFieldStreet,
    handleFieldDistrict,
    handleFieldCity,
    handleFieldState,
    handleFieldNumber,
    handleFieldZipCode,
    handleFieldComplement,
    data,
    searchCEP,
  );


  function searchCEP() {
    return consultingCEP(data?.zip_code, setData, setLoading)
  }

  async function postStore(obj: any, conn: any = new Connection('18')) {
    try {
      setLoading(true);
      const data = await conn.post(obj, 'GAPP/Store.php');
      if (data.error) throw new Error(data.message);
      return !data.error;
    } catch (error) {
      handleNotification("Erro", `${error}`, "danger");
    } finally {
      setLoading(false);
    }
  }

  async function putStore(obj: any, conn: any = new Connection('18')) {
    try {
      setLoading(true);
      const data = await conn.put(obj, 'GAPP/Store.php');
      if (data.error) throw new Error(data.message);
      return !data.error;
    } catch (error) {
      handleNotification("Erro", `${error}`, "danger");
    } finally {
      setLoading(false);
    }
  }

  function formatStoreData(data: any) {
    return {
      cnpj: data?.cnpj.replace(/[^a-z0-9]/gi, ""),
      name: data?.name,
      street: data?.street,
      district: data?.district,
      city: data?.city,
      state: data?.state,
      number: data?.number,
      zip_code: data?.zip_code,
      complement: data?.complement,
      status_store: data?.status_store,
      ...(isNewStore ? {} : { store_id: data.store_id }),
    };
  };

  const editorSendData = async () => {
    try {
      let result;
      if (isNewStore) {
        result = await postStore(formatStoreData(data));
      } else {
        result = await putStore(formatStoreData(data));
      }
      if (result) {
        if (resetDataStore) resetDataStore();
        if (resetForm) resetForm();
      }
    } catch (error) {
      handleNotification("Error", String(error).toLowerCase(), "danger");
    }
  };
  return (
      <CustomForm
        classButton={`btn btn-success my-2 fa-sharp fa-solid ${isNewStore ? 'fa-paper-plane' : 'fa-arrows-rotate'} text-white`}
        className='row'
        notButton={true}
        titleButton={""}
        fieldsets={filter}
        onSubmit={async (event)=>{
          event.preventDefault();
          await editorSendData();
        }}
      />
  );
};
export default Form;