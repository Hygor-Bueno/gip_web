import React, { useCallback, useEffect, useRef, useState } from 'react';
import './columnTaskState.css';
import ContentFilter from '../ContentFilter/ContentFilter';
import MinimalFilterModel from '../MinimalFilterModel/MinimalFilterModel';
import CardTask from '../CardTask/CardTask';
import { useWebSocket } from '../../Context/GtppWsContext';
import { useMyContext } from '../../../../Context/MainContext';
import { filterTasks } from './filtercardTask';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TaskFilter {
    search: string;
    prioritySearch: number;
    dateInitialSearch: string;
    dateInitialFinalSearch: string;
    dateFinalSearch: string;
    dateFinalFinalSearch: string;
    filterHandlerDataUser: number;
    theme_id_fk: number[];
}

const INITIAL_FILTER: TaskFilter = {
    search: '',
    prioritySearch: 3,
    dateInitialSearch: '',
    dateInitialFinalSearch: '',
    dateFinalSearch: '',
    dateFinalFinalSearch: '',
    filterHandlerDataUser: 3,
    theme_id_fk: [],
};

interface ColumnTaskStateProps {
    title: string;
    bg_color: string;
    buttonIcon?: string;
    buttonHeader?: JSX.Element;
    istheme?: string;
    content_body?: any[];
    selectedTasks?: number[];
    setSelectedTasks?: React.Dispatch<React.SetStateAction<number[]>>;
    theme_id_fk: string;
    is_first_column?: boolean;
    exportCsv?: () => void;
    exportPdf?: () => void;
    addTask?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const ColumnTaskState: React.FC<ColumnTaskStateProps> = ({
    title,
    bg_color,
    buttonHeader,
    content_body,
    selectedTasks,
    setSelectedTasks,
    theme_id_fk,
    is_first_column,
    exportCsv,
    exportPdf,
    addTask,
}) => {
    const { userLog } = useMyContext();
    const { setTask, setTaskPercent, setOpenCardDefault, setNotifications, notifications } = useWebSocket();

    const [filterHandler, setFilterHandler] = useState(false);
    const [filterData, setFilterData] = useState<TaskFilter>(INITIAL_FILTER);

    const filterRef = useRef<HTMLDivElement>(null);

    // ── Fecha o filtro ao clicar fora ─────────────────────────────────────────
    useEffect(() => {
        if (!filterHandler) return;

        const handleClickOut = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterHandler(false);
            }
        };

        document.addEventListener('click', handleClickOut);
        return () => document.removeEventListener('click', handleClickOut);
    }, [filterHandler]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleFilterToggle = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setFilterHandler(prev => !prev);
    }, []);

    const handleResetFilter = useCallback(() => {
        setFilterData(INITIAL_FILTER);
    }, []);

    const handleTaskClick = useCallback((task: any) => {
        setTask(task);
        setTaskPercent(task.percent);
        setOpenCardDefault(true);
        setNotifications(notifications.filter(item => item.task_id !== task.id));
    }, [setTask, setTaskPercent, setOpenCardDefault, setNotifications, notifications]);

    const handleSelectTask = useCallback((taskId: number) => {
        if (!setSelectedTasks) return;

        setSelectedTasks(prev => {
            if (prev.includes(taskId)) {
                return prev.filter(id => id !== taskId);
            }
            return [...prev, taskId];
        });
    }, [setSelectedTasks]);

    // ── Filtros individuais ───────────────────────────────────────────────────

    const filterHandlers = [
        (value: string)  => setFilterData(x => ({ ...x, search: value })),
        (value: string)  => setFilterData(x => ({ ...x, dateInitialSearch: value })),
        (value: string)  => setFilterData(x => ({ ...x, dateInitialFinalSearch: value })),
        (value: number)  => setFilterData(x => ({ ...x, prioritySearch: value })),
        (value: string)  => setFilterData(x => ({ ...x, dateFinalSearch: value })),
        (value: string)  => setFilterData(x => ({ ...x, dateFinalFinalSearch: value })),
        (value: number)  => setFilterData(x => ({ ...x, filterHandlerDataUser: value })),
    ];

    // ── Tasks filtradas ───────────────────────────────────────────────────────

    const filteredTasks = filterTasks(
        content_body,
        filterData.search,
        filterData.dateInitialSearch,
        filterData.dateInitialFinalSearch,
        filterData.dateFinalSearch,
        filterData.dateFinalFinalSearch,
        filterData.prioritySearch.toString(),
        theme_id_fk,
        filterData.filterHandlerDataUser,
        userLog,
    ) ?? [];

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div
                className={`columnTaskState-title rounded-top d-flex align-items-center ${buttonHeader ? 'justify-content-between' : 'justify-content-center'}`}
                style={{ background: `#${bg_color}` }}
            >
                <div className="d-flex justify-content-between align-items-center w-100">
                    <h1 className="rounded p-1">{title}</h1>

                    <div className="w-100 d-flex justify-content-end">
                        <button
                            className="btn fa fa-refresh text-white"
                            onClick={handleResetFilter}
                            title="Limpar filtros"
                        />
                        <button
                            className="btn fas fa-filter text-white"
                            onClick={handleFilterToggle}
                            title="Filtrar"
                        />
                    </div>

                    {/* Painel de filtro */}
                    <div style={{ position: 'relative' }}>
                        {filterHandler && (
                            <MinimalFilterModel>
                                <div ref={filterRef}>
                                    <ContentFilter filter={filterHandlers} />
                                </div>
                            </MinimalFilterModel>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="columnTaskState-container">
                <div className="columnTaskState-body">
                    <div className="task-cards-container">
                        {filteredTasks.map((task: any) => (
                            <div
                                key={task.id}
                                onClick={() => handleSelectTask(task.id)}
                            >
                                <CardTask
                                    selectedTasks={selectedTasks}
                                    id={task.id}
                                    initial_date={task.initial_date}
                                    final_date={task.final_date}
                                    title_card={task.description}
                                    priority_card={task.priority}
                                    percent={task.percent}
                                    create_by={task.user_id}
                                    onClick={() => handleTaskClick(task)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                className={`columnTaskState-title rounded-bottom d-flex align-items-center justify-content-around ${buttonHeader ? 'justify-content-between' : 'justify-content-center'}`}
                style={{ background: `#${bg_color}` }}
            >
                <i className="fa save cursor-pointer text-white fa-file-csv" onClick={exportCsv} title="Exportar CSV" />
                <i className="fa file cursor-pointer text-white fa-file-pdf" onClick={exportPdf} title="Exportar PDF" />
                {is_first_column && (
                    <i className="fa add cursor-pointer text-white fa-circle-plus" onClick={addTask} title="Nova tarefa" />
                )}
            </div>

        </div>
    );
};

export default ColumnTaskState;