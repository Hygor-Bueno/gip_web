import React from 'react';

const MinimalFilterModel = ({children}: {children: React.ReactNode}) => {
    return (
        <React.Fragment>
            <div style={{
                background: '#fff',
                padding: '1rem',
                borderRadius: '1rem',
                position: 'absolute',
                zIndex: '1',
                fontSize: '12px',
                border: '1px solid #d7d7d7',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',  // Sombras suaves
                transition: 'box-shadow 0.3s ease', // Suaviza a transição da sombra
            }}>
                {children}
            </div>
        </React.Fragment>
    );
}

export default MinimalFilterModel;