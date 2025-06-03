import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import GenericCardItem from "../GenericCardItem";

describe("GenericCardItem", () => {
    const mockItem: any = {
        name: "Teste",
        age: 30
    };

    const mockFields = [
        {label: "Nome", key: "name"},
        {label: "Idade", key: "age"}
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
        expect(screen.getByText("Teste")).toBeInTheDocument();
        expect(screen.getByText("Idade:")).toBeInTheDocument();
        expect(screen.getByText("30")).toBeInTheDocument();
    })

    test("deve chamar o recycle ao clicar no botão de reciclar", () => {
        const onRecycle = jest.fn();
        setup({onRecycle});

        const button = screen.getByLabelText("Reciclar");
    });
});


