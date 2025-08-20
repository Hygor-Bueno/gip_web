import { Connection } from "../../../Connection/Connection";

export default class State{
    #stateId:number = 0;
    constructor(stateId:number){
        this.#stateId = stateId;
    }
    async getState(){
        const connection = new Connection('18');
        const req = await connection.get('',"GTPP/TaskState.php");
    }
}