import { iContact } from "../Interface/iGIPP";
import User from "./User";

export default class Contact extends User{
    #yourContact?: number;
    #notification?: number;
    #pendingMessage?: number;
   
    constructor(contact: iContact) {
        super({id:contact.id})
        this.#yourContact = contact.yourContact;
        this.#notification = contact.notification;
        this.#pendingMessage = contact.pendingMessage;
    }

    // Optional properties' getters and setters
    get yourContact(): number | undefined {
        return this.#yourContact;
    }

    set yourContact(yourContact: number | undefined) {
        this.#yourContact = yourContact;
    }

    get notification(): number | undefined {
        return this.#notification;
    }

    set notification(notification: number | undefined) {
        this.#notification = notification;
    }

    get pendingMessage(): number | undefined {
        return this.#pendingMessage;
    }

    set pendingMessage(pendingMessage: number | undefined) {
        this.#pendingMessage = pendingMessage;
    }
}
