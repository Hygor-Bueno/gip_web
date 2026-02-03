export 
type ActiveFormData = {
    // Campos do Ativo
    brand?: string;
    model?: string;
    number_nf?: string;
    date_purchase?: string;
    place_purchase?: string;
    value_purchase?: string;
    photo?: string;
    change_date?: string;
    list_items?: string;
    used_in?: string;
    is_vehicle?: string;
    status_active?: string;
    units_id_fk?: string;
    id_active_class_fk?: string;
    user_id_fk?: string;
    work_group_fk?: string;
    
    // Campos do Veículo
    license_plates?: string;
    year?: string;
    year_model?: string;
    chassi?: string;
    color?: string;
    renavam?: string;
    fuel_type?: string;
    power?: string;
    cylinder?: string;
    capacity?: string;
    fipe_table?: string;
    last_revision_date?: string;
    last_revision_km?: string;
    next_revision_date?: string;
    next_revision_km?: string;
    directed_by?: string;
    shielding?: string;
    fuel_type_id_fk?: string;
};