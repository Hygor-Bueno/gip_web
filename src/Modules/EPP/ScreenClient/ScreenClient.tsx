import React from "react";
import { z } from "zod";
import CustomFormGender from "../EPPComponent/CustomFormSecondary";
import { fieldsets } from "../FormConfig/FormConfig";

function ScreenClient() {
  const GenderSchema = z.object({
    name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
    gender: z.string().nonempty("Selecione um gênero."),
  });

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