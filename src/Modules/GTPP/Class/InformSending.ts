import { classToJSON } from "../../../Util/Util";

export default class InformSending {
    #error!: boolean;
    #user_id!: number;
    #task_id!: number;
    #type!: number;
    #object?: {};
    #itemUp?: number;
    #isItemUp?: boolean;

    constructor(
        error: boolean,
        user_id: number,
        task_id: number,
        type: number,
        object?: {},
        itemUp?: number,
        isItemUp?: boolean
    ) {
        this.#error = error;
        this.#user_id = user_id;
        if (object) this.#object = object;
        this.#task_id = task_id;
        this.#type = type;
        this.#itemUp = itemUp;
        this.#isItemUp = isItemUp;
    }

    // Getters para expor as propriedades privadas
    get error() {
        return this.#error;
    }

    get user_id() {
        return this.#user_id;
    }

    get object() {
        return this.#object;
    }

    get task_id() {
        return this.#task_id;
    }

    get type() {
        return this.#type;
    }

    get itemUp() {
        return this.#itemUp;
    }

    get isItemUp() {
        return this.#isItemUp;
    }
}