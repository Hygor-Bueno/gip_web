export class Connection{
    #URL:string='';
    #params:string='';
    #pathFile:string='';
    #err:boolean = false;
    #appId:string='';
    #login:string='';
    #defaultPass:string='';

    constructor(appId:string,isLogin?:boolean,isDefaultPass?:boolean){
        this.#appId = appId;
        if(isLogin) this.#login = '&login=';
        // if(isDefaultPass) this.#defaultPass = '\login=';
    }

    async get(params:string, pathFile:string, err?:boolean) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=${this.#appId}&AUTH=`, params)
        let req;
        await fetch(this.#URL, {
            method: 'GET'
        }).then(response => response.json()) 
            .then(body => {
                if (body.error) throw new Error(body.message)
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        return req;
    }
    async post(params:{}, pathFile:string, err?:boolean) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=${this.#appId}${this.#login}&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'POST',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message);
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        return req;
    }
    async put(params:{}, pathFile:string, err?:boolean) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=${this.#appId}${this.#login}&AUTH=`)
        let req;
        await fetch(this.#URL, {
            method: 'PUT',
            body: JSON.stringify(this.#params)
        }).then(response => response.json())
            .then(body => {
                if (body.error) throw Error(body.message)
                req = body;
            }).catch(messageErr => {
                req = this.prepareCatchReturn(messageErr);
            })
        return req;
    }
    async delete(params:{}, pathFile:string, err?:boolean) {
        this.validationParams(params, pathFile, err);
        await this.settingUrl(`/Controller/${this.#pathFile}?app_id=${this.#appId}&AUTH=`);
        let req;
        await fetch(this.#URL, {
            method: "DELETE",
            body: JSON.stringify(this.#params)
        }).then((response) => response.json())
            .then((body) => {
                if (body.error) throw Error(body.message);
                req = body;
            }).catch((messageErr) => {
                req = this.prepareCatchReturn(messageErr);
            });
        return req;
    }
    validationParams(params:any, pathFile:string, err?:boolean) {
        if (params) this.#params = params;
        if (pathFile) this.#pathFile = pathFile;
        if (err) this.#err = err;
    }
    async settingUrl(middlewer: string, params?: string) {
        let server = "http://gigpp.com.br:72/GLOBAL"; //novo servidor
        // let server = "http://10.10.10.99:71/GLOBAL";
        let token = localStorage.getItem("tokenGIPP");
        this.#URL = server + middlewer + token + (params ? params : "");
    }
    prepareCatchReturn(messageErr:any) {
        return { "error": true, "message": messageErr["message"] }
    }
}