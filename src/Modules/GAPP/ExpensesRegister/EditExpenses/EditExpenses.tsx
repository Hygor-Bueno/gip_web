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

export default EditExpenses;