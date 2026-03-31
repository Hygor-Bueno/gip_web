import { ActiveFormValues, Insurance, VehicleFormValues } from "../../Interfaces/Interfaces";

/* Payload de regras de negocios de Insurance(Seguros) */
export function mapFormToApi(active: ActiveFormValues, vehicle: VehicleFormValues, insurance?: Partial<Insurance>) {
  return {
    insurance: {
      ...insurance
    }
  };
}