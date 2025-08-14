import { iStates } from "../../../../Interface/iGIPP";

 export async function ReqTasks(admin?: boolean, setIsAdm?: any, setLoading?: any, fetchData?: any, setGetTask?: any) {
    try {
      setIsAdm(admin);
      setLoading(true);
      const getTask: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Task.php",
        urlComplement: `${admin ? "&administrator=1" : ""}`,
      });
      if (getTask.error) throw new Error(getTask.message);
      setGetTask(getTask.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

export async function GetTaskInformations(setLoading: any, fetchData: any, setTaskDetails: any, task: any): Promise<void> {
    try {
      setLoading(true);
      const getTaskItem: any = await fetchData({
        method: "GET",
        params: null,
        pathFile: "GTPP/Task.php",
        exception: ["no data"],
        urlComplement: `&id=${task.id}`,
      });
      if (getTaskItem.error) throw new Error(getTaskItem.message);
      setTaskDetails(getTaskItem);
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      setLoading(false);
    }
  }

export async function GetStateformations (setLoading: any, fetchData: any, createStorageState: any, updateStates: any) {
    setLoading(true);
    let listState: iStates[] = [{ id: 0, description: "", color: "" }];
    try {
      if (localStorage.gtppStates) {
        listState = JSON.parse(localStorage.gtppStates);
      } else {
        const getStatusTask: {
          error: boolean;
          message?: string;
          data?: [
            { id: number; description: string; color: string }
          ];
        } = await fetchData({
          method: "GET",
          pathFile: "GTPP/TaskState.php",
          params: null,
          exception: ["no data"],
          urlComplement: "",
        });
        if (getStatusTask.error)
          throw new Error(getStatusTask.message || "Error generic");
        const list = createStorageState(
          getStatusTask.data || [{ id: 0, description: "", color: "" }]
        );
        listState = list;
      }
    } catch (error) {
      console.error("Erro ao obter as informações da tarefa:", error);
    } finally {
      updateStates(listState);
      setLoading(false);
    }
  }