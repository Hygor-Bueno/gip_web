import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { formatDate } from './helpers';
import { VehicleFormValues } from '../../Interfaces/Interfaces';

interface Props { vehicle: VehicleFormValues; }

const VeiculoSection: React.FC<Props> = ({ vehicle }) => (
  <InfoSection icon="fa-car" color="#0891b2" title="Veículo">
    <div className="info-grid">
      <InfoField label="Placa"                  value={vehicle.license_plates} />
      <InfoField label="Ano"                    value={vehicle.year} />
      <InfoField label="Ano Modelo"             value={vehicle.year_model} />
      <InfoField label="Chassi"                 value={vehicle.chassi} />
      <InfoField label="Renavam"                value={vehicle.renavam} />
      <InfoField label="Cor"                    value={vehicle.color} />
      <InfoField label="Combustível"            value={vehicle.fuel_type} />
      <InfoField label="Potência"               value={vehicle.power} />
      <InfoField label="Cilindradas"            value={vehicle.cylinder} />
      <InfoField label="Capacidade"             value={vehicle.capacity} />
      <InfoField label="Tabela FIPE"            value={vehicle.fipe_table} />
      <InfoField label="Blindagem"              value={vehicle.shielding === true ? 'Sim' : vehicle.shielding === false ? 'Não' : undefined} />
      <InfoField label="Direcionado Por"        value={vehicle.directed_by} />
      <InfoField label="Última Revisão (Data)"  value={formatDate(vehicle.last_revision_date as string | undefined)} />
      <InfoField label="Última Revisão (Km)"   value={vehicle.last_revision_km} />
      <InfoField label="Próxima Revisão (Data)" value={formatDate(vehicle.next_revision_date as string | undefined)} />
      <InfoField label="Próxima Revisão (Km)"  value={vehicle.next_revision_km} />
    </div>
  </InfoSection>
);

export default VeiculoSection;
