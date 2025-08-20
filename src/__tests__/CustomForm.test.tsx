import '@testing-library/jest-dom';
import { screen, render, fireEvent } from "@testing-library/react";
import CustomForm from "../Components/CustomForm";
import userEvent from "@testing-library/user-event";

jest.mock("../Components/CustomForm", () => ({
    ...jest.requireActual("../Components/CustomForm"),
    renderField: jest.fn(() => <div>Mocked Field</div>),
}));

const mockFieldsets = [{
    item: {
        label: "Nome",
        captureValue: {type: "text", name: 'nome'}
    }
}];

describe('CustomForm', () => {
    it("should render the form with fieldsets", () => {
        render(<CustomForm fieldsets={mockFieldsets}/>);

        const formElement = screen.getByRole('form');
        expect(formElement).toBeInTheDocument();

        expect(screen.getByText("Nome")).toBeInTheDocument();

        expect(screen.getByText('Mocked Field')).toBeInTheDocument();
    });
});
