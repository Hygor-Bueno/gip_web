import React from 'react';
import { DynamicForm } from '../../DynamicForm/DynamicForm';
import AddItemsFields from './AddItem/AddItem';
import { ConfigFormActive } from '../../../ConfigurationTable/ConfigurationForm';

export const ActiveFields: React.FC<any> = ({
  units,
  departments,
  formData,
  handleChange,
  listItems,
  setListItems
}) => {
  const formConfiguration = ConfigFormActive({
    initialData: formData,
    data: { units, departments }
  });

  return (
    <div className="card p-3 shadow-sm">
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
