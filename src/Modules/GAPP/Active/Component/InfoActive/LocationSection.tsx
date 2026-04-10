import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';

interface Props { active: any; }

const LocationSection: React.FC<Props> = ({ active }) => (
  <InfoSection icon="fa-building" color="#2563eb" title="Localização / Organização">
    <div className="info-grid">
      <InfoField label="Empresa"           value={active?.corporate_name ?? active?.fantasy_name} />
      <InfoField label="Unidade"           value={active?.unit_name} />
      <InfoField label="Departamento"      value={active?.dep_id_fk} />
      <InfoField label="Grupo de Trabalho" value={active?.group_name} />
    </div>
  </InfoSection>
);

export default LocationSection;
