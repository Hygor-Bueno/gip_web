import React from 'react';

type CaptureValueArray = Array<
  [
    React.InputHTMLAttributes<HTMLInputElement>,
    React.SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[], type: string[] } | any,
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
  ]
> | {
  labelText: string;
};

type CaptureValueTuple = [
  React.InputHTMLAttributes<HTMLInputElement>,
  React.SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[], type: string[] },
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
];

export type CustomFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  classRender?: string;
  notButton?: boolean;
  typeButton?: 'submit' | 'reset' | 'button' | undefined;
  fieldsets: {
    attributes?: React.FieldsetHTMLAttributes<HTMLFieldSetElement>;
    item: {
      label: string;
      classLabel?: string;
      mandatory?: boolean;
      captureValue:
      | React.InputHTMLAttributes<HTMLInputElement>
      | (React.SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[], type: string })
      | React.TextareaHTMLAttributes<HTMLTextAreaElement>
      | CaptureValueArray
      | CaptureValueTuple;
    };
    legend?: {
      style?: string;
      text?: string;
    };
    buttons?: [];
  }[] | any;
  onAction?: (e?: any) => void;
  titleButton?: string;
  classButton?: string;
};

export interface SelectOption {
  value: string | number;
  label: string;
}

const formStyles = `
  .cf-fieldset {
    border: none;
    padding: 0;
    margin: 0 0 18px 0;
  }

  .cf-legend {
    font-size: 11px;
    font-weight: 700;
    color: #bed989;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 2px solid #f1f3f8;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .cf-legend::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 14px;
    background: #bed989;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .cf-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    display: block;
  }

  .cf-mandatory {
    color: #ef4444;
    margin-left: 2px;
  }

  .cf-input,
  .cf-select,
  .cf-textarea {
    width: 100%;
    padding: 10px 14px;
    font-size: 13.5px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    color: #1a202c;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
  }

  .cf-input:focus,
  .cf-select:focus,
  .cf-textarea:focus {
    border-color: #bed989;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(190,217,137,0.2);
  }

  .cf-input::placeholder,
  .cf-textarea::placeholder {
    color: #b0bac7;
  }

  .cf-input:disabled,
  .cf-select:disabled,
  .cf-textarea:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .cf-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }

  .cf-textarea {
    resize: vertical;
    min-height: 90px;
    line-height: 1.6;
  }

  /* ── Botões ── */
  .cf-btn-wrap {
    padding-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* Base */
  .cf-btn {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 10px 22px;
    border: 1.5px solid transparent;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s, background 0.15s, border-color 0.15s;
    white-space: nowrap;
    line-height: 1;
    letter-spacing: 0.1px;
    text-decoration: none;
    user-select: none;
  }

  /* Ripple */
  .cf-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
    border-radius: inherit;
  }
  .cf-btn:active::after {
    background: rgba(255,255,255,0.18);
  }

  .cf-btn:active { transform: translateY(0) scale(0.98) !important; }

  /* Tamanhos */
  .cf-btn-sm {
    padding: 7px 14px;
    font-size: 12px;
    border-radius: 8px;
    gap: 5px;
  }

  .cf-btn-lg {
    padding: 13px 30px;
    font-size: 15px;
    border-radius: 12px;
    gap: 9px;
  }

  /* ── Variantes sólidas ── */
  .cf-btn-primary {
    background: #bed989;
    border-color: #bed989;
    color: #fff;
    box-shadow: 0 1px 3px rgba(190,217,137,0.3);
  }
  .cf-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(190,217,137,0.5);
    filter: brightness(1.06);
  }

  .cf-btn-secondary {
    background: #f1f5f9;
    border-color: #e2e8f0;
    color: #475569;
  }
  .cf-btn-secondary:hover {
    transform: translateY(-1px);
    background: #e4eaf2;
    border-color: #cbd5e1;
    box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  }

  .cf-btn-danger {
    background: #ef4444;
    border-color: #ef4444;
    color: #fff;
    box-shadow: 0 1px 3px rgba(239,68,68,0.25);
  }
  .cf-btn-danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(239,68,68,0.4);
    filter: brightness(1.06);
  }

  .cf-btn-dark {
    background: #1a202c;
    border-color: #1a202c;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .cf-btn-dark:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(0,0,0,0.25);
    filter: brightness(1.12);
  }

  /* ── Variantes outline ── */
  .cf-btn-outline-primary {
    background: transparent;
    border-color: #bed989;
    color: #6a9e2f;
  }
  .cf-btn-outline-primary:hover {
    transform: translateY(-1px);
    background: #f0f7e6;
    box-shadow: 0 3px 10px rgba(190,217,137,0.25);
  }

  .cf-btn-outline-secondary {
    background: transparent;
    border-color: #cbd5e1;
    color: #475569;
  }
  .cf-btn-outline-secondary:hover {
    transform: translateY(-1px);
    background: #f1f5f9;
    box-shadow: 0 3px 10px rgba(0,0,0,0.07);
  }

  .cf-btn-outline-danger {
    background: transparent;
    border-color: #ef4444;
    color: #ef4444;
  }
  .cf-btn-outline-danger:hover {
    transform: translateY(-1px);
    background: #fee2e2;
    box-shadow: 0 3px 10px rgba(239,68,68,0.15);
  }

  /* ── Ghost (só texto + ícone) ── */
  .cf-btn-ghost {
    background: transparent;
    border-color: transparent;
    color: #6a9e2f;
    padding-left: 6px;
    padding-right: 6px;
  }
  .cf-btn-ghost:hover {
    background: #f0f7e6;
    transform: translateY(-1px);
  }

  /* ── Icon-only ── */
  .cf-btn-icon {
    padding: 9px;
    border-radius: 9px;
    gap: 0;
  }
  .cf-btn-icon.cf-btn-sm { padding: 6px; border-radius: 7px; }
  .cf-btn-icon.cf-btn-lg { padding: 12px; border-radius: 11px; }

  /* ── Loading ── */
  .cf-btn-loading {
    pointer-events: none;
    opacity: 0.75;
  }
  .cf-btn-loading .cf-btn-spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: cf-spin 0.6s linear infinite;
    flex-shrink: 0;
  }
  .cf-btn-loading .cf-btn-spinner-dark {
    border-color: rgba(0,0,0,0.15);
    border-top-color: #475569;
  }
  @keyframes cf-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Disabled ── */
  .cf-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    filter: none !important;
  }
  .cf-btn:disabled::after { display: none; }

  /* ── Checkbox row ── */
  .cf-checkbox-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1.5px solid #e8eaf0;
    background: #f8fafc;
    transition: border-color 0.15s, background 0.15s;
    margin-bottom: 6px;
  }

  .cf-checkbox-row:hover {
    border-color: #bed989;
    background: #fafffe;
  }

  .cf-order-btn {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f0f7e6;
    border: 1.5px solid #bed989;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    color: #6a9e2f;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }

  .cf-order-btn:hover {
    background: #bed989;
    color: #fff;
  }

  .cf-checkbox-label {
    font-size: 13.5px;
    color: #374151;
    flex: 1;
    cursor: pointer;
  }

  /* Custom checkbox visual */
  .cf-check-wrap {
    position: relative;
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .cf-check-input {
    position: absolute;
    opacity: 0;
    width: 18px;
    height: 18px;
    margin: 0;
    cursor: pointer;
    z-index: 1;
  }

  .cf-check-box {
    width: 18px;
    height: 18px;
    border: 2px solid #e2e8f0;
    border-radius: 5px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;
    cursor: pointer;
    flex-shrink: 0;
  }

  .cf-check-input:checked + .cf-check-box {
    background: #bed989;
    border-color: #bed989;
  }

  .cf-check-box::after {
    content: '';
    display: none;
    width: 5px;
    height: 9px;
    border: 2px solid #fff;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translateY(-1px);
  }

  .cf-check-input:checked + .cf-check-box::after {
    display: block;
  }

  /* Sim/Não */
  .cf-yesno-wrap {
    display: flex;
    gap: 8px;
    padding-left: 4px;
  }

  .cf-yesno-option {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    transition: border-color 0.15s, background 0.15s, color 0.15s;
    white-space: nowrap;
  }

  .cf-yesno-option:has(.cf-check-input:checked) {
    border-color: #bed989;
    background: #f0f7e6;
    color: #6a9e2f;
  }

  /* SelectFieldDefault */
  .cf-select-default-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
`;

