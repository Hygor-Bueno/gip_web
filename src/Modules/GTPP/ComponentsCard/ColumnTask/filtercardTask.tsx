import { ITask } from "../../../../Interface/iGIPP";

export const filterTasks = (
    tasks: ITask[], 
    searchTerm: string = "", 
    rangeDateInitial: string = "", 
    rangeDateInitialFinal: string = "", 
    rangeDateFinal: string = "", 
    rangeDateFinalFinal: string = "", 
    priority: string = "",
    id_themes: string = "",
    IdentityDataUser: number, 
    user_id: {id: number}
) => {
    try {
        let filtered = tasks;

        if (id_themes) filtered = filterTaskWithTheme(filtered, id_themes);
        if (searchTerm) filtered = searchTask(filtered, searchTerm);
        if (priority) filtered = priorityTask(filtered, priority);
        if (IdentityDataUser) filtered = userIdentity(filtered, IdentityDataUser, user_id);
        if (rangeDateInitial && rangeDateInitialFinal) filtered = filterDate(filtered, rangeDateInitial, rangeDateInitialFinal, "initial_date");
        if (rangeDateFinal && rangeDateFinalFinal) filtered = filterDate(filtered, rangeDateFinal, rangeDateFinalFinal, "final_date");

        return filtered;
    } catch (error: any) {
        console.error(error.message);   
        return tasks;
    }
};

function filterTaskWithTheme(tasks: any,id_themes: string | string[] | null | undefined) {
  if (id_themes == null) return tasks;
  const themeIds = Array.isArray(id_themes) ? id_themes.map(String) : [String(id_themes)];
  const filtered = tasks.filter((task:any) => themeIds.includes(String(task.theme_id_fk)));
  return filtered;  
}

function filterDate(tasks: ITask[], start: string, end: string, dataRef: keyof ITask) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return tasks.filter(task => {
        const taskDate = new Date(task[dataRef] as string);
        return taskDate >= startDate && taskDate <= endDate;
    });
}

function userIdentity(tasks: ITask[], IdentityDataUser: number, user_id: {id: number}) {
    return tasks.filter(task => {
        if (IdentityDataUser === 3) return true;
        if (IdentityDataUser === 2) return task.user_id !== user_id.id;
        return task.user_id === user_id.id;
    });
}

function priorityTask(tasks: ITask[], priority: string) {
    if (priority === String(3)) return tasks;
    return tasks.filter(task => task.priority.toString() === priority);
}

function searchTask(tasks: ITask[], searchTerm: string) {
    const upperSearch = searchTerm.toUpperCase();
    return tasks.filter(task => 
        task.description.toUpperCase().includes(upperSearch) || 
        task.id.toString().includes(upperSearch)
    );
}