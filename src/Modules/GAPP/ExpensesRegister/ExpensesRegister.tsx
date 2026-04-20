import React, { useState, useEffect } from "react";
import CustomTable from "../../../Components/CustomTable";
import NavBar from "../../../Components/NavBar";
import { convertDate, convertForTable, maskMoney, sortListByKey } from "../../../Util/Utils";
import { useConnection } from "../../../Context/ConnContext";
import { customTagsExpense, minWidthsExpense } from "./Configuration/ConfigExpensesRegister";
import { IExpensesItem } from "./Interfaces/InterfaceExpensesRegister";
import { useMyContext } from "../../../Context/MainContext";
import { tItemTable } from "../../../types/types";
import { listPathGAPP } from "../ConfigGapp";
import NotaFiscal from "./NF/NotaFiscal";
import "./ExpensesRegister.css";

interface IFormExpenses {
  date_start: string;
  date_end: string;
  license_plates: string;
  unit_id: string;
  exp_type_id_fk: string;
}

interface IUnitItem        { fantasy_name: string; unit_name: string; unit_id: string }
interface IExpenseTypeItem { description_type: string; exp_type_id: string }

const restartForm: IFormExpenses = {
  date_end: "", date_start: "", license_plates: "", unit_id: "", exp_type_id_fk: "",
};

