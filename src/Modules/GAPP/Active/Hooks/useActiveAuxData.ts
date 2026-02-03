import { useEffect, useState, useCallback } from 'react';
import { ActiveType, Company, Department, Driver, FuelType, Unit } from '../Interfaces/Interfaces';
import {
  ActiveCompanyData,
  ActiveDepartamentData,
  ActiveDriverData,
  ActiveTypeData,
  ActiveTypeFuelData,
  ActiveUnitsData
} from './ActiveHook';

export const useActiveAuxData = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [company, setCompany] = useState<Company[]>([]);
  const [activeType, setActiveType] = useState<ActiveType[]>([]);

  const normalizeResponse = <T,>(res: any): T[] => {
    return res?.data || res || [];
  };

  const loadAuxData = useCallback(async () => {
    const [u, d, dr, f, c, at] = await Promise.all([
      ActiveUnitsData(),
      ActiveDepartamentData(),
      ActiveDriverData(),
      ActiveTypeFuelData(),
      ActiveCompanyData(),
      ActiveTypeData(),
    ]);

    setUnits(normalizeResponse<Unit>(u));
    setDepartments(normalizeResponse<Department>(d));
    setDrivers(normalizeResponse<Driver>(dr));
    setFuelTypes(normalizeResponse<FuelType>(f));
    setCompany(normalizeResponse<Company>(c));
    setActiveType(normalizeResponse<ActiveType>(at));

  }, []);

  useEffect(() => {
    loadAuxData();
  }, [loadAuxData]);

  return { units, departments, drivers, fuelTypes, company, activeType };
};
