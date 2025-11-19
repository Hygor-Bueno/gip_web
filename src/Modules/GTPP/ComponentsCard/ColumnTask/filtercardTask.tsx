import { ITask } from "../../../../Interface/iGIPP";

export const filterTasks = (
    tasks: ITask[], 
    searchTerm: String = "", 
    rangeDateInitial: String = "", 
    rangeDateInitialFinal: String = "", 
    rangeDateFinal: String = "", 
    rangeDateFinalFinal: String = "", 
    priority: string,
    id_themes: string,
    IdentityDataUser: Number, 
    user_id: any) => {
    try {
        let filtred: any = tasks;
        if(searchTerm !== "") filtred = searchTask(filtred, searchTerm);
        if(priority !== "") filtred = priorityTask(filtred, priority);
        if(IdentityDataUser) filtred = userIndentity(filtred, IdentityDataUser, user_id);
        if(id_themes && id_themes.length > 0) filtred = filterTaskWithTheme(filtred, id_themes);
        if(rangeDateInitial !== "" && rangeDateInitialFinal !== "") filtred = filterDate(filtred, rangeDateInitial, rangeDateInitialFinal,"initial_date");
        if(rangeDateFinal !== "" && rangeDateFinalFinal !== "") filtred = filterDate(filtred, rangeDateFinal, rangeDateFinalFinal,"final_date");
        return filtred;
    } catch (error: any) {
        console.error(error.message);
        return tasks;
    }
};
function filterTaskWithTheme(task: ITask[], id_themes: string) {
  return task.filter(task => task.theme_id_fk == id_themes);
}
function filterDate(task: ITask[], rangeDateInitial:String, rangeDateInitialFinal:String,dataRef:string){
    return task.filter((task:any) => task[dataRef] >= rangeDateInitial && task[dataRef] <= rangeDateInitialFinal);
}
function userIndentity (task:ITask[], IdentityDataUser: Number, user_id: {id: Number}) {
    return task.filter(task => IdentityDataUser === 3 ? task : IdentityDataUser === 2 ? task.user_id !== user_id.id : task.user_id === user_id.id);
}
function priorityTask (task: ITask[], priority: string) {
    return task.filter(task => priority === '3' || task.priority.toString() === priority); 
}
function searchTask(tasks: ITask[], searchTerm: any) {
  if (!searchTerm) return tasks;
  const upperSearch = searchTerm.toUpperCase();
  return tasks.filter(task => task.description.toUpperCase().includes(upperSearch) || task.id.toString().toUpperCase().includes(upperSearch));
}