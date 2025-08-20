import React from 'react';
import './Aside.css'; // Aqui você pode personalizar o estilo do seu Aside

const Aside = ({ title, content, funcAss }: { title: string, content: any, funcAss: any }) => {
  return (
    <aside className="aside-container">
      <div className='d-flex justify-content-between'>
        <div className="aside-header">
          <h3>{title}</h3>
        </div>
        <div>
          <button title="Botão aside" className='btn btn-danger fa fa-x' onClick={funcAss}></button>
        </div>
      </div>
      <div className="aside-content">
        {content}
      </div>
    </aside>
  );
};

export default Aside;
