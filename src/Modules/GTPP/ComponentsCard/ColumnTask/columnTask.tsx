import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';
import './columnTaskState.css';
import ContentFilter from '../ContentFilter/ContentFilter';
import MinimalFilterModel from '../MinimalFilterModel/MinimalFilterModel';
import CardTask from '../CardTask/CardTask';
import { useWebSocket } from '../../Context/GtppWsContext';
import { useMyContext } from '../../../../Context/MainContext';
import { filterTasks } from './filtercardTask';

type ColumnPropsTaskState = HTMLAttributes<HTMLDivElement> & {
    title: string;
    bg_color: string;
    buttonIcon?: string;
    buttonHeader?: JSX.Element;
    content_body?: any;
};

type ColumnPropsTaskStateBoolean = {
    is_first_column?: boolean;
}

type ColumnPropsTaskStateFunction = {
    exportCsv?: () => void;
    exportPdf?: () => void;
    addTask?: () => void;
}

type TaskFilter = {
    search: string;
    prioritySearch: number;
    dateInitialSearch: string;
    dateInitialFinalSearch: string;
    dateFinalSearch: string;
    dateFinalFinalSearch: string;
    filterHandlerDataUser: number;
}

const ColumnTaskState: React.FC<ColumnPropsTaskState & ColumnPropsTaskStateFunction & ColumnPropsTaskStateBoolean> = (props) => {
    const { userLog } = useMyContext();
    const { exportCsv, exportPdf, addTask, is_first_column, ...rest } = props;
    const [filterHandler, setFilterHandler] = useState(false);
    const { setTask, setTaskPercent, setOpenCardDefault, setNotifications, notifications } = useWebSocket();
    const componenteRef = useRef<HTMLDivElement | null>(null);

    const [filterData, setFilterData] = useState<TaskFilter>({
        search: "",
        prioritySearch: 3,
        dateInitialSearch: "",
        dateInitialFinalSearch: "",
        dateFinalSearch: "",
        dateFinalFinalSearch: "",
        filterHandlerDataUser: 3
    });
    
    // Função que alterna a visibilidade do modal
    const handleFilterForContentBody = (event: React.MouseEvent) => {
        event.stopPropagation();
        setFilterHandler(prevState => !prevState);
    };

    const handleClickOut = (event: MouseEvent) => {
        if (componenteRef.current && !componenteRef.current.contains(event.target as Node)) {
            setFilterHandler(false);
        }
    };

    useEffect(() => {
        const handleClickOutWrapper = (event: MouseEvent) => {
            if (componenteRef.current) {
                handleClickOut(event);
            }
        };

        document.addEventListener('click', handleClickOutWrapper);

        return () => {
            document.removeEventListener('click', handleClickOutWrapper);
        };
    }, []);

    return (
        <div style={{ display:"flex",flexDirection:"column",height: '100%' }} {...rest}>
            <div className={`columnTaskState-title rounded-top d-flex ${props.buttonHeader ? 'justify-content-between' : 'justify-content-center'} align-items-center`} style={{ background: `#${props.bg_color}` }}>
                <div className='d-flex justify-content-between align-items-center w-100'>
                    <div><h1 className="rounded p-1">{props.title}</h1></div>
                    <div className='w-100 d-flex justify-content-end'>
                        <div><button className='btn fa fa-refresh text-white' onClick={() => {
                            setFilterData(prev => ({...prev, search: "", dateFinalFinalSearch: "", dateFinalSearch: "", dateInitialFinalSearch: "", dateInitialSearch: "", statusSearch: 0, prioritySearch: 3, filterHandlerDataUser: 3}))
                        } }></button></div>    
                        <div><button onClick={handleFilterForContentBody} className="btn fas fa-filter text-white"></button></div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        {filterHandler && (
                            <MinimalFilterModel>
                                <div ref={componenteRef}>
                                    <ContentFilter
                                        filter={[
                                            (value: string) => setFilterData(x => ({ ...x, search: value })),
                                            (value: string) => setFilterData(x => ({ ...x, dateInitialSearch: value })),
                                            (value: string) => setFilterData(x => ({ ...x, dateInitialFinalSearch: value })),
                                            (value: number) => setFilterData(x => ({ ...x, prioritySearch: value })),
                                            (value: string) => setFilterData(x => ({ ...x, dateFinalSearch: value })),
                                            (value: string) => setFilterData(x => ({ ...x, dateFinalFinalSearch: value })),
                                            (value: number) => setFilterData(x => ({ ...x, filterHandlerDataUser: value })),
                                        ]}
                                    />
                                </div>
                            </MinimalFilterModel>
                        )}
                    </div>
                    
                </div>
            </div>
            <div className="columnTaskState-container">
                <div className="columnTaskState-body">
                      <div className="task-cards-container">                        
                        {filterTasks(
                            props.content_body, 
                            filterData.search, 
                            filterData.dateInitialSearch, 
                            filterData.dateInitialFinalSearch, 
                            filterData.dateFinalSearch,
                            filterData.dateFinalFinalSearch,
                            filterData.prioritySearch.toString(),
                            filterData.filterHandlerDataUser,
                            userLog
                        )?.map((task:any, _: number) => {
                        return (
                            <CardTask
                            key={`simple_card_task_${task.id}`}
                            id={task.id}
                            initial_date={task.initial_date}
                            final_date={task.final_date}
                            title_card={task.description}
                            priority_card={task.priority}
                            percent={task.percent}
                            create_by={task.user_id}
                            onClick={() => {
                                setTask(task);
                                setTaskPercent(task.percent);
                                setOpenCardDefault(true);
                                setNotifications(
                                    notifications.filter((item) => item.task_id !== task.id)
                                );
                            }}
                        />)
                        })}
                    </div>
                </div>
            </div>
            <div className={`columnTaskState-title rounded-bottom d-flex ${props.buttonHeader ? 'justify-content-between' : 'justify-content-center'} align-items-center justify-content-around`} style={{ background: `#${props.bg_color}` }}>
                <i className='fa save cursor-pointer text-white fa-file-csv' onClick={exportCsv} />
                <i className='fa file cursor-pointer text-white fa-file-pdf' onClick={exportPdf} />
                {is_first_column && <i className='fa add cursor-pointer text-white fa-circle-plus' onClick={addTask} />}
            </div>
        </div>
    );
};

export default ColumnTaskState;
