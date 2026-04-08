import React from 'react';
import './ServicesBox.css';

interface IServicesBox {
    onClose:  () => void;
    onEdit:   () => void;
    onInfo?:  () => void;
    onPower?: () => void;
}

const ServicesBox = ({ onClose, onEdit, onInfo, onPower }: IServicesBox) => {
    return (
        <div className="services-overlay" onClick={onClose}>
            <div className="services-card" onClick={(e) => e.stopPropagation()}>

                <div className="services-header">
                    <div className="services-header-left">
                        <div className="services-header-icon">
                            <i className="fa fa-th-large text-white"></i>
                        </div>
                        <div>
                            <p className="services-title">Ações do Ativo</p>
                            <p className="services-subtitle">Selecione uma operação</p>
                        </div>
                    </div>
                    <button className="services-close" onClick={onClose} title="Fechar">
                        <i className="fa fa-times"></i>
                    </button>
                </div>

                <div className="services-divider" />

                <div className="services-actions">
                    <button className="services-btn services-btn--info" onClick={onInfo}>
                        <div className="services-btn-icon">
                            <i className="fa fa-info text-white"></i>
                        </div>
                        <div className="services-btn-text">
                            <span className="services-btn-label">Informações</span>
                            <span className="services-btn-desc">Visualizar detalhes do ativo</span>
                        </div>
                        <i className="fa fa-chevron-right services-btn-arrow"></i>
                    </button>

                    <button className="services-btn services-btn--edit" onClick={onEdit}>
                        <div className="services-btn-icon">
                            <i className="fa fa-edit text-white"></i>
                        </div>
                        <div className="services-btn-text">
                            <span className="services-btn-label">Editar</span>
                            <span className="services-btn-desc">Alterar dados do ativo</span>
                        </div>
                        <i className="fa fa-chevron-right services-btn-arrow"></i>
                    </button>

                    <button className="services-btn services-btn--power" onClick={onPower}>
                        <div className="services-btn-icon">
                            <i className="fa fa-money text-white"></i>
                        </div>
                        <div className="services-btn-text">
                            <span className="services-btn-label">Despesas</span>
                            <span className="services-btn-desc">Lançar e gerenciar despesas</span>
                        </div>
                        <i className="fa fa-chevron-right services-btn-arrow"></i>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ServicesBox;
