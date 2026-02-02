import { useEffect, useState } from 'react';
import { Department, Driver, FuelType, Unit } from '../Interfaces/Interfaces';
import { ActiveDepartamentData, ActiveDriverData, ActiveTypeFuelData, ActiveUnitsData } from './ActiveHook';

export const useActiveAuxData = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);

  useEffect(() => {
    (async () => {
      const [u, d, dr, f] = await Promise.all([
        ActiveUnitsData(),
        ActiveDepartamentData(),
        ActiveDriverData(),
        ActiveTypeFuelData()
      ]);

      setUnits(u.data || u);
      setDepartments(d.data || d);
      setDrivers(dr.data || dr);
      setFuelTypes(f.data || f);
    })();
  }, []);

  return { units, departments, drivers, fuelTypes };
};
