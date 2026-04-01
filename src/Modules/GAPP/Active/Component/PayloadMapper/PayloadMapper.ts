import { ActiveFormValues, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";

/** Payload para Active.php — contém apenas os dados do ativo */
export function mapActiveToApi(active: ActiveFormValues) {
  return {
    ...active,
    is_vehicle: active.is_vehicle ? 1 : 0,
    list_items: JSON.stringify(active.list_items || { list: [] }),
    place_purchase: JSON.stringify(active.place_purchase || {})
  };
}

/** Payload para Vehicle.php — contém apenas os dados do veículo */
export function mapVehicleToApi(vehicle: VehicleFormValues) {
  return {
    ...vehicle,
    shielding: vehicle.shielding ? 1 : 0
  };
}