import React from 'react';
import CustomForm from '../../../../../Components/CustomForm';
import { handleNotification } from '../../../../../Util/Util';
import { Connection } from '../../../../../Connection/Connection';
import { useMyContext } from '../../../../../Context/MainContext';
import { fieldsetsFormsInfractions } from '../../mock/configuration';
import useWindowSize from '../../hook/useWindowSize';

const Form: React.FC<any> = ({data, handleFunction, resetDataStore, resetForm }) => {
  const defaultFunction = () => {};
  const {width} = useWindowSize();
  const { setLoading } = useMyContext();

  const [
    handleInfraction = defaultFunction,
    handleGravitity = defaultFunction,
    handlePoints = defaultFunction
  ] = handleFunction || [];

  const isNewStore = !data?.infraction_id;
    async function storeData(
        obj: any,
        method: 'post' | 'put',
        conn: any = new Connection('18')
    ) {
        try {
            setLoading(true);
            const response = await conn[method](obj, 'GAPP/Infraction.php');
            !response.error
            ? handleNotification("Sucesso", response.message, "success")
            : handleNotification("Erro", response.message, "danger");
            return response.error;
        } catch (error) {
            handleNotification("Erro", `${error}`, "danger");
        } finally {
            setLoading(false);
        }
    }

  const editorSendData = async () => {
    try {
      let result;
      if(isNewStore) {
        result = await storeData(formatStoreData(data), "post");
      } else {
        result = await storeData(formatStoreData(data), "put");
      }
      if(!result) {
        if(resetDataStore) resetDataStore();
        if(resetForm) resetForm();
      }
    } catch (error) {
      handleNotification("Error", String(error).toLowerCase(), "danger");
    }
  };

  function formatStoreData (data: any) {
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
