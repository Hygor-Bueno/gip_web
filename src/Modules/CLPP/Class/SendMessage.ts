export default class SendMessage {
    #message: string = '';
    #id_user: number;
    #id_sender: number;
    #type: number;

    constructor(message?: string, id_user?: number, id_sender?: number, type?: number) {
        this.#message = message || '';
        this.#id_user = id_user || 0;
        this.#id_sender = id_sender || 0;
        this.#type = type || 0;
    }

    // Getters públicos
    public get message(): string {
        return this.#message;
    }

    public get id_user(): number {
        return this.#id_user;
    }

    public get id_sender(): number {
        return this.#id_sender;
    }

    public get type(): number {
        return this.#type;
    }


    public setMessage(value: string) {
        this.#message = value;
    }

    public setIdUser(value: number) {
        this.#id_user = value;
    }

    public setIdSender(value: number) {
        this.#id_sender = value;
    }

    public setType(value: number) {
        this.#type = value;
    }
}
