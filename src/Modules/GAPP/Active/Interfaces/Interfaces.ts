/**
 * Barrel re-export — import from this file as before; nothing breaks.
 * The actual definitions live in:
 *   OrgInterfaces.ts   — Schema, FetchConfig, Company, Unit, Departament, Driver, ActiveType, FuelType
 *   VehicleInterfaces.ts — FranchiseItem, Insurance, VehicleFormValues
 *   ActiveInterfaces.ts  — PlaceAddress, ActiveFormValues, Active, ActiveTableData, FormActiveProps, IListAdd, IListAddFranchise
 */
export * from "./OrgInterfaces";
export * from "./VehicleInterfaces";
export * from "./ActiveInterfaces";
