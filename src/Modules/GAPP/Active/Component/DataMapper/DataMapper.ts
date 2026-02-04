import { ActiveFormValues, VehicleFormValues } from "../FormActive/FormActiveInterface";

export function mapFormToApi(active: ActiveFormValues, vehicle: VehicleFormValues) {
  return {
    active: {
      ...active,
      is_vehicle: active.is_vehicle ? 1 : 0,
      list_items: JSON.stringify(active.list_items || { list: [] }),
      place_purchase: JSON.stringify(active.place_purchase || {})
    },
    vehicle: {
      ...vehicle,
      shielding: vehicle.shielding ? 1 : 0
    }
  };
}