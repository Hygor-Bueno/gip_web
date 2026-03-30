/* Payload de regras de negocios de Insurance(Seguros) */
export function mapFormToApi (active: any, vehicle: any, insurance?: any) {
  return {
    insurance: {
        ...insurance
    }
  };
}