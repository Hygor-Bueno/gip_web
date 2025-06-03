import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import GenericCardItem from "../GenericCardItem";
import { IFormData } from "../../Modules/GAPP/Business/Interfaces/IFormGender";


const mockSetLoading = jest.fn();
const mockFetchData = jest.fn(() => Promise.resolve());
const mockResetDataStore = jest.fn();
const mockSetData = jest.fn();
const mockSetHiddenForm = jest.fn();

const mockItem:any = {
    infraction: "Alta velocidade",
    points: 7,
    gravitity: "Grave",
    status_infraction: 1
};


const renderCardInfo:any = ({} = {}) => {
    render(
        <>
        </>
    );
};


describe("GenericCardItem", () => {
    const mockItem: IFormData = {
        city: "São paulo",
        cnpj: "21.637.482/0001-65", // CNPJ Gerado no site https://www.4devs.com.br/gerador_de_cnpj
        complement: "Bloco 5",
        district: "Interlagos - SP",
        name: "PegPese",
        number: "20",
        state: "SP",
        status_store: 1,
        street: "Rua teste de joao da silva",
        zip_code: "04428130",
        store_id: "1"
    };

    const mockFields: {label: string; key: keyof IFormData}[] = [
        {label: "Nome", key: "name"},
        {label: "Cidade", key: "city"},
        {label: "CNPJ", key: "cnpj"},
        {label: "Complemento", key: "complement"},
        {label: "Distrito", key: "district"},
        {label: "Numero", key: "number"},
        {label: "Estado", key: "state"},
        {label: "Estatos da Loja", key: "status_store"},
        {label: "CEP", key: "zip_code"},
        {label: "Numero da Identificacao da loja", key: "store_id"}
    ];

    const setup = (props = {}) => {
        return render(
            <GenericCardItem 
                item={mockItem}
                fields={mockFields}
                showRecycle
                showDelete
                showEdit
                {...props}
            />
        );
    }

    test("deve renderizar campos corretamente", () => {
        setup();
        expect(screen.getByText("Nome:")).toBeInTheDocument();
        expect(screen.getByText("Cidade:")).toBeInTheDocument();
        expect(screen.getByText("CNPJ:")).toBeInTheDocument();
        expect(screen.getByText("Complemento:")).toBeInTheDocument();
        expect(screen.getByText("Distrito:")).toBeInTheDocument();
        expect(screen.getByText("Numero:")).toBeInTheDocument();
        expect(screen.getByText("Estado:")).toBeInTheDocument();
        expect(screen.getByText("Estatos da Loja:")).toBeInTheDocument();
        expect(screen.getByText("CEP:")).toBeInTheDocument();
        expect(screen.getByText("Numero da Identificacao da loja:")).toBeInTheDocument();
    })

    test("deve chamar o recycle ao clicar no botão de reciclar", () => {
        const onRecycle = jest.fn();
        setup({onRecycle});

        const button = screen.getByLabelText("Reciclar");
        fireEvent.click(button);

        expect(onRecycle).toHaveBeenCalledWith(mockItem);
    });

    test("deve chamar onDelete ao clicar no botão de excluir", () => {
        const onDelete = jest.fn();
        setup({onDelete});

        const button = screen.getByLabelText("Excluir");
        fireEvent.click(button);

        expect(onDelete).toHaveBeenCalledWith(mockItem);
    });

    test("deve chamar onEdit ao clicar no botão de editar", () => {
        const onEdit = jest.fn();
        setup({onEdit});

        const button = screen.getByLabelText("Editar");
        fireEvent.click(button);

        expect(onEdit).toHaveBeenCalledWith(mockItem);
    })

    test("botão de reciclar deve estar desabilitado quando loading for true", () => {
        setup({loading: true});

        const button = screen.getByLabelText("Reciclar") as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    })
});

describe("GenericCardItem - visibilidade dos botões",() => {
    const mockItem: IFormData = {
        city: "São paulo",
        cnpj: "21.637.482/0001-65", // CNPJ Gerado no site https://www.4devs.com.br/gerador_de_cnpj
        complement: "Bloco 5",
        district: "Interlagos - SP",
        name: "PegPese",
        number: "20",
        state: "SP",
        status_store: 1,
        street: "Rua teste de joao da silva",
        zip_code: "04428130",
        store_id: "1"
    };

    const mockFields: {label: string; key: keyof IFormData}[] = [
        {label: "Nome", key: "name"},
        {label: "Cidade", key: "city"},
        {label: "CNPJ", key: "cnpj"},
        {label: "Complemento", key: "complement"},
        {label: "Distrito", key: "district"},
        {label: "Numero", key: "number"},
        {label: "Estado", key: "state"},
        {label: "Estatos da Loja", key: "status_store"},
        {label: "CEP", key: "zip_code"},
        {label: "Numero da Identificacao da loja", key: "store_id"}
    ];


    test("nao deve renderizar nenhum botão se show* form false ou não definidos", () => {
        render(
            <GenericCardItem<IFormData> 
                item={mockItem}
                fields={mockFields}
            />
        );

        expect(screen.queryByLabelText("Reciclar")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Excluir")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Editar")).not.toBeInTheDocument();
    });
});

describe("CardInfo", () => {
    describe("renderização básica", () => {
        test("deve exibir os cards corretamente", () => {
        
        });

        test("deve exibir mensagem quando não há dados", () => {

        });
    });

    test("deve exibir mensagem quando não há dados",() => {});

    describe("ações de usuário", () => {
        test("deve abrir modal ao clicar em excluir", () => {

        });

        test("deve executar API e reset ao confirmar exclusão", async () => {

        });

        test("deve chamar setData e setHiddenForm ao editar", () => {

        });

    });
    describe("filtros de busca", () => {
        test("deve filtrar por texto digitado", () => {

        });

        test("deve filtrar por gravidade e pontos", () => {

        });
    });

});
