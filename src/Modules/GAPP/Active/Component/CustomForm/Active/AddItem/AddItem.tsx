import { useState } from 'react';

interface AddItemsFieldsProps {
  listItems: string[];
  setListItems: React.Dispatch<React.SetStateAction<string[]>>;
}

const AddItemsFields: React.FC<AddItemsFieldsProps> = ({
  listItems,
  setListItems
}) => {
  const [item, setItem] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item.trim()) return;

    setListItems(prev => [...prev, item]);
    setItem('');
  };

  const handleRemoveItem = (index: number) => {
    setListItems(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-3">
      <h5>Itens Adicionais</h5>
      <hr />
      <div className="d-flex gap-2">
        <input
          className="form-control form-control-sm"
          value={item}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setItem(e.target.value)
          }
        />
        <button className="btn btn-color-gipp" onClick={handleAddItem}>
          <i className='fa fa-solid fa-plus text-white'></i>
        </button>
      </div>

      <ul className="list-unstyled mt-2">
        {listItems.map((currentItem, index) => (
          <li
            key={index}
            className="d-flex justify-content-between align-items-center mb-1"
          >
            <b className='px-1'>{currentItem}</b>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleRemoveItem(index)}
            >
              <i className='fa fa-solid fa-trash text-white'></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddItemsFields;
