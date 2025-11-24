import React from "react";
import CustomFormGender from "../EPPComponent/CustomFormSecondary";
import { fieldsets } from "../FormConfig/FormConfig";

function ScreenClient() {
  return (
    <div id="screen-client-order" className="w-100">
      <CustomFormGender
        fieldsets={fieldsets}
        onValidSubmit={(data: any) => console.log("Dados válidos:", data)}
        titleButton="Salvar"
        classButton="btn btn-success"
      />
    </div>
  )
}

export default ScreenClient;