import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { formatDate, formatCurrency } from './helpers';

interface Props { active: any; }

const IdentificationSection: React.FC<Props> = ({ active }) => (
  <InfoSection icon="fa-cube" color="#16a34a" title="Identificação">
    <div className="info-grid">
      <InfoField label="Marca"              value={active?.brand} />
      <InfoField label="Modelo"             value={active?.model} />
      <InfoField label="Nº Nota Fiscal"     value={active?.number_nf} />
      <InfoField label="Data de Compra"     value={formatDate(active?.date_purchase)} />
      <InfoField label="Valor de Compra"    value={formatCurrency(active?.value_purchase)} />
      <InfoField label="Status"             value={active?.status_active === '1' ? 'Ativo' : active?.status_active ? 'Inativo' : undefined} />
      <InfoField label="Tipo de Ativo"      value={active?.desc_active_class} />
      <InfoField label="É Veículo"          value={active?.is_vehicle === true || active?.is_vehicle === '1' || active?.is_vehicle === 1 ? 'Sim' : 'Não'} />
      <InfoField label="Usado em"           value={active?.used_in} />
      <InfoField label="Responsável"        value={active?.name} />
      <InfoField label="Última Atualização" value={formatDate(active?.change_date)} />
    </div>
  </InfoSection>
);

export default IdentificationSection;
