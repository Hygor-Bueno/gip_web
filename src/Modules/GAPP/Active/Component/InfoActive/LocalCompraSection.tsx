import React from 'react';
import InfoSection from './InfoSection';
import InfoField from './InfoField';
import { parsePlacePurchase } from './helpers';
import { PlaceAddress } from '../../Interfaces/Interfaces';

interface Props { placePurchase?: PlaceAddress | string | null; }

const LocalCompraSection: React.FC<Props> = ({ placePurchase }) => {
  const place = parsePlacePurchase(placePurchase);
  return (
    <InfoSection icon="fa-map-marker" color="#7c3aed" title="Local de Compra">
      <div className="info-grid">
        <InfoField label="Loja"        value={place?.store} />
        <InfoField label="Logradouro"  value={place?.public_place} />
        <InfoField label="Número"      value={place?.number} />
        <InfoField label="Bairro"      value={place?.neighborhood} />
        <InfoField label="Cidade"      value={place?.city} />
        <InfoField label="Estado"      value={place?.state} />
        <InfoField label="CEP"         value={place?.zip_code} />
        <InfoField label="Complemento" value={place?.complement} />
      </div>
    </InfoSection>
  );
};

export default LocalCompraSection;
