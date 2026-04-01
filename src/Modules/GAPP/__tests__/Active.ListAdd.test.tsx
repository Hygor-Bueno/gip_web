import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ListAdd from "../Active/Component/ListAddItem/ListAdd";
import { ActiveFormValues } from "../Active/Interfaces/Interfaces";

const baseActive: ActiveFormValues = {
  brand: "Toyota",
  model: "Corolla",
  list_items: { list: ["Extintor", "Estepe"] },
};

const defaultProps = {
  newItemText: "",
  setNewItemText: jest.fn(),
  addItem: jest.fn(),
  activeValues: baseActive,
  removeItem: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
describe("ListAdd — renderização", () => {

  it("deve renderizar o título 'Itens Adicionais'", () => {
    render(<ListAdd {...defaultProps} />);
    expect(screen.getByText("Itens Adicionais")).toBeInTheDocument();
  });

  it("deve exibir os itens da lista", () => {
    render(<ListAdd {...defaultProps} />);
    expect(screen.getByText("Extintor")).toBeInTheDocument();
    expect(screen.getByText("Estepe")).toBeInTheDocument();
  });

  it("deve exibir badge com contagem de itens", () => {
    render(<ListAdd {...defaultProps} />);
    expect(screen.getByText(/2 itens/i)).toBeInTheDocument();
  });

  it("deve exibir badge no singular quando há 1 item", () => {
    const props = { ...defaultProps, activeValues: { ...baseActive, list_items: { list: ["Extintor"] } } };
    render(<ListAdd {...props} />);
    expect(screen.getByText(/1 item/i)).toBeInTheDocument();
  });

  it("deve exibir estado vazio quando não há itens", () => {
    const props = { ...defaultProps, activeValues: { ...baseActive, list_items: { list: [] } } };
    render(<ListAdd {...props} />);
    expect(screen.getByText(/nenhum item adicionado/i)).toBeInTheDocument();
  });

  it("não deve exibir badge quando lista está vazia", () => {
    const props = { ...defaultProps, activeValues: { ...baseActive, list_items: { list: [] } } };
    render(<ListAdd {...props} />);
    expect(screen.queryByText(/^\d+ itens?$/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("ListAdd — interações", () => {

  it("deve chamar addItem ao clicar em Adicionar", () => {
    render(<ListAdd {...defaultProps} />);
    fireEvent.click(screen.getByText(/adicionar/i));
    expect(defaultProps.addItem).toHaveBeenCalledTimes(1);
  });

  it("deve chamar setNewItemText ao digitar no input", () => {
    render(<ListAdd {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/extintor/i), { target: { value: "Macaco" } });
    expect(defaultProps.setNewItemText).toHaveBeenCalledWith("Macaco");
  });

  it("deve chamar removeItem com o índice correto ao clicar em Remover", () => {
    render(<ListAdd {...defaultProps} />);
    const removeButtons = screen.getAllByTitle("Remover");
    fireEvent.click(removeButtons[1]);
    expect(defaultProps.removeItem).toHaveBeenCalledWith(1);
  });

  it("deve exibir o valor do input controlado", () => {
    const props = { ...defaultProps, newItemText: "Triangulo" };
    render(<ListAdd {...props} />);
    const input = screen.getByPlaceholderText(/extintor/i) as HTMLInputElement;
    expect(input.value).toBe("Triangulo");
  });
});