export default function ExpensesRegister(): JSX.Element {
  const { fetchData } = useConnection();
  const { setLoading } = useMyContext();

  const [activeTab, setActiveTab] = useState<"despesas" | "nf">("despesas");
  const [page,         setPage]         = useState<number>(1);
  const [editExpenses, setEditExpenses] = useState<number>(0);
  const [urlComplement,setUrlComplement]= useState<string>("");
  const [data,         setData]         = useState<IExpensesItem[]>([]);
  const [formData,     setFormData]     = useState<IFormExpenses>(restartForm);
  const [units,        setUnits]        = useState<{ label: string; value: string }[]>([]);
  const [expensesType, setExpensesType] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadUnits();
        await loadExpensesType();
        handleUrl();
      } catch (error) {
        throw new Error("Erro ao carregar os dados " + error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await loadExpenses();
      } catch (error: unknown) {
        throw new Error("Erro ao carregar os dados " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setLoading(false);
      }
    })();
  }, [urlComplement]);

  async function loadExpenses() {
    const req = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/FiltredExpenses.php", urlComplement: urlComplement || "" });
    if (req.error && req.message?.toUpperCase().includes("NO DATA") && page > 1) handleUrl(page - 1);
    if (req.error) throw new Error(req.message);
    setData(req.data.map((item: IExpensesItem) => maskExpenses(item)));
  }

  async function loadUnits() {
    const req = await fetchData({ method: "GET", params: null, pathFile: "GAPP/Units.php", urlComplement: "&all=1" });
    if (req.error) throw new Error(req.message);
    setUnits(sortListByKey(req.data.map((i: IUnitItem) => ({ label: `${i.fantasy_name} - ${i.unit_name}`, value: i.unit_id })), "label"));
  }

  async function loadExpensesType() {
    const req = await fetchData({ method: "GET", params: null, pathFile: "GAPP_V2/ExpensesType.php", urlComplement: "&dashGAPP=1" });
    if (req.error) throw new Error(req.message);
    setExpensesType(sortListByKey(req.data.map((i: IExpenseTypeItem) => ({ label: i.description_type, value: i.exp_type_id })), "label"));
  }

  function maskExpenses(item: IExpensesItem): IExpensesItem {
    return {
      ...item,
      date:        convertDate(item.date, true),
      discount:    maskMoney(item.discount),
      total_value: maskMoney(item.total_value),
    };
  }

  function changePage(isNext: boolean) {
    const next = isNext ? page + 1 : page - 1;
    if (next > 0) handleUrl(next);
  }

  function handleUrl(newPage: number = 1) {
    setPage(newPage);
    let result = `&dashGAPP=1&page_number=${newPage}`;
    Object.keys(formData).forEach((key) => {
      const val = formData[key as keyof IFormExpenses];
      if (val) result += `&${key}=${val}`;
    });
    setUrlComplement(result);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleClear() {
    setFormData(restartForm);
    setPage(1);
  }

  return (
    <React.Fragment>
      <NavBar list={listPathGAPP} />
    <div className="expenses-page">

      {/* ── Edit modal ──────────────────────────────────────── */}
      {editExpenses > 0 && (
        <EditExpenses expen_id={editExpenses} onClose={() => setEditExpenses(0)} />
      )}

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="expenses-toolbar">
        <div className="expenses-toolbar-title">
          <div className="expenses-toolbar-title-icon">
            <i className="fa fa-receipt" />
          </div>
          <div>
            <p className="expenses-toolbar-title-text">Relatório de Despesas</p>
            <p className="expenses-toolbar-title-sub">Consulta e filtros de lançamentos</p>
          </div>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div className="expenses-tabs">
        <button
          className={`expenses-tab${activeTab === "despesas" ? " expenses-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("despesas")}
        >
          <i className="fa fa-table-list" /> Despesas
        </button>
        <button
          className={`expenses-tab${activeTab === "nf" ? " expenses-tab--active" : ""}`}
          type="button"
          onClick={() => setActiveTab("nf")}
        >
          <i className="fa fa-file-invoice" /> Nota Fiscal
        </button>
      </div>

      {/* ── NF tab ──────────────────────────────────────────── */}
      {activeTab === "nf" && <NotaFiscal />}

      {/* ── Filter card ─────────────────────────────────────── */}
      {activeTab === "despesas" && <React.Fragment>
      <div className="expenses-card">
        <p className="expenses-card-title">
          <i className="fa fa-filter" /> Filtros
        </p>

        <div className="expenses-filters">

          {/* Data inicial */}
          <div className="expenses-field">
            <label className="expenses-label">Data Inicial</label>
            <input className="expenses-input" type="date" name="date_start" value={formData.date_start} onChange={handleChange} />
          </div>

          {/* Data final */}
          <div className="expenses-field">
            <label className="expenses-label">Data Final</label>
            <input className="expenses-input" type="date" name="date_end" value={formData.date_end} onChange={handleChange} />
          </div>

          {/* Placa */}
          <div className="expenses-field">
            <label className="expenses-label">Placa</label>
            <input className="expenses-input" type="text" name="license_plates" placeholder="ABC1D23" value={formData.license_plates} onChange={handleChange} />
          </div>

          {/* Unidade */}
          <div className="expenses-field">
            <label className="expenses-label">Unidade</label>
            <div className="expenses-select-wrap">
              <select className="expenses-select" name="unit_id" value={formData.unit_id} onChange={handleChange}>
                <option value="">Todas</option>
                {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tipo de despesa */}
          <div className="expenses-field">
            <label className="expenses-label">Tipo de Despesa</label>
            <div className="expenses-select-wrap">
              <select className="expenses-select" name="exp_type_id_fk" value={formData.exp_type_id_fk} onChange={handleChange}>
                <option value="">Todos</option>
                {expensesType.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="expenses-filter-actions">
            <button className="expenses-btn-search" type="button" onClick={() => handleUrl()}>
              <i className="fa fa-magnifying-glass" /> Buscar
            </button>
            <button className="expenses-btn-clear" type="button" onClick={handleClear}>
              <i className="fa fa-eraser" /> Limpar
            </button>
          </div>

        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────── */}
      <div className="expenses-card expenses-card-table">
        <p className="expenses-card-title">
          <i className="fa fa-table-list" /> Resultados
        </p>

        {data.length > 0 ? (
          <>
            <CustomTable
              maxSelection={1}
              list={convertForTable(data, {
                ocultColumns: ["exp_type_id_fk", "vehicle_id", "unit_id"],
                customTags: customTagsExpense,
                minWidths: minWidthsExpense,
              })}
              onConfirmList={(rows: tItemTable[]) => setEditExpenses(Number(rows[0].expen_id.value))}
            />

            {/* Pagination */}
            <div className="expenses-pagination">
              <button
                className="expenses-page-btn"
                type="button"
                onClick={() => changePage(false)}
                disabled={page <= 1}
                title="Página anterior"
              >
                <i className="fa fa-chevron-left" />
              </button>
              <span className="expenses-page-indicator">{String(page).padStart(2, "0")}</span>
              <button
                className="expenses-page-btn"
                type="button"
                onClick={() => changePage(true)}
                title="Próxima página"
              >
                <i className="fa fa-chevron-right" />
              </button>
            </div>
          </>
        ) : (
          <div className="expenses-empty">
            <i className="fa fa-receipt" />
            <strong>Nenhuma despesa encontrada</strong>
            <span>Ajuste os filtros e clique em Buscar.</span>
          </div>
        )}
      </div>

      </React.Fragment>}

    </div>
    </React.Fragment>
  );
}

/* ── Edit Expenses modal ────────────────────────────────────── */
interface IEditExpenses { expen_id: number; onClose: () => void }

function EditExpenses({ expen_id, onClose }: IEditExpenses): JSX.Element {
  return (
    <div className="expenses-modal-overlay" onClick={onClose}>
      <div className="expenses-modal" onClick={(e) => e.stopPropagation()}>

        <div className="expenses-modal-header">
          <div className="expenses-modal-icon">
            <i className="fa fa-file-invoice-dollar text-white" />
          </div>
          <p className="expenses-modal-title">Detalhes da Despesa</p>
          <button className="expenses-modal-close" onClick={onClose} title="Fechar">
            <i className="fa fa-xmark" />
          </button>
        </div>

        <div className="expenses-modal-body">
          <p className="expenses-modal-id">Código do lançamento</p>
          <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>#{expen_id}</strong>
        </div>

        <div className="expenses-modal-footer">
          <button className="expenses-modal-btn-close" onClick={onClose}>Fechar</button>
        </div>

      </div>
    </div>
  );
}
