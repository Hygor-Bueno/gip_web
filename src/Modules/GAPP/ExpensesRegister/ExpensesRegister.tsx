import React, { useState, useEffect, useRef } from "react";
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
import EditExpenses from "./EditExpenses/EditExpenses";
import FilterPanelExpenses from "./FilterPanel/FilterPanelExpenses";

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

  const [activeTab,      setActiveTab]      = useState<"despesas" | "nf">("despesas");
  const [page,           setPage]           = useState<number>(1);
  const [editExpenses,   setEditExpenses]   = useState<IExpensesItem | null>(null);
  const [showFilters,    setShowFilters]    = useState<boolean>(false);
  const [showNav,        setShowNav]        = useState<boolean>(true);
  const [urlComplement,  setUrlComplement]  = useState<string>("");
  const [rawData,        setRawData]        = useState<IExpensesItem[]>([]);
  const [data,           setData]           = useState<IExpensesItem[]>([]);
  const [formData,       setFormData]       = useState<IFormExpenses>(restartForm);
  const [units,          setUnits]          = useState<{ label: string; value: string }[]>([]);
  const [expensesType,   setExpensesType]   = useState<{ label: string; value: string }[]>([]);

  const activeFilterCount = Object.values(formData).filter((v) => v).length;

  const filterBtnRef = useRef<HTMLButtonElement>(null);

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
    setRawData(req.data);
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

  function handleConfirmRow(rows: tItemTable[]) {
    if (!rows.length) return;
    const id = String(rows[0].expen_id?.value ?? "");
    if (!id) return;
    const raw = rawData.find((r) => String(r.expen_id) === id) ?? null;
    if (raw) setEditExpenses(raw);
  }

  function handleApplyFilters() {
    handleUrl();
    setShowFilters(false);
  }

  function handleClearFilters() {
    handleClear();
    setUrlComplement("&dashGAPP=1&page_number=1");
  }

  function handleSaved() {
    setEditExpenses(null);
    loadExpenses();
  }

  function handleDeleted(id: number) {
    setEditExpenses(null);
    setRawData((prev) => prev.filter((r) => String(r.expen_id) !== String(id)));
    setData((prev)    => prev.filter((r) => String(r.expen_id) !== String(id)));
  }

  return (
    <React.Fragment>
      <div className={`expenses-navbar-wrap${showNav ? "" : " expenses-navbar-wrap--hidden"}`}>
        <NavBar list={listPathGAPP} />
      </div>
    <div className="expenses-page">

      {/* ── Edit modal ──────────────────────────────────────── */}
      {editExpenses && (
        <EditExpenses
          item={editExpenses}
          units={units}
          expensesType={expensesType}
          onClose={() => setEditExpenses(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="expenses-toolbar-row">
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

        <div className="expenses-toolbar-actions">
          {/* Mobile-only: hide/show NavBar */}
          <button
            className="expenses-mobile-nav-toggle"
            type="button"
            onClick={() => setShowNav((o) => !o)}
            title={showNav ? "Esconder menu" : "Mostrar menu"}
          >
            <i className={`fa ${showNav ? "fa-eye-slash" : "fa-bars"}`} />
          </button>

          {/* ── Filters trigger button (same style as GAPP/Active) ─ */}
          {activeTab === "despesas" && (
            <div className="expenses-filters-trigger">
              <button
                ref={filterBtnRef}
                className={`btn-filter-toggle${showFilters || activeFilterCount > 0 ? " active" : ""}`}
                type="button"
                onClick={() => setShowFilters((o) => !o)}
                title="Filtros"
              >
                <i className="fa fa-filter" /> <span className="expenses-btn-label">Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="fp-toggle-badge">{activeFilterCount}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating filter panel (extracted component) ─────── */}
      <FilterPanelExpenses
        open={showFilters}
        formData={formData}
        onChange={handleChange}
        onPlateChange={(v) => setFormData((prev) => ({ ...prev, license_plates: v }))}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setShowFilters(false)}
        resultCount={data.length}
        activeFilterCount={activeFilterCount}
        units={units}
        expensesType={expensesType}
        anchorRef={filterBtnRef as React.RefObject<HTMLElement>}
      />

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

      {/* ── Despesas tab ────────────────────────────────────── */}
      {activeTab === "despesas" && (
        <React.Fragment>

          {/* Hint */}
          <p className="expenses-hint">
            <i className="fa fa-circle-info text-primary" /> Selecione uma linha e clique em Confirmar Seleção para editar ou excluir a despesa.
          </p>

          {/* Table card */}
          <div className="expenses-card expenses-card-table">
            {data.length > 0 ? (
              <>
                <div className="expenses-table-scroll">
                  <CustomTable
                    maxSelection={1}
                    list={convertForTable(data, {
                      ocultColumns: ["exp_type_id_fk", "vehicle_id", "unit_id"],
                      customTags: customTagsExpense,
                      minWidths: minWidthsExpense,
                    })}
                    onConfirmList={handleConfirmRow}
                    hiddenButton={false}
                  />
                </div>



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

        </React.Fragment>
      )}

    </div>
    </React.Fragment>
  );
}