function CustomForm({
  fieldsets,
  onAction,
  classRender,
  classButton,
  notButton = true,
  typeButton = 'submit',
  titleButton = "Login",
  ...formProps
}: CustomFormProps) {
  return (
    <>
      <style>{formStyles}</style>
      <form {...formProps}>
        {fieldsets.map((fieldset: any, fieldsetIndex: any) => (
          <fieldset key={fieldsetIndex} className="cf-fieldset" {...fieldset.attributes}>
            {fieldset.legend?.text && (
              <legend className={`cf-legend ${fieldset.legend?.style || ''}`}>
                {fieldset.legend.text}
              </legend>
            )}
            <label className="cf-label">
              {fieldset.item.label}
              {fieldset.item.mandatory && <b className="cf-mandatory"> *</b>}
            </label>
            {renderField(fieldset.item.captureValue)}
          </fieldset>
        ))}
        {notButton && (
          <div className="cf-btn-wrap">
            <button
              onClick={onAction}
              type={typeButton}
              title="Executar ação"
              className={classButton || "cf-btn cf-btn-primary"}
            >
              <i className="fa fa-check"></i>
              {titleButton}
            </button>
          </div>
        )}
      </form>
    </>
  );
}

export function renderField(captureValue: CaptureValueArray | CaptureValueTuple) {
  const convertValueArray = Array.isArray(captureValue) ? captureValue : [captureValue];
  return (
    <React.Fragment>
      {convertValueArray.map((field: any, index) => (
        <React.Fragment key={`field_${index}`}>
          {renderFieldSingle(field)}
        </React.Fragment>
      ))}
    </React.Fragment>
  );
}

