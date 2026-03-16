import React, { useState } from 'react';
import './Hamburger.css';
import Modalcard from '../modalCard/modalcard';

interface HamburgerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    // Você pode adicionar props customizadas aqui se precisar
}

const Hamburger: React.FC<HamburgerProps> = ({ className, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(prev => !prev);

    return (
        <div className="position-relative">
            <button 
                type="button"
                className={`hamburger ${isOpen ? 'active' : ''} ${className || ''}`} 
                onClick={toggleMenu}
                aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isOpen}
                {...props}
            >
                <div className="line" aria-hidden="true"></div>
                <div className="line" aria-hidden="true"></div>
                <div className="line" aria-hidden="true"></div>
            </button>

            {/* Renderização Condicional com posicionamento flexível */}
            {isOpen && (
                <div className='position-absolute' style={{ zIndex: 200, top: '100%', marginTop: '15px' }}>
                    <Modalcard />
                </div>
            )}
        </div>
    );
};

export default Hamburger;