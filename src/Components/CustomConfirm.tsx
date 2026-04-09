import React from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "warning" | "danger";
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  confirmLabel = "Confirmar",
  cancelLabel  = "Cancelar",
  variant      = "warning",
}: ConfirmModalProps): JSX.Element {

  const isWarning = variant === "warning";

  const iconBg     = isWarning ? "#f0f7e6" : "#fef2f2";
  const iconColor  = isWarning ? "#6a9e2f" : "#dc2626";
  const iconClass  = isWarning ? "fa fa-power-off" : "fa fa-exclamation-triangle";
  const confirmBg  = isWarning ? "#6a9e2f" : "#dc2626";
  const confirmHov = isWarning ? "#5a8a27" : "#b91c1c";
  const accentBar  = isWarning ? "#bed989" : "#fca5a5";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1060,
        padding: "24px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          width: "100%",
          maxWidth: "420px",
          overflow: "hidden",
        }}
      >
        {/* accent bar */}
        <div style={{ height: "4px", background: accentBar }} />

        {/* header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "22px 24px 16px",
          borderBottom: "1.5px solid #f1f5f9",
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className={iconClass} style={{ color: iconColor, fontSize: "16px" }} />
          </div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#1a202c" }}>
            {title}
          </p>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="fa fa-times" />
          </button>
        </div>

        {/* body */}
        <div style={{ padding: "20px 24px 24px" }}>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        {/* footer */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "14px 24px 20px",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 22px",
              borderRadius: "10px",
              border: "1.5px solid #e2e8f0",
              background: "transparent",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            onMouseEnter={e => (e.currentTarget.style.background = confirmHov)}
            onMouseLeave={e => (e.currentTarget.style.background = confirmBg)}
            style={{
              padding: "9px 26px",
              borderRadius: "10px",
              border: "none",
              background: confirmBg,
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "background 0.15s",
            }}
          >
            <i className={`${iconClass} text-white`} style={{ fontSize: "12px" }} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
