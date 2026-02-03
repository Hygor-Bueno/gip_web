import React, { useMemo } from 'react';
import { DynamicForm } from '../../DynamicForm/DynamicForm';
import AddItemsFields from './AddItem/AddItem';
import { ConfigFormActive } from '../../../ConfigurationTable/ConfigurationForm';
import { ActiveFieldsProps } from '../../../Interfaces/Interfaces';

export const ActiveFields: React.FC<ActiveFieldsProps> = ({
  units,
  departments,
  activeType,
  company,
  formData,
  handleChange,
  listItems,
  setListItems
}) => {
  const formConfiguration = useMemo(() => {
    return ConfigFormActive({
      initialData: formData,
      data: { units, departments, company, activeType }
    });
  }, [formData, units, departments, company, activeType]);

  return (
    <div className="card p-3 shadow-sm animate__animated animate__fadeInUp">
      <h2>Ativos</h2>
      <hr />

      <DynamicForm
        fields={formConfiguration}
        data={formData}
        onChange={handleChange}
      />

      <AddItemsFields
        listItems={listItems}
        setListItems={setListItems}
      />
    </div>
  );
};
