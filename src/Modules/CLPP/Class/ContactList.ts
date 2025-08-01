import User from "../../../Class/User";
import { fetchDataFull } from "../../../Util/Util";

export default class ContactList {
    #contacts: User[] = [];

    async loadListContacts(): Promise<{ error: boolean; message?: any; data?: any }> {
        try {
            let listFull: any = await fetchDataFull({ method: "GET", params: null, pathFile: 'CLPP/ChatLog.php', urlComplement: `&onChatLog=1` }) || { error: false, message: '' };
            if (listFull && listFull.error && !listFull.message.includes('No data')) throw new Error(listFull.message);
            this.#contacts = listFull.data.map((item: any) => {
                const user = new User({
                    id: item.sender_id,
                    name: item.name,
                    shop: item.store_name,
                    departament: item.departament_name,
                    photo: item.employee_photo,
                    sub: item.sub_dep_name,
                });
                user.yourContact = 1;
                return user;
            })
            return { error: false, data: this.#contacts }
        } catch (error) {
            return { error: true, message: error }
        }
    }


    async loadInfo(list: any[]): Promise<User[]> {
        const promises = list.map((item) => {
            const user = new User({ id: item.id, session: '', administrator: 0 });
            user.loadInfo(true);
            return user;
        });
        const results = await Promise.all(promises);
        return results;
    }

    checkYourContacts(list: any[]): void {
        list.forEach(item => {
            if (item.id_user) {
                this.#contacts.forEach(contact => {
                    if (contact.id == parseInt(item.id_user)) {
                        contact.yourContact = 1;
                        contact.notification = item.notification;
                    }
                });
            }
        });
    }

    changeYouListContact(id: number): void {
        this.#contacts.forEach(contact => {
            if (contact.id === id) {
                contact.yourContact = 1;
            }
        });
    }
}
