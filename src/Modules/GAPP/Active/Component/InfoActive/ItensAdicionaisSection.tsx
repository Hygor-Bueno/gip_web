import React from 'react';
import InfoSection from './InfoSection';

interface Props { items: string[]; }

const ItensAdicionaisSection: React.FC<Props> = ({ items }) => (
  <InfoSection icon="fa-list" color="#ea580c" title="Itens Adicionais">
    <div className="info-tags">
      {items.map((item, i) => (
        <span className="info-tag" key={i}>{item}</span>
      ))}
    </div>
  </InfoSection>
);

export default ItensAdicionaisSection;
