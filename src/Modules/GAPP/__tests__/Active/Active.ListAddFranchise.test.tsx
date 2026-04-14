import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ListAddFranchise from "../../Active/Component/ListAddItem/ListAddFranchise";
import { Insurance } from "../../Active/Interfaces/Interfaces";

const baseInsurance: Partial<Insurance> = {
  franchise_list: {
    list: [
      { description: "Para-brisa",  value: "800"  },
      { description: "Vidro lateral", value: "300" },
    ],
  },
};

const defaultProps = {
  newItemText:    "",
  setNewItemText: jest.fn(),
  newValueText:   "",
  setNewValueText: jest.fn(),
  addItem:        jest.fn(),
  insuranceValues: baseInsurance,
  removeItem:     jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
describe("ListAddFranchise — renderização", () => {

  it("deve renderizar o título 'Franquias do Seguro'", () => {
    render(<ListAddFranchise {...defaultProps} />);
    expect(screen.getByText("Franquias do Seguro")).toBeInTheDocument();
  });

  it("deve exibir a descrição dos itens na tabela", () => {
    render(<ListAddFranchise {...defaultProps} />);
    expect(screen.getByText("Para-brisa")).toBeInTheDocument();
    expect(screen.getByText("Vidro lateral")).toBeInTheDocument();
  });

  it("deve exibir o valor dos itens na tabela", () => {
    render(<ListAddFranchise {...defaultProps} />);
    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
  });

  it("deve exibir badge com contagem correta", () => {
    render(<ListAddFranchise {...defaultProps} />);
    expect(screen.getByText(/2 itens/i)).toBeInTheDocument();
  });

  it("deve exibir badge no singular quando há 1 item", () => {
    const props = {
      ...defaultProps,
      insuranceValues: { franchise_list: { list: [{ description: "Para-brisa", value: "800" }] } },
    };
    render(<ListAddFranchise {...props} />);
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
  });

  it("deve exibir mensagem vazia quando não há franquias", () => {
    const props = { ...defaultProps, insuranceValues: { franchise_list: { list: [] } } };
    render(<ListAddFranchise {...props} />);
    expect(screen.getByText(/nenhuma franquia adicionada/i)).toBeInTheDocument();
  });

  it("não deve exibir badge quando lista está vazia", () => {
    const props = { ...defaultProps, insuranceValues: {} };
    render(<ListAddFranchise {...props} />);
    expect(screen.queryByText(/item/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("ListAddFranchise — interações", () => {

  it("deve chamar addItem ao clicar em Adicionar", () => {
    render(<ListAddFranchise {...defaultProps} />);
    fireEvent.click(screen.getByText(/adicionar/i));
    expect(defaultProps.addItem).toHaveBeenCalledTimes(1);
  });

  it("deve chamar setNewItemText ao digitar descrição", () => {
    render(<ListAddFranchise {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/para-brisa/i), { target: { value: "Farol" } });
    expect(defaultProps.setNewItemText).toHaveBeenCalledWith("Farol");
  });

  it("deve chamar setNewValueText ao digitar valor", () => {
    render(<ListAddFranchise {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/500,00/i), { target: { value: "1200" } });
    expect(defaultProps.setNewValueText).toHaveBeenCalledWith("1200");
  });

  it("deve chamar removeItem com índice correto ao clicar em Remover", () => {
    render(<ListAddFranchise {...defaultProps} />);
    const removeButtons = screen.getAllByTitle("Remover");
    fireEvent.click(removeButtons[0]);
    expect(defaultProps.removeItem).toHaveBeenCalledWith(0);
  });

  it("deve exibir os valores controlados nos inputs", () => {
    const props = { ...defaultProps, newItemText: "Farol", newValueText: "1200" };
    render(<ListAddFranchise {...props} />);
    expect((screen.getByPlaceholderText(/para-brisa/i) as HTMLInputElement).value).toBe("Farol");
    expect((screen.getByPlaceholderText(/500,00/i) as HTMLInputElement).value).toBe("1200");
  });
});
