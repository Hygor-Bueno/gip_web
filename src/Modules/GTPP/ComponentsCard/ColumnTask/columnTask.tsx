import React, {
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from 'react';
import './columnTaskState.css';
import ContentFilter from '../ContentFilter/ContentFilter';
import MinimalFilterModel from '../MinimalFilterModel/MinimalFilterModel';
import CardTask from '../CardTask/CardTask';
import { useWebSocket } from '../../Context/GtppWsContext';
import { useMyContext } from '../../../../Context/MainContext';
import { filterTasks } from './filtercardTask';

const MemoizedCardTask = memo(CardTask);

const ColumnTaskState: React.FC<any> = (domProps: any) => {
  const { userLog } = useMyContext();
  const {
    exportCsv,
    exportPdf,
    addTask,
    is_first_column,
    content_body = [],
    selectedTasks = [],
    setSelectedTasks,
    isTheme,
    theme_id_fk,
    ...rest
  } = domProps;

  const { setTask, setTaskPercent, setOpenCardDefault, setNotifications, notifications } = useWebSocket();

  const [filterHandler, setFilterHandler] = useState(false);
  const componenteRef = useRef<HTMLDivElement>(null);

  const [filterData, setFilterData] = useState<any>({
    search: '',
    prioritySearch: 3,
    dateInitialSearch: '',
    dateInitialFinalSearch: '',
    dateFinalSearch: '',
    dateFinalFinalSearch: '',
    filterHandlerDataUser: 3,
    theme_id_fk: [],
  });

  const filteredTasks = useMemo(() => {
    return filterTasks(
      content_body,
      filterData.search,
      filterData.dateInitialSearch,
      filterData.dateInitialFinalSearch,
      filterData.dateFinalSearch,
      filterData.dateFinalFinalSearch,
      filterData.prioritySearch.toString(),
      theme_id_fk,
      filterData.filterHandlerDataUser,
      userLog
    );
  }, [
    content_body,
    filterData.search,
    filterData.dateInitialSearch,
    filterData.dateInitialFinalSearch,
    filterData.dateFinalSearch,
    filterData.dateFinalFinalSearch,
    filterData.prioritySearch,
    filterData.filterHandlerDataUser,
    theme_id_fk,
    userLog,
  ]);

  const toggleFilter = useCallback((e: any) => {
    e.stopPropagation();
    setFilterHandler((prev: boolean) => !prev);
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (componenteRef.current && !componenteRef.current.contains(event.target as Node)) {
      setFilterHandler(false);
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilterData({
      search: '',
      prioritySearch: 3,
      dateInitialSearch: '',
      dateInitialFinalSearch: '',
      dateFinalSearch: '',
      dateFinalFinalSearch: '',
      filterHandlerDataUser: 3,
      theme_id_fk: [],
    });
  }, []);

  const openTaskDetail = useCallback(
    (task: any) => {
        if (!isTheme) {
            setTask(task);
            setTaskPercent(task.percent);
            setOpenCardDefault(true);
            (setNotifications as any)((prev: any) => prev.filter((item: any) => item.task_id !== task.id));
        }
    },
    [isTheme, setTask, setTaskPercent, setOpenCardDefault, setNotifications]
    );

  const toggleTaskSelection = useCallback(
    (taskId: any) => {
      if (!isTheme || !setSelectedTasks) return;

      setSelectedTasks((prev: any) => {
        if (prev.includes(taskId)) {
          return prev.filter((id: any) => id !== taskId);
        }
        return [...prev, taskId];
      });
    },
    [isTheme, setSelectedTasks]
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const HeaderColumn = memo(() => (
    <div
      className={`columnTaskState-title rounded-top d-flex ${
        domProps.buttonHeader ? 'justify-content-between' : 'justify-content-center'
      } align-items-center`}
      style={{ background: `#${domProps.bg_color}` }}
    >
      <div className="d-flex justify-content-between align-items-center w-100">
        <div>
          <h1 className="rounded p-1">{domProps.title}</h1>
        </div>

        <div className="d-flex justify-content-end gap-3">
          <button className="btn fa fa-refresh text-white" onClick={resetFilters} />
          <button onClick={toggleFilter} className="btn fas fa-filter text-white" />
        </div>

        {filterHandler && (
          <div style={{ position: 'absolute', right: 10, top: 50, zIndex: 999 }}>
            <MinimalFilterModel>
              <div ref={componenteRef}>
                <ContentFilter
                  filter={[
                    (v: any) => setFilterData((x: any) => ({ ...x, search: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, dateInitialSearch: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, dateInitialFinalSearch: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, prioritySearch: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, dateFinalSearch: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, dateFinalFinalSearch: v })),
                    (v: any) => setFilterData((x: any) => ({ ...x, filterHandlerDataUser: v })),
                  ]}
                />
              </div>
            </MinimalFilterModel>
          </div>
        )}
      </div>
    </div>
  ));

  const BodyColumn = memo(() => (
    <div className="columnTaskState-container">
      <div className="columnTaskState-body">
        <div className="task-cards-container">
          {(filteredTasks || []).map((task: any) => (
            <div key={task.id} onClick={() => toggleTaskSelection(task.id)} style={{ cursor: isTheme ? 'pointer' : 'default' }}>
              <MemoizedCardTask
                selectedTasks={selectedTasks}
                id={task.id}
                initial_date={task.initial_date}
                final_date={task.final_date}
                title_card={task.description}
                priority_card={task.priority}
                percent={task.percent}
                create_by={task.user_id}
                isTheme={isTheme}
                onClick={() => openTaskDetail(task)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  ));

  const FooterColumn = memo(() => (
    <div
      className="columnTaskState-title rounded-bottom d-flex justify-content-around align-items-center"
      style={{ background: `#${domProps.bg_color}` }}
    >
      {exportCsv && <i className="fa fa-file-csv text-white cursor-pointer" onClick={exportCsv} />}
      {exportPdf && <i className="fa fa-file-pdf text-white cursor-pointer" onClick={exportPdf} />}
      {is_first_column && addTask && (<i className="fa fa-circle-plus text-white cursor-pointer" onClick={addTask} />)}
    </div>
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} {...rest}>
      <HeaderColumn />
      <BodyColumn />
      <FooterColumn />
    </div>
  );
};

export default memo(ColumnTaskState);