import React from "react";
import ProgressBar from "../../../GTPP/ComponentsCard/Modal/Progressbar";
require("./style.css");

// ==========================
// Interfaces
// ==========================
interface OutsideValues {
  titleCard?: { title?: string };
  subTitle?: { titleSecondary?: string; titleTertiary?: string };
  productCard?: { valueOne?: number | string; valueTwo?: number | string; valueThree?: number | string };
  meta?: string;
  icon?: string;
  color?: string;
}

interface CardProps {
  outsideValues: OutsideValues;
}

// ==========================
// Componente Principal
// ==========================
export function Card({ outsideValues }: CardProps) {
  const { titleCard, subTitle, productCard, meta, icon = "warehouse", color = "primary" } = outsideValues;

  return (
    <ContainerCard titleCard={titleCard} icon={icon} color={color}>
      {!meta ? (
        <CardWithValues subTitle={subTitle} productCard={productCard || {}} />
      ) : (
        <ProgressBar
          secondaryClassName="w-100 progressCard"
          colorBar="#198754"
          progressValue={Number(meta) || 0}
        />
      )}
    </ContainerCard>
  );
}

// ==========================
// Subcomponente: ContainerCard
// ==========================
interface ContainerCardProps {
  children?: React.ReactNode;
  titleCard?: { title?: string };
  icon?: string;
  color?: string;
}

function ContainerCard({ children, titleCard, icon, color }: ContainerCardProps) {
  return (
    <div className="col-md-4 col-12">
      <div className={`card-summary bg-${color} text-white p-3 d-flex flex-column justify-content-between align-items-center`} style={{ height: "100%" }}>
        <div>
          <TitleCard titleCard={titleCard} icon={icon} />
        </div>
        <div className="w-100">
          {children}
        </div>
        <div></div>
      </div>
    </div>
  );
}

// ==========================
// Subcomponente: CardWithValues
// ==========================
interface CardWithValuesProps {
  subTitle?: { titleSecondary?: string; titleTertiary?: string };
  productCard: { valueOne?: number | string; valueTwo?: number | string; valueThree?: number | string };
}

function CardWithValues({ subTitle, productCard }: CardWithValuesProps) {
  return (
    <React.Fragment>
      <div className="d-flex justify-content-between border-bottom pb-2 mb-2 w-100">
        <span>{subTitle?.titleSecondary || "Vazio"}</span>
        <strong>{productCard?.valueOne ?? 0}</strong>
      </div>
      <div className="d-flex justify-content-between border-bottom pb-2 mb-2 w-100">
        <span>{subTitle?.titleTertiary || "Vazio"}</span>
        <strong>{productCard?.valueTwo ?? 0}</strong>
      </div>
      <div className="d-flex justify-content-between w-100">
        <span>Total</span>
        <strong>{productCard?.valueThree ?? 0}</strong>
      </div>
    </React.Fragment>
  );
}

// ==========================
// Subcomponente: TitleCard
// ==========================
interface TitleCardProps {
  titleCard?: { title?: string };
  icon?: string;
}

function TitleCard({ titleCard, icon }: TitleCardProps) {
  return (
    <React.Fragment>
      <div className="summary-icon mb-2">
        <i className={`fa fa-${icon} fa-2x`}></i>
      </div>
      <h5 className="fw-bold">{titleCard?.title || "Sem título"}</h5>
    </React.Fragment>
  );
}
