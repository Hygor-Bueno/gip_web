import { InputField, SelectField } from '../../../../Components/CustomForm';

type Props = {
    title: string, 
    value: string | number,
    handle: (e: any) => void,
    options?: any,
    isSelect?: boolean,
    type?: string
}

function Filter({title, value, handle, isSelect = false, options, type="text"}: Props) {
  return (
    <div className="d-flex flex-column w-auto">
        <label className="fw-bold mb-1 small">{title}</label>
        {!isSelect ? 
            <InputField type={type} className="form-control-sm form-control" placeholder={title} value={value} onChange={handle} /> 
            : 
            <SelectField className='form-select form-select-sm' onChange={handle} value={value} options={options} />
        }
    </div>
  )
}

export default Filter;