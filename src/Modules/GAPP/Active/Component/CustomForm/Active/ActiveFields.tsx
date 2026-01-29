import React from 'react';
import { DynamicForm } from '../../DynamicForm/DynamicForm';
import { optional } from 'zod';
import { ConfigFormActive } from '../../../ConfigurationTable/ConfigurationForm';

export const ActiveFields: React.FC<any> = ({ units, formData, handleChange, departments }) => {
  const formConfiguration = ConfigFormActive({ initialData: formData, data: { units, departments } });

  return (
    <div className="card p-3 shadow-sm animate__animated animate__fadeIn">
      <h2>Ativos</h2>
      <hr />
      <DynamicForm 
        fields={formConfiguration} 
        data={formData} 
        onChange={handleChange} 
      />
    </div>
  );
};