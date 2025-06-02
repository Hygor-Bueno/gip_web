export const fieldsetsFormsBusiness = (
    captureValueCnpj: (value: string) => void,
    captureValueName: (value: string) => void,
    captureValueStreet: (value: string) => void,
    captureValueDistrict: (value: string) => void,
    captureValueCity: (value: string) => void,
    captureValueState: (value: string) => void,
    captureValueNumber: (value: string) => void,
    captureValueZipCode: (value: string) => void,
    captureValueComplement: (value: string) => void,
    data: any,
    searchCEP: any
) => [
        {
            attributes: { className: 'col-12 col-sm-6 col-md-4 col-xl-3' },
            item: {
                label: 'Nome:',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: 'Digite a empresa..',
                    name: 'name',
                    className: 'form-control',
                    value: data.name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueName(e.target.value),
                    required: true,
                    id: ''
                }
            }
        },
        {
            attributes: { className: 'col-12 col-sm-6 col-md-4 col-xl-3' },
            item: {
                label: 'CNPJ:',
                mandatory: false,
                captureValue: {
                    type: 'text',
                    placeholder: '00.000.000/0001-00',
                    name: 'cnpj',
                    className: 'form-control',
                    value: data.cnpj,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        captureValueCnpj(e.target.value.replace(/[^0-9./-]/g, '')),
                    required: false,
                    id: ''
                }
            }
        },

        {
            attributes: { className: 'col-12 col-sm-6 col-md-4 col-xl-3' },
            item: {
                label: 'CEP:',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: '00000-000',
                    name: 'zipcode',
                    className: 'form-control',
                    value: data.zip_code,
                    onBlur: () => searchCEP(),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        captureValueZipCode(e.target.value.replace(/[^0-9/-]/g, '')),
                    required: true,
                    id: ''
                }
            }
        },
        {
            attributes: { className: 'col-12 col-sm-6 col-md-4 col-xl-3' },

            item: {
                label: 'Rua:',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: 'Ex: R. medeiros de...',
                    name: 'street',
                    className: 'form-control',
                    value: data.street,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueStreet(e.target.value),
                    required: true,
                    id: '',
                    disabled: false
                }
            }
        },
        {
            attributes: { className: 'col-6 col-sm-3 col-lg-2  col-xxl-' },
            item: {
                label: 'Nº:',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: 'Digite...',
                    name: 'number',
                    className: 'form-control',
                    value: data.number,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        captureValueNumber(e.target.value.replace(/[^0-9./-]/g, '')),
                    required: true,
                    id: ''
                }
            }
        },
        {
            attributes: { className: 'col-6 col-sm-3 col-md-5 col-lg-3 col-xl-2' },
            item: {
                label: 'Cidade:',
                mandatory: true,
                captureValue: {
                    type: 'text',
                    placeholder: 'Ex: São Paulo',
                    name: 'city',
                    className: 'form-control',
                    value: data.city,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueCity(e.target.value),
                    required: true,
                    id: '',
                    disabled: false
                }
            }
        },
        {
            attributes: { className: 'col-6 col-sm-6 col-md-4 col-lg-3 col-xl-2' },
            item: {
                label: 'Estado:',
                mandatory: true,
                captureValue: {
                    type: 'select',
                    placeholder: 'Selecione o estado',
                    name: 'state',
                    className: 'form-control',
                    value: data.state,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueState(e.target.value),
                    required: true,
                    id: '',
                    disabled: false,
                    options: [
                        { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
                        { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
                        { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
                        { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
                        { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
                        { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
                        { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
                        { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
                        { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
                    ]
                }
            }
        },
        {
            attributes: { className: 'col-6 col-sm-6 col-md-4 col-xl-3 col-xxl-2' },
            item: {
                label: 'Bairro:',
                mandatory: false,
                captureValue: {
                    type: 'text',
                    placeholder: 'Digite...',
                    name: 'district',
                    className: 'form-control',
                    value: data.district,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueDistrict(e.target.value),
                    required: false,
                    id: '',
                    disabled: false
                }
            }
        },
        {
            attributes: { className: 'col-sm-6 col-md-4 col-lg-2 col-xl-3 col-xxl-2' },
            item: {
                label: 'Complemento:',
                mandatory: false,
                captureValue: {
                    type: 'text',
                    placeholder: 'Ex: Loja 201 bloco 2',
                    name: 'complement',
                    className: 'form-control',
                    value: data.complement,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => captureValueComplement(e.target.value),
                    required: false,
                    id: ''
                }
            }
        }
    ];
