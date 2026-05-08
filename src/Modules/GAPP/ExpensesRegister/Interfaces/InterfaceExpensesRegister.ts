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
    unit_name: string,
    store_id_fk?: string,
    store_name?: string,
    place_purchase?: string,
    driver_id_fk?: string,
    id_insurance_fk?: string,
    coupon_number?: string
}

export interface IStoreOption {
    label: string;
    value: string;
}