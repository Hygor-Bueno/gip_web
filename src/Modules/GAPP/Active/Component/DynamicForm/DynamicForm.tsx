import React from 'react';

export interface FieldConfig {
  label: string;
  name: string;
  col?: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'custom';
  placeholder?: string;
  options?: any[];
  optionValue?: string;
  optionLabel?: string | ((item: any) => string);
  renderCustom?: () => React.ReactNode;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  data: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ fields, data, onChange }) => {
  return (
    <div className="row g-3">
      {fields.map((field, idx) => (
        <div key={`${field.name}-${idx}`} className={field.col || 'col-md-3'}>
          {field.type !== 'custom' && (
            <label className="form-label fw-bold small">{field.label}</label>
          )}
          
          {field.type === 'select' ? (
            <select 
              className="form-select form-select-sm"
              name={field.name}
              value={data[field.name] || ''}
              onChange={onChange}
            >
              <option value="">Selecione...</option>
              {field.options?.map((item, i) => (
                <option key={i} value={item[field.optionValue || 'id']}>
                  {typeof field.optionLabel === 'function' 
                    ? field.optionLabel(item) 
                    : item[field.optionLabel || 'name']}
                </option>
              ))}
            </select>
          ) : field.type === 'custom' 
            ? 
              field.renderCustom?.() 
            : 
            <input
              type={field.type || 'text'}
              name={field.name}
              placeholder={field.placeholder}
              className="form-control form-control-sm"
              value={data[field.name] || ''}
              onChange={onChange}
            />
          }
        </div>
      ))}
    </div>
  );
};