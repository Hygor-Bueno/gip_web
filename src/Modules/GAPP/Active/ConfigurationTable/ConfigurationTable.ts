
// colunas que ficarão escondidas
export const listColumnsOcult = [
    "number_nf",
    "photo", 
    "change_date", 
    "list_items", 
    "used_in", 
    "place_purchase", 
    "is_vehicle", 
    "units_id_fk", 
    "user_id_fk", 
    "id_active_class_fk", 
    "work_group_fk", 
    "id_active_class", 
    "desc_active_class", 
    "status_active_class", 
    "active_type_id_fk", 
    "user_id", 
    "name", 
    "access_code", 
    "driver", 
    "status_user", 
    "sub_dep_id_fk", 
    "level_id_fk", 
    "group_id", 
    "group_name", 
    "status_work_group",
    "dep_id_fk",
    "comp_id_fk", 
    "status_unit",
    "unit_id",
    "unit_number",

];

// colunas que vai ser renomeadas.
export const customTagsActive = {
    active_id: "Cód",
    brand: "Marca",
    model: "modelo",
    unit_number: "Numero da Unidade",
    address: "Endereço",
    unit_name: "Nome da unidade",
    cnpj: "CNPJ",
    date_purchase: "Data comp.",
    value_purchase: "Valor comp.",
    status_active: "Status do Ativo",
}

// adaptando o retorno do valor para a tela.
export const customValueActive = {
    address: (_: any, row: any) => {
        try {
            const address = row?.address 
            ? JSON.parse(row.address)
            : null;

            return `${address?.city}, ${address?.public_place}, ${address?.zip_code}` || "";
        }
        catch {
            return "";
        }
    },
    value_purchase: (value: any) => {
        try {
            const number = Number(value);

            if (isNaN(number)) return "";

            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
            }).format(number);
        } catch {
            return "";
        }
    },
    /*
        status_active: (value: any) => {
            try {
                return value == 1
                        ? "Ativo"
                        : "Inativo";
            } catch {
                return ""
            }
        },
    */
}
 