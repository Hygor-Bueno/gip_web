import User from "../../../Class/User";
import { CustomNotification, iStates } from "../../../Interface/iGIPP";

export default class NotificationGTPP {
    list: CustomNotification[] = [];

    async loadNotify(array: any[], states?: iStates[]) {
        for await (let element of array){
            //Ignora disparo do alerta quando um usuário faz login ou logout
            if(element.type != -1){
                const user = new User({ id: element.send_user_id });
                await user.loadInfo();
                this.list.push(this.filterTypeNotify(element,user.name  || '', states));
            }
        };
    }

    filterTypeNotify(element: any, name:string ,states?: iStates[]): CustomNotification {
        let item: CustomNotification = { id: 0, title: '', message: '', task_id: 0, typeNotify:'success' };
        switch (parseInt(element.type)) {
            case 2:
                item.id = element.object.itemUp ? parseInt(element.object.itemUp.id) : parseInt(element.object.id);
                item.task_id = element.task_id
                item.title = `${element.object.description} por ${name}`
                item.message = element.object.itemUp ? element.object.itemUp.description : element.object.note;
                item.typeNotify = 'success';
                break;
            case 5:
                item.id = parseInt(element.task_id);
                item.task_id = element.task_id
                item.title = `${name}:`
                item.message = element.object.description;;
                item.typeNotify = 'info';
                break;
            case 6:
                item.id = parseInt(element.task_id);
                item.task_id = element.task_id
                item.title = `${name} mudou o status da tarefa ${element.object?.task?.description || ''} para:`
                item.message = this.filterStateName(element.object?.task?.state_id || element.object?.state_id, states);
                item.typeNotify = 'success';
                break;
            case -1:
                item.title = `${name}`
                item.message = `Acabou de ${element.state == "connected" ? 'entrar':'sair'}`;
                item.typeNotify = 'info';
                break;
            case -3:
                item.title = `${name}:`
                item.message = element.object.description;
                item.typeNotify = 'danger';
                break;
            default:
                break;
        }
        return item;
    }

    filterStateName(id: number, states?: iStates[]): string {
        let result: any = '';
        result = states?.filter((value: iStates) => value.id == id)[0]?.description
        return result;
    }
}