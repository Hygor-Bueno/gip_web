import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmModal({  title, message, onConfirm, onClose }: {   title: string, message: string, onConfirm: () => void, onClose: () => void }) : JSX.Element {
    return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1050,
            padding: "1rem", // Adiciona espaço para telas pequenas
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              width: "100%", // Para ocupar toda a largura no mobile
              maxWidth: "30rem", // Limita no desktop
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem",
                borderBottom: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h5 style={{ margin: 0, fontSize: "1.25rem" }}>{title}</h5>
              <button
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
    
            {/* Body */}
            <div style={{ padding: "1rem", fontSize: "1rem" }}>
              <p style={{ margin: 0 }}>{message}</p>
            </div>
    
            {/* Footer */}
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button title="Cancelar ação." className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button title="Confirmar ação" className="btn btn-primary" onClick={onConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      );

};