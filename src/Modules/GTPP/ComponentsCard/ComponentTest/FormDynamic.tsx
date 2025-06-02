import React, { useState } from 'react';

// Tipagem do arquivo JSON de configuração
interface InputConfig {
  type: 'text' | 'email' | 'number' | 'select' | 'radio' | 'checkbox';
  placeholder: string;
  label: string;
  required?: boolean;
  min?: number;
  options?: string[]; // Para select, radio, e checkbox
}

interface FormConfig {
  inputs: InputConfig[];
}

// Exemplo de configuração de inputs (simulando o arquivo JSON)
const configuracaoInputs: FormConfig = {
  inputs: [
    { type: 'text', placeholder: 'Nome', label: 'Nome' },
    { type: 'email', placeholder: 'Email', label: 'Email' },
    { type: 'number', placeholder: 'Idade', label: 'Idade' },
    { type: 'select', placeholder: 'Pais', label: 'Escolha um país', options: ['Brasil', 'Argentina', 'Chile'] },
    { type: 'radio', placeholder: 'Genero', label: 'Sexo', options: ['Masculino', 'Feminino', 'Outro'] },
    { type: 'checkbox', placeholder: 'Aceito termos', label: 'Aceito os termos de uso', options: ['Sim'] }
  ]
};

const FormularioDinamico: React.FC = () => {
  // Inicializando o estado dos inputs
  const [valoresInputs, setValoresInputs] = useState<Record<string, string | string[]>>(
    configuracaoInputs.inputs.reduce((acc, input) => {
      if (input.type === 'checkbox') {
        acc[input.placeholder] = []; // Array vazio para checkboxes
      } else {
        acc[input.placeholder] = ''; // String vazia para outros tipos
      }
      return acc;
    }, {} as Record<string, string | string[]>)
  );

  // Função para lidar com mudanças nos inputs
  const handleInputChange = (e: React.ChangeEvent<(EventTarget & HTMLInputElement) | (EventTarget & HTMLSelectElement)>) => {
    // @ts-ignore
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      // Para checkboxes, alteramos o estado com base na seleção
      setValoresInputs((prevState) => {
        const selectedValues = prevState[name] as string[];
        if (checked) {
          selectedValues.push(value);
        } else {
          const index = selectedValues.indexOf(value);
          if (index > -1) {
            selectedValues.splice(index, 1);
          }
        }
        return {
          ...prevState,
          [name]: selectedValues
        };
      });
    } else if (type === 'radio') {
      // Para radios, apenas um valor pode ser selecionado
      setValoresInputs((prevState) => ({
        ...prevState,
        [name]: value
      }));
    } else {
      // Para outros tipos de input (text, email, number, etc.), o valor é simples
      setValoresInputs((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  return (
    <div>
      <form>
        {configuracaoInputs.inputs.map((input, index) => (
          <div key={index}>
            <label>{input.label}</label>
            {/* Renderizando conforme o tipo do input */}
            {input.type === 'text' || input.type === 'email' || input.type === 'number' ? (
              <input
                type={input.type}
                name={input.placeholder}
                value={valoresInputs[input.placeholder] as string}
                onChange={handleInputChange}
                placeholder={input.placeholder}
                required={input.required}
                min={input.min}
              />
            ) : input.type === 'select' ? (
              <select
                name={input.placeholder}
                value={valoresInputs[input.placeholder] as string}
                onChange={handleInputChange}
                required={input.required}
              >
                {input.options?.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : input.type === 'radio' ? (
              input.options?.map((option, idx) => (
                <div key={idx}>
                  <input
                    type="radio"
                    id={option}
                    name={input.placeholder}
                    value={option}
                    checked={valoresInputs[input.placeholder] === option}
                    onChange={handleInputChange}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))
            ) : input.type === 'checkbox' ? (
              input.options?.map((option, idx) => (
                <div key={idx}>
                  <input
                    type="checkbox"
                    id={option}
                    name={input.placeholder}
                    value={option}
                    checked={(valoresInputs[input.placeholder] as string[]).includes(option)}
                    onChange={handleInputChange}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))
            ) : null}
          </div>
        ))}
      </form>
    </div>
  );
};

export default FormularioDinamico;
