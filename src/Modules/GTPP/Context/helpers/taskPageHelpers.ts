import { iStates } from "../../../../Interface/iGIPP";
import { IStoredState } from "../types/gtppTypes";

export function createStorageState(list: iStates[]): IStoredState[] {
  const listState: IStoredState[] = [{ id: 0, description: "", color: "" }];
  list.forEach((element: iStates, index: number) => {
    const item: IStoredState = {
      id: element.id,
      description: element.description,
      color: element.color,
      active: true,
    };
    if (index === 0) {
      listState[0] = item;
    } else {
      listState.push(item);
    }
  });
  return listState;
}

export function addDays(daysToAdd: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split("T")[0];
}
