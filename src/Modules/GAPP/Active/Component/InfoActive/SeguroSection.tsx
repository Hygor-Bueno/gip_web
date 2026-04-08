import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { formatDate, formatCurrency } from './helpers';
import { Insurance } from '../../Interfaces/Interfaces';

interface Props { insurance: Insurance; }

const SeguroSection: React.FC<Props> = ({ insurance }) => (
  <InfoSection icon="fa-shield" color="#dc2626" title="Seguro">
    <div className="info-grid">
      <InfoField label="Seguradora"            value={insurance.ins_name} />
      <InfoField label="Corretora"             value={insurance.broker_name} />
      <InfoField label="Nº Apólice"            value={insurance.policy_number} />
      <InfoField label="Nº Proposta"           value={insurance.proposal_number} />
      <InfoField label="Vigência Início"       value={formatDate(insurance.date_init)} />
      <InfoField label="Vigência Fim"          value={formatDate(insurance.date_final)} />
      <InfoField label="Valor do Seguro"       value={formatCurrency(insurance.insurance_value)} />
      <InfoField label="Cobertura"             value={insurance.cov_name} />
      <InfoField label="Forma de Pgto"         value={insurance.form_payment} />
      <InfoField label="IOF"                   value={formatCurrency(insurance.IOF_value)} />
      <InfoField label="Fator de Ajuste"       value={insurance.adjustment_factor != null ? String(insurance.adjustment_factor) : undefined} />
      <InfoField label="Franquia Dedutível"    value={formatCurrency(insurance.deductible_value)} />
      <InfoField label="Danos Corporais"       value={formatCurrency(insurance.bodily_damages)} />
      <InfoField label="Danos Morais"          value={formatCurrency(insurance.moral_damages)} />
      <InfoField label="Danos Materiais"       value={formatCurrency(insurance.property_damage)} />
      <InfoField label="Assistência 24h"       value={insurance.assist_24hrs} />
      <InfoField label="Carro Reserva"         value={insurance.backup_car} />
      <InfoField label="Vidros"                value={insurance.glasses} />
      <InfoField label="Casco"                 value={insurance.hull} />
      <InfoField label="Parabrisa"             value={insurance.windshield} />
      <InfoField label="Retrovisores"          value={insurance.rear_view} />
      <InfoField label="Acessórios"            value={insurance.accessories} />
      <InfoField label="Blindagem (seguro)"    value={insurance.shielding} />
      <InfoField label="Carroceria"            value={insurance.bodywork} />
      <InfoField label="Carroceria Veículo"    value={insurance.bodywork_vehicle} />
      <InfoField label="Equipamentos"          value={insurance.equipament} />
      <InfoField label="KM Reboque"            value={insurance.km_Trailer} />
      <InfoField label="CEP de Risco"          value={insurance.risk_cep} />
      <InfoField label="Farol Conv."           value={insurance.conventional_headlight} />
      <InfoField label="Lanterna Conv."        value={insurance.conventional_flashlight} />
      <InfoField label="Farol Aux."            value={insurance.auxiliary_headlight} />
      <InfoField label="Farol Xenon/LED"       value={insurance.xenon_led_headlight} />
      <InfoField label="Lanterna Xenon"        value={insurance.xenon_flashlight} />
      <InfoField label="Utilização"            value={insurance.util_name} />
      <InfoField label="Status Utilização"     value={insurance.status_util} />
      <InfoField label="Direcionado Por (seg)" value={insurance.directed_by} />
    </div>

    {insurance.franchise_list?.list?.length > 0 && (
      <React.Fragment>
        <div className="info-section-header" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="info-section-icon" style={{ background: '#dc2626', color: '#fff' }}>
            <i className="fa fa-list text-white"></i>
          </div>
          <span className="info-section-title">Franquias do Seguro</span>
        </div>
        <div className="info-grid">
          {insurance.franchise_list.list.map((item, i) => (
            <InfoField
              key={i}
              label={item.description || `Franquia ${i + 1}`}
              value={formatCurrency(item.value) || item.value}
            />
          ))}
        </div>
      </React.Fragment>
    )}
  </InfoSection>
);

export default SeguroSection;
