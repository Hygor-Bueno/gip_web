import { useState } from "react";
import { iStates } from "../../../../Interface/iGIPP";
import { ApiResponse, ITheme } from "../../CreateTheme/ICreateTheme";
import { IStoredState } from "../types/gtppTypes";
import { createStorageState } from "../helpers/taskPageHelpers";
import { useMyContext } from "../../../../Context/MainContext";
import { useConnection } from "../../../../Context/ConnContext";

export function useGtppStates() {
  const [states, setStates] = useState<iStates[]>([{ color: "", description: "", id: 0 }]);
  const [themeList, setThemeList] = useState<ITheme[]>([]);

  const { setLoading } = useMyContext();
  const { fetchData } = useConnection();

  function updateStates(newList: IStoredState[]): void {
    localStorage.setItem("gtppStates", JSON.stringify(newList));
    setStates([...newList]);
  }

  function updateThemeList(newList: ITheme[]): void {
    localStorage.setItem("gtppThemeList", JSON.stringify(newList));
    setThemeList(newList);
  }

  async function getStateformations(): Promise<void> {
    setLoading(true);
    let listState: IStoredState[] = [{ id: 0, description: "", color: "" }];
    try {
      const stored = localStorage.getItem("gtppStates");
      if (stored) {
        listState = JSON.parse(stored) as IStoredState[];
      } else {
        const res = await fetchData({
          method: "GET",
          pathFile: "GTPP/TaskState.php",
          params: null,
          exception: ["no data"],
          urlComplement: "",
        }) as ApiResponse<iStates[]>;
        if (res.error) throw new Error(res.message ?? "Erro ao obter estados");
        listState = createStorageState(res.data ?? []);
      }
    } catch (error: unknown) {
      console.error(`Erro ao obter estados das tarefas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      updateStates(listState);
      setLoading(false);
    }
  }

  async function getThemeListformations(): Promise<void> {
    setLoading(true);
    try {
      const response = await fetchData({
        method: "GET",
        pathFile: "GTPP/Theme.php",
        params: null,
        urlComplement: "&user_theme=1",
        exception: ["No data"],
      }) as ApiResponse<ITheme[]>;
      if (response.error) throw new Error(response.message ?? "Erro ao carregar temas");
      const themes = Array.isArray(response.data) ? response.data : [];
      updateThemeList(themes);
    } catch (error: unknown) {
      console.error(`Erro ao carregar temas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    states, setStates,
    themeList, setThemeList,
    updateStates, updateThemeList,
    getStateformations, getThemeListformations,
  };
}
