import { useState } from 'react';

const AddItemsFields = ({ listItems, setListItems }: any) => {
  const [item, setItem] = useState('');

  function handleAddItem(e: any) {
    e.preventDefault();

    if (!item.trim()) return;

    setListItems((prev: string[]) => [...prev, item]);
    setItem('');
  }

  function handleRemoveItem(index: number) {
    setListItems((prev: string[]) =>
      prev.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="pt-3">
      <h5>Itens Adicionais</h5>
      <hr />
      <div className="d-flex gap-2">
        <input
          className="form-control form-control-sm"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <button className="btn btn-color-gipp" onClick={handleAddItem}>+</button>
      </div>

      <ul className="list-unstyled mt-2">
        {listItems.map((item: string, index: number) => (
          <li key={index} className="d-flex justify-content-between align-items-center mb-1"> 
            {item} 
            <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(index)}>🗑</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddItemsFields;
