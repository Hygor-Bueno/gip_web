import { iUser } from "../Interface/iGIPP";
import { fetchDataFull } from "../Util/Util";

export default class User {
    #id: number;
    #yourContact?: number;
    #notification?: number;
    #pendingMessage?: number;
    #name?: string;
    #company?: string;
    #administrator: number = 0;
    #session: string = '';
    photo: string = '';
    shop: string = '';
    departament: string = '';
    sub: string = '';
    CSDS: string = '';
    
    constructor(user: iUser) {
        this.#id = user.id;
        if (user.administrator) this.#administrator = user.administrator;
        if (user.session) this.#session = user.session;

        // Optional properties
        this.#name = user.name;
        this.#company = user.company;
        if(user.photo) this.photo = user.photo;
        if(user.shop) this.shop = user.shop;
        if(user.departament) this.departament = user.departament;
        if(user.sub) this.sub = user.sub;
    }

    // Getter for id
    get id(): number {
        return this.#id;
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

    get name(): string | undefined {
        return this.#name;
    }

    set name(name: string | undefined) {
        this.#name = name;
    }

    get company(): string | undefined {
        return this.#company;
    }

    set company(company: string | undefined) {
        this.#company = company;
    }

    get administrator(): number {
        return this.#administrator;
    }

    set administrator(administrator: number) {
        this.#administrator = administrator;
    }

    get session(): string {
        return this.#session;
    }

    set session(session: string) {
        this.#session = session;
    }

    async loadInfo(isPhoto?: boolean): Promise<void> {
        isPhoto && await this.loadPhotos();
        await this.loadDetails();
    }

    async loadPhotos(): Promise<void> {
        try {
            const userPhoto: any = await fetchDataFull({method:"GET",params:null,pathFile:"CCPP/EmployeePhoto.php",urlComplement:`&id=${this.#id}`});
            if (userPhoto.error && !userPhoto.message.includes('No data')) {
                throw new Error(userPhoto.message);
            } else if (!userPhoto.message) {
                this.photo = userPhoto.photo;
            }
        } catch (error) {
            console.error(error);
        }
    }

    async loadDetails(): Promise<void> {
        try {
            const details: any = await fetchDataFull({method:"GET",params:null,pathFile:'CCPP/Employee.php',urlComplement:`&id=${this.#id}`});
            if (details.error && !details.message.includes('No data')) throw new Error(details.message);
            this.name = details.data[0]["name"];
            this.company = details.data[0]["company"];
            this.shop = details.data[0]["shop"];
            this.departament = details.data[0]["departament"];
            this.sub = details.data[0]["sub"];
            this.CSDS = details.data[0]["CSDS"];
            this.administrator = details.data[1]["administrator"];
        } catch (error) {
            console.error(error);
        }
    }
}
