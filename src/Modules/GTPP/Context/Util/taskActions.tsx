export async function CheckedItem(
  id: number,
  checked: boolean,
  idTask: any,
  taskLocal: any,
  fetchData: any,
  reloadPageChangeQuestion: any,
  reloadPagePercent: any,
  verifyChangeState: any,
  infSenCheckItem: any,
  setLoading: any,
  task: any,
  yes_no?: number
) {
  try {
    setLoading(true);
    const item = yes_no
      ? {
          id: parseInt(id.toString()),
          task_id: idTask.toString(),
          yes_no: parseInt(yes_no.toString()),
        }
      : { check: checked, id: id, task_id: idTask };
    let result: { error: boolean; data?: any; message?: string } =
      (await fetchData({
        method: "PUT",
        params: item,
        pathFile: "GTPP/TaskItem.php",
      })) || { error: false };
    if (result.error) throw new Error(result.message);
    if (!yes_no) taskLocal.check = checked;
    if (yes_no) reloadPageChangeQuestion(yes_no, id);
    reloadPagePercent(result.data, { task_id: idTask });
    await verifyChangeState(
      result.data.state_id,
      task.state_id,
      taskLocal,
      result.data
    );
    infSenCheckItem(taskLocal, result.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

export async function VerifyChangeState(
  newState: number,
  oldState: number,
  taskLocal: any,
  result: any,
  loadTasks: any,
  infSenStates: any
) {
  if (newState != oldState) {
    await loadTasks();
    infSenStates(taskLocal, result);
  }
}

export async function CheckTaskComShoDepSub(
  task_id: number,
  company_id: number,
  shop_id: number,
  depart_id: number,
  taskLocal: any,
  setLoading: any,
  fetchData: any,
  ws: any,
  userLog: any
) {
  setLoading(true);
  console.log("teste");
  try {
    await fetchData({
      method: "POST",
      urlComplement: "",
      pathFile: "GTPP/TaskComShoDepSub.php",
      exception: ["no data"],
      params: { task_id, company_id, shop_id, depart_id },
    });
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: {
        description: "A descrição completa da tarefa foi atualizada",
        task_id,
        company_id,
        shop_id,
        depart_id,
      },
      task_id: taskLocal,
      type: 2,
    });
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

export async function HandleAddTask(
  description: string,
  task_id: string,
  yes_no: number,
  fetchData: any,
  taskDetails: any,
  ws: any,
  userLog: any,
  reloadPagePercent: any,
  setTaskDetails: any,
  task: any,
  verifyChangeState: any,
  setLoading: any,
  file?: string
) {
  setLoading(true);
  try {
    const response: any = await fetchData({
      method: "POST",
      params: { description, file: file ? file : "", task_id, yes_no },
      pathFile: "GTPP/TaskItem.php",
    });
    if (response.error) throw new Error(response.message);
    const item = {
      id: response.data.last_id,
      description,
      check: false,
      task_id: parseInt(task_id),
      order: response.data.order,
      yes_no: response.data.yes_no,
      file: file ? 1 : 0,
      note: null,
    };
    if (taskDetails.data) {
      Array.isArray(taskDetails.data?.task_item)
        ? taskDetails.data?.task_item.push(item)
        : (taskDetails.data.task_item = [item]);
    }
    ws.current.informSending({
      user_id: userLog,
      object: {
        description: "Novo item adicionado",
        percent: response.data.percent,
        itemUp: item,
      },
      task_id,
      type: 2,
    });
    setTaskDetails({ ...taskDetails });
    reloadPagePercent(response.data, { task_id });
    if (task.state_id != response.data.state_id) {
      await verifyChangeState(
        response.data.state_id,
        task.state_id,
        { task_id: task.id },
        response.data
      );
    }
  } catch (error: any) {
    console.error("Error adding task:" + error.message);
  } finally {
    setLoading(false);
  }
}

export async function ChangeDescription(
  description: string,
  id: number,
  descLocal: string,
  fetchData: any,
  ws: any,
  userLog: any,
  setLoading: any
) {
  const response: any = await fetchData({
    method: "GET",
    params: "",
    pathFile: "GTPP/Task.php",
    urlComplement: ""
  });
  // procurar onde o texarear é desabilitado.
  const task = response.data.find((element: any) => element.id === id);
  try {
    if(task.description.length > 0) {
      setLoading(true);
      await fetchData ({method: "PUT", pathFile: "GTPP/Task.php", exception: ["no data"], params: { id, full_description: description }});
      ws.current.informSending({
        error: false,
        user_id: userLog.id,
        object: {
          description: "A descrição completa da tarefa foi atualizada",
          task_id: id,
          full_description: description,
        },
        task_id: descLocal,
        type: 3,
      });
    }
  } catch (error) {
    console.error("erro ao fazer o PUT em Task.php");
  } finally {
    setLoading(false);
  }
}

export async function UpdateItemTaskFile(
  file: string,
  item_id: number,
  fetchData: any,
  task: any
) {
  try {
    if (item_id) {
      const req: any = await fetchData({
        method: "PUT",
        pathFile: "GTPP/TaskItem.php",
        urlComplement: "",
        exception: ["no data"],
        params: { task_id: task.id, id: item_id, file },
      });
      if (req.error) throw new Error();
    }
  } catch (error: any) {
    console.error(error.message);
  }
}

export async function ChangeObservedForm(
  taskId: number,
  subId: number,
  value: string,
  isObservation: boolean,
  fetchData: any,
  getTaskInformations: any,
  ws: any,
  userLog: any,
  setLoading: any
) {
  setLoading(true);
  try {
    const item: any = { id: subId, task_id: taskId };
    item[isObservation ? "note" : "description"] = value;
    const response: any = await fetchData({
      method: "PUT",
      params: item,
      pathFile: "GTPP/TaskItem.php",
    });
    if (response.error) throw new Error(response.message);
    await getTaskInformations();
    ws.current.informSending({
      error: false,
      user_id: userLog.id,
      object: item,
      task_id: taskId,
      type: 2,
    });
  } catch (error) {
    console.error("Ocorreu um erro ao salvar a tarefa. Tente novamente.");
  } finally {
    setLoading(false);
  }
}

export async function UpdateStateTask(
  taskId: number,
  resource: string | null,
  date: string | null,
  fetchData: any,
  setLoading: any
) {
  setLoading(true);
  const req: any = (await fetchData({
    method: "PUT",
    params: {
      task_id: taskId,
      reason: resource,
      days: parseInt(date ? date : "0"),
    },
    pathFile: "GTPP/TaskState.php",
  })) || { error: false };
  setLoading(false);
  const response = req.error
    ? {}
    : req.data instanceof Array
    ? req.data[0].id
    : req.data.id;
  return response;
}

export async function StopAndToBackTask(
  taskId: number,
  resource: string | null,
  date: string | null,
  taskList: any,
  updateStateTask: any,
  setTask: any,
  task: any,
  upTask: any,
  addDays: any,
  closeCardDefaultGlobally: any,
  handleNotification: any
) {
  try {
    const taskState: any = await updateStateTask(taskId, resource, date);
    if (!taskState || taskState.error) {
      console.error("API Error - taskState:", taskState);
      throw new Error(
        taskState?.message || "Falha genérica ao atualizar o estado da tarefa."
      );
    }
    if (taskList.state_id == 5) {
      upTask(
        taskId,
        resource,
        date,
        taskList,
        `Tarefa que estava bloqueada está de volta!`,
        6,
        {
          description: "send",
          task_id: taskId,
          state_id: taskState,
          percent: task.percent || taskList.percent,
          new_final_date: addDays(parseInt(date || "0")),
        }
      );
    } else if (taskList.state_id == 4 || taskList.state_id == 6) {
      upTask(
        taskId,
        resource,
        date,
        taskList,
        taskList.state_id == 4 ? `send` : "send",
        6,
        { description: "send", task_id: taskId, state_id: taskState }
      );
    } else if (taskList.state_id == 1 || taskList.state_id == 2) {
      upTask(taskId, resource, date, taskList, "A tarefa foi parada!", 6, {
        description: "send",
        task_id: taskId,
        state_id: taskState,
      });
    } else if (taskList.state_id == 3) {
      upTask(taskId, resource, date, taskList, "A tarefa finalizada!", 6, {
        description: "send",
        task_id: taskId,
        state_id: taskState,
        percent: task.percent || taskList.percent,
      });
    }
    if (task.id && !isNaN(taskState)) {
      setTask((prevTask: any) => {
        const newState = {
          ...prevTask,
          state_id: taskState,
          percent: task.percent || prevTask.percent,
        };
        return newState;
      });
    }
    closeCardDefaultGlobally(taskId);
  } catch (error: any) {
    console.error(`[stopAndToBackTask] Caught error:`, error);
    handleNotification("Atenção!", error.message, "danger");
  }
}

export async function UpdatedForQuestion(
  item: { task_id: number; id: number; yes_no: number },
  setLoading: any,
  fetchData: any,
  taskDetails: any,
  itemUp: any,
  task: any,
  upTask: any
) {
  try {
    setLoading(true);
    const req: any = await fetchData({
      method: "PUT",
      params: item,
      pathFile: "GTPP/TaskItem.php",
    });
    if (req.error) throw new Error(req.message);
    const newItem = taskDetails.data?.task_item.filter(
      (element: any) => element.id == item.id
    );
    if (!newItem) throw new Error("Falha ao recuperar a tarefa");
    newItem[0].yes_no = item.yes_no;
    itemUp({ itemUp: newItem[0], id: item.task_id, percent: task.percent });
    await upTask(item.task_id, null, null, null, "Agora é um item comum", 2, {
      description:
        item.yes_no == 0
          ? "Alterado para um item comum"
          : "Alterado para questão ",
      percent: task.percent,
      itemUp: { ...newItem[0] },
      isItemUp: true,
    });
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}

export function AddUserTask(element: any, type: number, userLog: any, ws: any) {
  const info: {
    error: boolean;
    user_id: number;
    send_user_id: number;
    object: { description: string; changeUser?: number; task_id?: number };
    task_id: number;
    type: number;
  } = {
    error: false,
    user_id: element.user_id,
    send_user_id: userLog.id,
    object: {
      description:
        type === 5
          ? `${element.name} foi vinculado a tarefa`
          : `${element.name} foi removido da tarefa`,
    },
    task_id: element.task_id,
    type: type,
  };
  if (type === 5) info.object.changeUser = element.user_id;
  if (type === 5) info.object.task_id = element.task_id;
  ws.current.informSending(info);
}