function renderFieldSingle(captureValue: CaptureValueArray | any) {
  if (isFieldWithType(captureValue)) {
    switch (captureValue?.type) {
      case 'textarea': return renderTextarea(captureValue);
      case 'select':   return renderSelect(captureValue);
      default:         return renderInput(captureValue);
    }
  }
}

function renderInput(captureValue: React.InputHTMLAttributes<HTMLInputElement>) {
  return <InputField {...captureValue} />;
}

function renderSelect(captureValue: React.SelectHTMLAttributes<HTMLSelectElement> & { options?: SelectOption[] } | any) {
  return <SelectField {...captureValue} options={captureValue?.options || []} />;
}

function renderTextarea(captureValue: React.TextareaHTMLAttributes<HTMLTextAreaElement> | object) {
  return <TextareaField {...captureValue} />;
}

export function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={`cf-input ${className || ''}`} {...rest} />;
}

function isFieldWithType(captureValue: any): captureValue is { type: string } {
  return captureValue && typeof captureValue.type === 'string';
}

export function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[] }
) {
  const { className, options, ...rest } = props;
  return (
    <select className={`cf-select ${className || ''}`} {...rest}>
      <option value="" hidden></option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function SelectFieldDefault(props: {
  label?: string;
  value?: string | number;
  onChange?: any;
  className?: string;
  disabled?: boolean;
  options: { label?: string; value?: string | number }[];
}) {
  return (
    <label className="cf-select-default-label">
      {props.label}
      <select
        value={props.value}
        onChange={props.onChange}
        className={`cf-select ${props.className || ''}`}
        disabled={props.disabled}
      >
        <option hidden defaultValue={""} value={""}>Selecione</option>
        {props.options.map(({ label, value }, key) => (
          <option key={`opt_${key}`} value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}

export function InputCheckbox(props: {
  label?: string;
  checked?: boolean;
  onChange: any;
  textColor?: string;
  task: any;
  yesNo: number;
  id: string;
  order: number;
  onPosition: () => void;
  isQuestion?: boolean;
}) {
  function QuestionItem() {
    return (
      <div className="cf-yesno-wrap">
        <label className="cf-yesno-option">
          <span className="cf-check-wrap">
            <input
              type="checkbox"
              className="cf-check-input"
              name={props.id}
              checked={props.yesNo === 1}
              value={1}
              onChange={() => submitQuestionItem(1)}
            />
            <span className="cf-check-box"></span>
          </span>
          Sim
        </label>
        <label className="cf-yesno-option">
          <span className="cf-check-wrap">
            <input
              type="checkbox"
              className="cf-check-input"
              name={props.id}
              checked={props.yesNo === 2}
              value={2}
              onChange={() => submitQuestionItem(2)}
            />
            <span className="cf-check-box"></span>
          </span>
          Não
        </label>
      </div>
    );
  }

  function submitQuestionItem(response: number) {
    const value = props.yesNo === response ? 3 : response;
    props.onChange(props.id, value !== 3, props.task.task_id, props.task, value);
  }

  function OptionItem() {
    return (
      <div style={{ paddingLeft: 4 }}>
        <label className="cf-yesno-option">
          <span className="cf-check-wrap">
            <input
              id={`item_task_${props.id}`}
              type="checkbox"
              value={0}
              checked={props.checked}
              onChange={(e: any) => props.onChange(props.id, e.target.checked, props.task.task_id, props.task)}
              className="cf-check-input"
            />
            <span className="cf-check-box"></span>
          </span>
        </label>
      </div>
    );
  }

  return (
    <>
      <style>{formStyles}</style>
      <div className="cf-checkbox-row">
        <button
          onClick={props.onPosition}
          title="Alterar posição do item"
          className="cf-order-btn"
        >
          {props.order.toString().padStart(2, "0")}
        </button>
        {props.yesNo === 0 ? <OptionItem /> : <QuestionItem />}
        <label htmlFor={`item_task_${props.id}`} className="cf-checkbox-label">
          {props.label}
        </label>
      </div>
    </>
  );
}

export function TextareaField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={`cf-textarea ${className || ''}`} {...rest} />;
}

export default CustomForm;