import React from 'react';
import './InfoActive.css';
import { ActiveTableData } from '../../Interfaces/Interfaces';
import { useInfoActivePDF } from './useInfoActivePDF';
import IdentificacaoSection   from './IdentificacaoSection';
import LocalizacaoSection     from './LocalizacaoSection';
import LocalCompraSection     from './LocalCompraSection';
import VeiculoSection         from './VeiculoSection';
import SeguroSection          from './SeguroSection';
import ItensAdicionaisSection from './ItensAdicionaisSection';

interface InfoActiveProps {
  data: ActiveTableData;
  onClose: () => void;
  onBack: () => void;
}

const InfoActive: React.FC<InfoActiveProps> = ({ data, onBack }) => {
  const { handleDownloadPDF } = useInfoActivePDF(data);

  const active    = data.active as any;
  const vehicle   = data.vehicle;
  const insurance = data.insurance;
  
  const hasVehicle   = vehicle   && Object.keys(vehicle).length > 0;
  const hasInsurance = insurance && !!insurance.id_insurance;
  const hasItems     = active?.list_items?.list?.length > 0;

  return (
    <div className="info-overlay" onClick={onBack}>
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div className="info-modal-header-icon">
            <i className="fa fa-file-text text-white"></i>
          </div>
          <div>
            <p className="info-modal-title">{active?.brand} {active?.model}</p>
            <p className="info-modal-subtitle">Visualização completa do ativo</p>
          </div>
          <button className="info-modal-close" onClick={onBack} title="Fechar">
            <i className="fa fa-times"></i>
          </button>
        </div>
        <div className="info-modal-body">
          <IdentificacaoSection active={active} />
          <LocalizacaoSection   active={active} />
          <LocalCompraSection   placePurchase={active?.place_purchase} />
          {hasVehicle   && <VeiculoSection         vehicle={vehicle!} />}
          {hasInsurance && <SeguroSection           insurance={insurance!} />}
          {hasItems     && <ItensAdicionaisSection  items={active.list_items.list} />}
        </div>

        <div className="info-modal-footer">
          <button className="btn-info-close" onClick={onBack}>
            <i className="fa fa-arrow-left"></i> Voltar
          </button>
          <button className="btn-info-download" onClick={handleDownloadPDF}>
            <i className="fa fa-download text-white"></i> Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoActive;
