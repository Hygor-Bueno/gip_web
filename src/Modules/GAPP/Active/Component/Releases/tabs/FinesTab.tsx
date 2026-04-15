import React from "react";
import CustomForm from "../../../../../../Components/CustomForm";
import { FinesData, InfractionItem } from "../Interfaces";
import { formFines } from "./schemas/FormFines.schema";

const GRAVITY_LABELS: Record<string, string> = {
  leve:       "Leve",
  media:      "Média",
  grave:      "Grave",
  gravissima: "Gravíssima",
  outro:      "Outro",
};

interface Props {
  fines: FinesData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  infractions: InfractionItem[];
  onInfractionSelect: (inf: InfractionItem) => void;
}

const FinesTab: React.FC<Props> = ({ fines, onChange, infractions, onInfractionSelect }) => {
  const selected = infractions.find(i => String(i.infraction_id) === fines.infraction_id_fk) ?? null;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const inf = infractions.find(i => String(i.infraction_id) === e.target.value);
    if (inf) onInfractionSelect(inf);
  };

  return (
    <>
      {/* ── Infraction selector ───────────────────────────────── */}
      <div className="rel-section">
        <p className="rel-section-title">
          <i className="fa fa-triangle-exclamation" /> Selecionar Infração
        </p>

        <div className="fines-select-wrap">
          <select
            className="fines-select"
            value={fines.infraction_id_fk}
            onChange={handleSelect}
          >
            <option value="">— Selecione uma infração cadastrada —</option>
            {infractions.map(inf => (
              <option key={inf.infraction_id} value={String(inf.infraction_id)}>
                {inf.infraction}
              </option>
            ))}
          </select>
          <i className="fa fa-chevron-down fines-select-arrow" />
        </div>

        {selected && (
          <div className="fines-infraction-pills">
            <span className={`fines-gravity-pill fines-gravity-${selected.gravitity}`}>
              <i className="fa fa-gauge-high" />
              {GRAVITY_LABELS[selected.gravitity] ?? selected.gravitity}
            </span>
            <span className="fines-points-pill">
              <i className="fa fa-star" />
              {selected.points} {Number(selected.points) === 1 ? "ponto" : "pontos"}
            </span>
            <span className="fines-clear-pill" onClick={() => {
              const syntheticReset = (name: string) =>
                onChange({ target: { name, value: "" } } as React.ChangeEvent<HTMLInputElement>);
              syntheticReset("infraction_id_fk");
              syntheticReset("infraction");
              syntheticReset("points");
              syntheticReset("gravity");
            }}>
              <i className="fa fa-xmark" /> Limpar seleção
            </span>
          </div>
        )}

        {infractions.length === 0 && (
          <p className="fines-empty-hint">
            <i className="fa fa-circle-info" /> Nenhuma infração ativa encontrada. Cadastre em GAPP › Infrações.
          </p>
        )}
      </div>

      {/* ── Fine details ─────────────────────────────────────── */}
      <div className="rel-section">
        <p className="rel-section-title">
          <i className="fa fa-exclamation-triangle" /> Detalhes da Multa
        </p>
        <CustomForm
          notButton={false}
          className="row g-3"
          fieldsets={formFines(fines, onChange)}
        />
      </div>
    </>
  );
};

export default FinesTab;
