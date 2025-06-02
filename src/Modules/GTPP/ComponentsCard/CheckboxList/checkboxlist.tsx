import React, { useState } from "react";
import "./Style.css";

// Interface para as props do componente Checkbox
interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Componente individual do checkbox
const Checkbox: React.FC<CheckboxProps> = ({ label, isChecked, onChange }) => {
  return (
    <div className="checkbox-item">
      <label style={{ fontSize: "small !important" }}>
        <input
          type="checkbox"
          className="form-check-control"
          checked={isChecked}
          onChange={onChange}
        />
        {label}
      </label>
    </div>
  );
};

// Interface para os itens no estado e o tipo de captura
interface CheckboxItem {
  id: string;
  description: string;
  check: boolean;
}

// Interface para as props do componente CheckboxList
interface CheckboxListProps {
  items: CheckboxItem[];
  captureDep: (item: CheckboxItem) => void;
  getCheck?: any;
}

// Componente que renderiza a lista de checkboxes
const CheckboxList: React.FC<CheckboxListProps> = ({ items, captureDep, getCheck }) => {
  const [checkboxes, setCheckboxes] = useState<CheckboxItem[]>(items);

  const handleCheckboxChange = (index: number) => {
    const newCheckboxes = [...checkboxes];
    newCheckboxes[index].check = !newCheckboxes[index].check;
    setCheckboxes(newCheckboxes);

  };

  const checkedCount = checkboxes.filter((item) => item.check).length;

  return (
    <div className="checkbox-list">
      <div className="checkbox-counter">
        {checkedCount} checked
      </div>
      <div className="overflow-auto">
        {checkboxes.map((item, index) => (
          <Checkbox
            key={item.id}
            label={item.description}
            isChecked={item.check}
            onChange={(e) => {
              handleCheckboxChange(index);
              captureDep(item);
              getCheck(item);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CheckboxList;
