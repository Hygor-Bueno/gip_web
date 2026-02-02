import React from 'react';
import { DynamicForm } from '../../DynamicForm/DynamicForm';
import { ConfigFormVehicle } from '../../../ConfigurationTable/ConfigurationForm';


const VehicleFields = ({formData, data}: any) => {
    const formConfigurationVehicle = ConfigFormVehicle();

    return (
       <div className="card p-3 shadow-sm animate__animated animate__fadeInUp">
            <h2>Veiculos</h2>
            <hr />
            <DynamicForm 
                fields={formConfigurationVehicle}
                data={formData}
                onChange={() => console.log("teste")}
            />
        </div>
    )
}

export default VehicleFields;