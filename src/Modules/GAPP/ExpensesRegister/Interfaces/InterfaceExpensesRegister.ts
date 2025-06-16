export interface IExpensesItem {
    expen_id: number,
    date: string,
    hour: string,
    description: string,
    discount: string,
    total_value: string,
    exp_type_id_fk: string,
    description_type: string,
    vehicle_id: string,
    license_plates: string,
    unit_id: string,
    unit_name: string
}