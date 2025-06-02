import React from 'react';
import CustomForm from '../../../../../Components/CustomForm';
import { handleNotification } from '../../../../../Util/Util';
import { useConnection } from '../../../../../Context/ConnContext';
import { useMyContext } from '../../../../../Context/MainContext';
import { fieldsetsFormsInfractions } from '../../mock/configuration';
import useWindowSize from '../../hook/useWindowSize';

const Form: React.FC<any> = ({data, handleFunction, resetDataStore, resetForm }) => {
  const defaultFunction = () => {};
  const {width} = useWindowSize();
  const {fetchData} = useConnection();
  const { setLoading } = useMyContext();
  const [
    handleInfraction = defaultFunction,
    handleGravitity = defaultFunction,
    handlePoints = defaultFunction
  ] = handleFunction || [];

  const isNewStore = !data?.infraction_id;

  async function InfractionData(obj: any, method: "POST" | "PUT" = "POST") {
    try {
        const response: any = await fetchData({method,params: obj,pathFile: "GAPP/Infraction.php",urlComplement: ""});
        if(!response.error) throw new Error(obj);
        return response.error;
    } catch (error) {
        console.log(error);
    }
  }

  const editorSendData = async () => {
    try {
      setLoading(true);
      let result;
      if(isNewStore) {
        result = await InfractionData(formatStoreData(data), "POST");
      } else {
        result = await InfractionData(formatStoreData(data), "PUT");
      }
      if(!result) {
        if(resetDataStore) resetDataStore();
        if(resetForm) resetForm();
      }
    } catch (error) {
      handleNotification("Error", String(error).toLowerCase(), "danger");
    } finally {
      setLoading(false);
    }
  };

  function formatStoreData (data: {
    infraction: any,
    points: any,
    gravitity: any,
    status_infraction: any,
    infraction_id: any
  }) {
    return {
      infraction: data?.infraction,
      points: data?.points,
      gravitity: data?.gravitity,
      status_infractions: 1,
      ...(isNewStore ? {} : { infraction_id: data.infraction_id }),
    };
  };

  return (
    <React.Fragment>
      <div className='col-12 form-control bg-white bg-opacity-75 shadow mb-2 w-100 d-flex flex-column justify-content-between form-style-modal'>
        <div className={`${ !(width > 260 && width < 920) ? 'd-flex' : null} w-100`}>
                <CustomForm
                    classRender='w-100'
                    classButton='btn btn-success'
                    className='p-3 row w-100'
                    notButton={false}
                    fieldsets={
                        fieldsetsFormsInfractions(
                            handleInfraction,
                            handlePoints,
                            handleGravitity,
                            data
                        )} />
            <div className="mt-5 d-flex gap-4">
                <button style={{height: 'fit-content'}} className={`btn btn-success`} onClick={editorSendData}>
                    <i className={`fa-sharp fa-solid ${isNewStore ? 'fa-paper-plane' : 'fa-arrows-rotate'} text-white`}></i>
                </button>
                <button style={{height: 'fit-content'}} className={'btn btn-danger'} onClick={() => resetForm()}>
                    <i className={'fa-sharp fa-solid fa-eraser text-white'}></i>
                </button>
            </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Form;
