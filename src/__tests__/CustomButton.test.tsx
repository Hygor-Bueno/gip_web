import { render, screen } from "@testing-library/react";
import { CustomButton, InputCheckButton } from "../Components/CustomButton";
import userEvent from "@testing-library/user-event";

test('renderiza o botão e verifica se o botão tem um texto', () => {
    render(<CustomButton children="Clique aqui!" />);
    expect(screen.getByText('Clique aqui!')).toBeInTheDocument();
});

test('Chama a função ao clicar no botão', async () => {
    const mockclick = jest.fn();
    render(<CustomButton onClick={mockclick} children="Clique aqui!" />);
    const btn = screen.getByText("Clique aqui!");
    await userEvent.click(btn);
    expect(mockclick).toHaveBeenCalledTimes(1);
});

test('Verifica se consigo colocar uma className nesse componente', () => {
    render(<CustomButton customStyle="have-style" children="Clique aqui!" />);
    const btn = screen.getByText("Clique aqui!");
    expect(btn).toHaveClass('have-style');
});

test('Chama o botão checkbox e verifica se ele renderiza na tela', () => {
    const mockAction = jest.fn();
    render(<InputCheckButton inputId="name-test" onAction={mockAction} nameButton="Testing-checkbox" />);
});

test('Chama o botão checkbox e verifica se tem um nome nele', () => {
  const mockAction = jest.fn();

  render(
    <InputCheckButton
      inputId="name-test"
      labelText="Clique aqui!"
      onAction={mockAction}
      nameButton="Testing-checkbox"
    />
  );

  const btnCheck = screen.getByRole("button");

  expect(btnCheck).toHaveAttribute("title", "Testing-checkbox");
});

test('Clica na label e ativa o checkbox, chamando onAction', async () => {
    const mockAction = jest.fn();
    const user = userEvent.setup();

    render(
        <InputCheckButton
        inputId="name-test"
        labelText="Clique aqui!"
        onAction={mockAction}
        nameButton="Testing-checkbox"
        />
    );

    const label = screen.getByText('Clique aqui!');
    await user.click(label);
    expect(mockAction).toHaveBeenCalledWith(true);
});

test('Clica 2 vezes na label e altera valor do checkbox', async () => {
    const mockAction = jest.fn();
    const user = userEvent.setup();

    render (
        <InputCheckButton
            inputId="name-test"
            labelText="Clique aqui!"
            onAction={mockAction}
            nameButton="Testing-checkbox"
        />
    );

    const label = screen.getByText('Clique aqui!');

    await user.click(label);
    await user.click(label);

    expect(mockAction).toHaveBeenNthCalledWith(1, true);
    expect(mockAction).toHaveBeenNthCalledWith(2, false);
});

test('Verifica se o checkbox muda o estado visualmente', async () => {
    const mockAction = jest.fn();
    const user = userEvent.setup();

    render(
        <InputCheckButton
            inputId="name-test"
            labelText="Clique aqui!"
            onAction={mockAction}
            nameButton="Testing-checkbox"
        />
    );

    const checkbox = screen.getByLabelText('Clique aqui!');
    expect(checkbox).not.toBeChecked();


    await user.click(screen.getByText('Clique aqui!'));

    expect(checkbox).toBeChecked();
});

test('Verifica se o checkbox está desativado visualmente', async () => {
    const mockAction = jest.fn(); 

    render(
        <InputCheckButton
            inputId="name-test"
            labelText="Clique aqui!"
            onAction={mockAction}
            nameButton="Testing-checkbox"
        />
    );

    const labelckeckbox = screen.getByLabelText('Clique aqui!');
    expect(labelckeckbox).not.toBeChecked();
});

test('muda o icone ao alterar o checkbox', async () => {
    const user = userEvent.setup();

    render(
        <InputCheckButton
            inputId="name-test"
            labelText="icone!"
            onAction={jest.fn()}
            labelIconConditional={['icon-checked', 'icon-unchecked']}
            nameButton="Botão com ícone"
        />
    );

    const label = screen.getByText('icone!');

    expect(label).toHaveClass('icon-unchecked');

    await user.click(label);

    expect(label).toHaveClass('icon-checked');
});

test('muda o ícone estático se fornecido', () => {
    render(
        <InputCheckButton
            inputId="name-test"
            labelText="icone!"
            onAction={jest.fn()}
            labelIcon="icon-fixed"
            nameButton="Botão com ícone"
        />
    );

    const label = screen.getByText('icone!');
    expect(label).toHaveClass('icon-fixed');
});

test('altera cor do botão quando highlight está ativado e checkbox marcado', async () => {
    const user = userEvent.setup();
    render(
        <InputCheckButton
            inputId="name-test"
            labelText="Highlight test"
            onAction={jest.fn()}
            highlight={true}
            labelIcon="icon-fixed"
            nameButton="Botão com ícone"
        />
    );

    const label = screen.getByText('Highlight test');
    const button = screen.getByRole('button');

    expect(button).toHaveClass('btn-light');

    await user.click(label);

    expect(button).toHaveClass('btn-success');
});

test('aplica cor do texto definida por labelColor', () => {
  render(
    <InputCheckButton
      inputId="checkbox-color"
      labelText="Colorido"
      onAction={jest.fn()}
      labelColor="text-danger"
      nameButton="Botão"
    />
  );

  const label = screen.getByText('Colorido');
  expect(label).toHaveClass('text-danger');
});

test('não quebra se onAction lançar erro', async () => {
  const user = userEvent.setup();
  const mockAction = jest.fn().mockRejectedValue(new Error('Falha'));

  render(
    <InputCheckButton
      inputId="checkbox-error"
      labelText="Erro"
      onAction={mockAction}
      nameButton="Botão"
    />
  );

  const label = screen.getByText('Erro');
  await user.click(label);

  expect(mockAction).toHaveBeenCalled();
});
