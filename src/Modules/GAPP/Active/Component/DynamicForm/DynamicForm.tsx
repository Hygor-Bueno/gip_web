import React from 'react';

export interface FieldConfig<T> {
  label: string;
  name: keyof T & string;
  col?: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'custom';
  placeholder?: string;
  options?: unknown[];
  optionValue?: string;
  optionLabel?: string | ((item: unknown) => string);
  renderCustom?: () => React.ReactNode;
}

interface DynamicFormProps<T extends Record<string, unknown>> {
  fields: FieldConfig<T>[];
  data: T;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function DynamicForm<T extends Record<string, unknown>>({
  fields,
  data,
  onChange
}: DynamicFormProps<T>) {
  return (
    <div className="row g-3">
      {fields.map(field => {
        const valueAsString = String(data[field.name] ?? '');
        const colClass = field.col || 'col-md-3';

        return (
          <div key={field.name} className={colClass}>
            {field.type !== 'custom' && (
              <label className="form-label fw-bold small">{field.label}</label>
            )}

            {field.type === 'select' && (
              <select
                className="form-select form-select-sm"
                name={field.name}
                value={valueAsString}
                onChange={onChange}
              >
                <option value="">Selecione...</option>
                {field.options?.map((item, index) => {
                  const valueKey = field.optionValue || 'id';

                  const optionValue = (item as any)[valueKey];
                  const optionLabel =
                    typeof field.optionLabel === 'function'
                      ? field.optionLabel(item)
                      : (item as any)[field.optionLabel || 'name'];

                  return (
                    <option key={index} value={optionValue}>
                      {optionLabel}
                    </option>
                  );
                })}
              </select>
            )}

            {field.type === 'custom' && field.renderCustom?.()}

            {(!field.type ||
              field.type === 'text' ||
              field.type === 'number' ||
              field.type === 'date') && (
              <input
                type={field.type || 'text'}
                name={field.name}
                placeholder={field.placeholder}
                className="form-control form-control-sm"
                value={valueAsString}
                onChange={onChange}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
