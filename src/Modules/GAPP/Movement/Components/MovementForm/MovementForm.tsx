import React from "react";
import ConfirmModal from "../../../../../Components/CustomConfirm";
import { Unit } from "../../../Active/Interfaces/OrgInterfaces";
import { ActiveForMovement } from "../../Interfaces/MovementInterfaces";
import { useMovementForm } from "./useMovementForm";
import PhaseOne from "./PhaseOne";
import PhaseTwoFormData from "./PhaseTwoFormData";
import "./MovementForm.css";

interface Props {
  actives:   ActiveForMovement[];
  units:     Unit[];
  onSuccess: () => void;
}

export default function MovementForm({ actives, units, onSuccess }: Props) {
  const mv = useMovementForm(actives, onSuccess);

  return (
    <div className="mvform-root">

      {mv.phase === 0 && (
        <PhaseOne
          form={mv.form}                         setForm={mv.setForm}
          filteredActives={mv.filteredActives}   activeFilterCount={mv.activeFilterCount}
          filterOpen={mv.filterOpen}             setFilterOpen={mv.setFilterOpen}
          filterBtnRef={mv.filterBtnRef}         filterPanelRef={mv.filterPanelRef}
          search={mv.search}                     setSearch={mv.setSearch}
          plateInput={mv.plateInput}             setPlateInput={mv.setPlateInput}
          handleClearFilters={mv.handleClearFilters}
          selectedActives={mv.selectedActives}   toggleActive={mv.toggleActive}
          handleAdvance={mv.handleAdvance}
        />
      )}

      {mv.phase === 1 && (
        <PhaseTwoFormData
          form={mv.form}                         setForm={mv.setForm}
          selectedActives={mv.selectedActives}   toggleActive={mv.toggleActive}
          setPhase={mv.setPhase}
          units={units}
          departments={mv.departments}           subdepartaments={mv.subdepartaments}
          loadingDepts={mv.loadingDepts}         loadingSubDepts={mv.loadingSubDepts}
          submitting={mv.submitting}
          handleUnitChange={mv.handleUnitChange} handleDepChange={mv.handleDepChange}
          handleSubmit={mv.handleSubmit}         setConfirmCancel={mv.setConfirmCancel}
        />
      )}

      {mv.confirmCancel && (
        <ConfirmModal
          title="Cancelar movimentação"
          message="Deseja cancelar a movimentação em andamento? Todos os dados preenchidos serão perdidos."
          confirmLabel="Sim, cancelar"
          cancelLabel="Continuar editando"
          variant="danger"
          onConfirm={mv.handleReset}
          onClose={() => mv.setConfirmCancel(false)}
        />
      )}

    </div>
  );
}
