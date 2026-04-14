import React, { useState, useCallback } from "react";
import CustomTable from "../../../../../Components/CustomTable";
import ConfirmModal from "../../../../../Components/CustomConfirm";
import { handleNotification } from "../../../../../Util/ui/notifications";
import { convertForTable } from "../../../../../Util/ui/tableUtils";
import { tItemTable } from "../../../../../types/types";
import { Movimentation } from "../../Interfaces/MovementInterfaces";
import { putMovimentation } from "../../Adapters/MovementAdapters";

interface Props {
  movimentations:    Movimentation[];
  setMovimentations: React.Dispatch<React.SetStateAction<Movimentation[]>>;
}

export default function MovementHistory({ movimentations, setMovimentations }: Props) {
  const [confirmToggle, setConfirmToggle] = useState<{
    movId:     number;
    newStatus: string;
    label:     string;
  } | null>(null);

  // ── Sort descending by date ───────────────────────────────────────────────
  const sorted = [...movimentations].sort((a, b) =>
    (b.date_movimentation ?? "").localeCompare(a.date_movimentation ?? "")
  );

  const tableList = convertForTable(sorted, {
    customTags: {
      mov_id:               "Cód.",
      active_id_fk:         "ID Ativo",
      brand:                "Marca",
      model:                "Modelo",
      unit_name:            "Unidade",
      dep_name:             "Departamento",
      type_movimentation:   "Tipo",
      date_movimentation:   "Data",
      status_movimentation: "Status",
    },
    customValue: {
      type_movimentation:   v => v === "internal" ? "Interna" : "Externa",
      status_movimentation: v => String(v) === "1" ? "Ativo" : "Inativo",
    },
    ocultColumns: [
      "sub_dep_id_fk",
      "dep_id_fk",
      "obs_movimentation",
      "sub_dep_name",
      "active_code",
      "group_id_fk",
    ],
    minWidths: {
      mov_id:               "60px",
      active_id_fk:         "80px",
      brand:                "120px",
      model:                "120px",
      unit_name:            "150px",
      dep_name:             "150px",
      type_movimentation:   "100px",
      date_movimentation:   "120px",
      status_movimentation: "80px",
    },
  });

  // ── Row confirm handler — triggers status toggle ──────────────────────────
  const handleRowConfirm = useCallback((items: tItemTable[]) => {
    if (!items.length || !items[0]?.mov_id?.value) return;
    const movId = Number(items[0].mov_id.value);
    const mov   = movimentations.find(m => m.mov_id === movId);
    const currentStatus = String(mov?.status_movimentation ?? "1");
    const newStatus     = currentStatus === "1" ? "0" : "1";
    const label         = newStatus === "1" ? "ativar" : "inativar";
    setConfirmToggle({ movId, newStatus, label });
  }, [movimentations]);

  // ── Execute the status toggle after confirmation ──────────────────────────
  const executeToggle = useCallback(async () => {
    if (!confirmToggle) return;
    const { movId, newStatus } = confirmToggle;
    setConfirmToggle(null);
    try {
      const res = await putMovimentation({ mov_id: movId, status_movimentation: newStatus });
      if (res?.error) throw new Error(res.message);
      setMovimentations(prev =>
        prev.map(m => m.mov_id === movId ? { ...m, status_movimentation: newStatus } : m)
      );
      handleNotification(
        newStatus === "1" ? "Movimentação ativada" : "Movimentação inativada",
        "Status alterado com sucesso.",
        newStatus === "1" ? "success" : "warning"
      );
    } catch (e: any) {
      handleNotification("Erro ao alterar status", e.message ?? "Tente novamente.", "danger");
    }
  }, [confirmToggle, setMovimentations]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!movimentations.length) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "3rem 1rem",
        color: "#94a3b8",
        fontSize: "0.85rem",
        flex: 1,
      }}>
        <i className="fa fa-history" style={{ fontSize: "1.8rem", color: "#cbd5e1" }} />
        <span>Nenhuma movimentação registrada</span>
        <span style={{ fontSize: "0.75rem" }}>Use a aba "Nova Movimentação" para registrar</span>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
      <CustomTable
        list={tableList}
        onConfirmList={handleRowConfirm}
        maxSelection={1}
      />

      {confirmToggle && (
        <ConfirmModal
          title={confirmToggle.label === "ativar" ? "Ativar movimentação" : "Inativar movimentação"}
          message={`Deseja realmente ${confirmToggle.label} esta movimentação? Esta ação poderá ser revertida a qualquer momento.`}
          confirmLabel={confirmToggle.label === "ativar" ? "Sim, ativar" : "Sim, inativar"}
          cancelLabel="Cancelar"
          variant={confirmToggle.label === "ativar" ? "warning" : "danger"}
          onConfirm={executeToggle}
          onClose={() => setConfirmToggle(null)}
        />
      )}
    </div>
  );
}
