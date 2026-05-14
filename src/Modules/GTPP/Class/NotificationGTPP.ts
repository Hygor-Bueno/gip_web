import User from "../../../Class/User";
import { CustomNotification, iStates } from "../../../Interface/iGIPP";
import { IGtppTaskSummary } from "../Context/types/gtppTypes";

export default class NotificationGTPP {
    list: CustomNotification[] = [];

    async loadNotify(array: any[], states?: iStates[], taskList?: IGtppTaskSummary[]) {
       for await (let element of array){
            //Ignora disparo do alerta quando um usuário faz login ou logout
            if(element.type != -1){
                const user = new User({ id: element.send_user_id });
                await user.loadInfo();
                const notify = this.filterTypeNotify(element, user.name || '', states, taskList);
                if (notify) {
                    this.list.push(notify);
                }
            }
        };
    }

    private formatTaskRef(taskId: number | undefined, taskList?: IGtppTaskSummary[]): string {
        if (!taskId) return '';
        const found = taskList?.find((t) => Number(t.id) === Number(taskId));
        const title = (found?.description ?? '').toString().trim();
        return title ? `#${taskId} ${title}` : `#${taskId}`;
    }

    filterTypeNotify(element: any, name: string, states?: iStates[], taskList?: IGtppTaskSummary[]): CustomNotification | null {
        let item: CustomNotification | null = { id: 0, title: '', message: '', task_id: 0, typeNotify: 'success' };
        const who = name.length <= 0 ? 'Usuário' : name;
        const taskRef = this.formatTaskRef(element.task_id, taskList);

        switch (parseInt(element.type)) {
            case 2: {
                item.id = element.object.itemUp ? parseInt(element.object.itemUp.id) : parseInt(element.object.id);
                item.task_id = element.task_id;
                const action = element.object.description
                    ? 'Alteração'
                    : element.object.note
                        ? 'Alteração na observação'
                        : 'Aviso observação ou descrição foram retirados';
                item.title = `${action} em ${taskRef} por ${who}`;
                item.message = element.object.itemUp ? element.object.itemUp.description : element.object.note;
                item.typeNotify = 'success';
                break;
            }
            case 5:
                item.id = parseInt(element.task_id);
                item.task_id = element.task_id;
                item.title = `${who} em ${taskRef}:`;
                item.message = element.object.description;
                item.typeNotify = 'info';
                break;
            case 6: {
                item.id = parseInt(element.task_id);
                item.task_id = element.task_id;
                const taskDesc = (element.object?.task?.description || '').toString().trim();
                const effectiveRef = taskDesc ? `#${element.task_id} ${taskDesc}` : taskRef;
                item.title = `${who} mudou o status de ${effectiveRef} para:`;
                item.message = this.filterStateName(element.object?.task?.state_id || element.object?.state_id, states);
                item.typeNotify = 'success';
                break;
            }
            case -1:
                item.title = `${name}`;
                item.message = `Acabou de ${element.state == 'connected' ? 'entrar' : 'sair'}`;
                item.typeNotify = 'info';
                break;
            case -3:
                item.id = parseInt(element.task_id);
                item.task_id = element.task_id;
                item.title = `${who} cancelou ${taskRef}`;
                item.message = element.object.description;
                item.typeNotify = 'danger';
                break;
            default:
                item = null; // tipo desconhecido — descarta
        }

        return item;
    }


    filterStateName(id: number, states?: iStates[]): string {
        let result: any = '';
        result = states?.filter((value: iStates) => value.id == id)[0]?.description
        return result;
    }
}
