export default class Translator {
    #messagePT = '';

    constructor(messagePT: string) {

        switch (this.validation(messagePT)) {
            case 'IS BROKEN':
                this.#messagePT = 'ERRO 400 - Certifique-se de que todos os campos foram preenchidos corretamente.';
                break;
            case 'This method is not allowed':
                this.#messagePT = 'ERRO 405 - Não foi possível executar os métodos.';
                break;
            case 'NO DATA':
                this.#messagePT = 'Falha ao realizar a ação, dados não encontrados.';
                break;
            case 'NO DATA TO UPDATE':
                this.#messagePT = 'Não houve alterações.';
                break;
            case 'Default password is not permited':
                this.#messagePT = 'Você será redirecionado para a página de alteração de senha.';
                break;
            case 'This password do is not match':
                this.#messagePT = 'Senha incorreta!';
                break;
            case 'SUCCESS':
                this.#messagePT = 'Ação realizada com sucesso.';
                break;
            case 'Value already exists':
                this.#messagePT = 'Falha! Item já foi cadastrado.';
                break;
            case 'Authorization denied':
                this.#messagePT = 'Autorização negada. Realize o login novamente.'
                break;
            case 'FOREIGN':
                this.#messagePT = 'Erro de chave estrangeira.'
                break;
            case 'Only administrator can do this':
                this.#messagePT = 'Somente o administrador pode fazer isso.'
                break;
            case 'Password require minimum 8 digits':
                this.#messagePT = "A senha deve conter no mínimo 8 dígitos.";
                break;
            case "Passwords don't match":
                this.#messagePT = "As senhas não conferem.";
                break;
            case "The final_date may not be less than the current date":
                this.#messagePT = "A data final não pode ser menor que a data atual.";
                break;
            case "Only administrator can do this":
                this.#messagePT = "Somente o administrador pode fazer isso.";
                break;
            default:
                this.#messagePT = messagePT;
                break;
        }
    }

    getMessagePT() {
        return this.#messagePT;
    }

    validation(messagePT: string) {
        let result = '';
        if (messagePT.toUpperCase().includes('IS BROKEN')) {
            result = 'IS BROKEN';
        }else if(messagePT.toUpperCase().includes('NO DATA TO UPDATE')){
            result = 'NO DATA TO UPDATE';
        } else if (messagePT.toUpperCase().includes('NO DATA')) {
            result = 'NO DATA';
        } else if (messagePT.toUpperCase().includes('SUCCESS')) {
            result = 'SUCCESS';
        } else if (messagePT.toUpperCase().includes('FOREIGN')) {
            result = 'FOREIGN';
        } else {
            result = messagePT;
        }
        return result;
    }

}
