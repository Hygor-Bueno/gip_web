import React from 'react';
// import './columnTaskState.css';
import CustomForm from '../../../../Components/CustomForm';
import { fildsetsFilters } from '../../mock/configurationfile';
type TaskStateFilterProps = {
    filter: Function[] | any;
    onAction?:() => void;
    ref?: any;
}

const ContentFilter: React.FC<TaskStateFilterProps>= ({ filter, onAction, ref }) => {
    const [
        handleFilterSearch,
        handleFilterDateInitial,
        handleFilterDateInitialFinal,
        handleFilterPriority,
        handleFilterDateFinal,
        handleFilterDateFinalFinal,
        filterHandlerDataUser
    ] = filter;

    // Campo de valores de prioridades
    const optionsFilterPriority = [
        {value: '3', label: 'Todas as propriedades'},
        {value: '2', label: 'Alta'},
        {value: '1', label: 'Média'},
        {value: '0', label: 'Baixa'},
    ];

    // Campo de valores de Radio
    const optionsFavoriteAndColaboratios = [
        {value: '3', label: 'Todos'},
        {value: '2', label: 'Colaborações'},
        {value: '1', label: 'Minhas Tarefas'},
    ];

    // alocador de valores.
    const fieldsetsValues = fildsetsFilters(
        handleFilterSearch,

        // select
        handleFilterPriority,
        optionsFilterPriority,
        // final select

        // Inputs de datas
        handleFilterDateInitial,
        handleFilterDateInitialFinal,
        handleFilterDateFinal,
        handleFilterDateFinalFinal,

        // Select colaboradores
        filterHandlerDataUser,
        optionsFavoriteAndColaboratios,
    );

    return (
        <div ref={ref}>
            <CustomForm
                onAction={onAction}
                classButton='btn btn-danger fa fa-refresh fs-5 my-2'
                titleButton=''
                typeButton='submit'
                notButton={false}
                fieldsets={fieldsetsValues}
            />
        </div>
    );
};


export default ContentFilter;