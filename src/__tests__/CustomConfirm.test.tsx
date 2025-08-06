import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "../Components/CustomConfirm";

test('Rederiza o componente confirm modal para saber se ele existe!', () => {
    render(
        <ConfirmModal 
            message="test-01"
            onConfirm={jest.fn()}
            onClose={jest.fn()}
            title="teste"            
        />
    );
});


test('Rederiza o componente e verifica se ele tem algum titulo', () => {
    render(
        <ConfirmModal 
            title="confirm modal"            
            message="eu existo!"
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );

    const titleModal = screen.getByRole('heading', {name: /confirm modal/i});
    expect(titleModal).toBeInTheDocument();
});

test('O modal deve renderizar o titulo, a menssagem e os botões corretamente', () => {
    const titleText = "Titulo do modal";
    const messageText = "Esta é a messagem de confirmação";

    render(
        <ConfirmModal 
            title={titleText}
            message={messageText}
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );

    expect(screen.getByRole('heading', {name: titleText})).toBeInTheDocument();
    expect(screen.getByText(messageText)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /cancelar/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /confirmar/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /close/i})).toBeInTheDocument();
});

test('Os botões devem chamar as funções onConfirm e onClose corretamente', async () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();

    render(
        <ConfirmModal
            title="Título"
            message="Mensagem"
            onConfirm={handleConfirm}
            onClose={handleClose}
        />
    );

    /* Simulando os cliques dos botões pra saber se ta tudo certo! */

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    await userEvent.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).not.toHaveBeenCalled();

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(2);
});


test('A mensagem deve estar dentro do corpo do modal', () => {
    const messageText = "Esta é a mensagem de confirmação.";
    render(
        <ConfirmModal
            title="Título"
            message={messageText}
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );

    // O teste a seguir verifica se o texto da mensagem existe, mas não garante que está no lugar certo.
    expect(screen.getByText(messageText)).toBeInTheDocument();
});


test('Os botões de ação e o de fechar devem ter atributos de acessibilidade', () => {
    render(
        <ConfirmModal
            title="Exclusão"
            message="Tem certeza?"
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );

    // 1. Verifica se o botão "Confirmar" tem o atributo title correto
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    expect(confirmButton).toHaveAttribute('title', 'Confirmar ação');

    // 2. Verifica se o botão "Cancelar" tem o atributo title correto
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    expect(cancelButton).toHaveAttribute('title', 'Cancelar ação.');

    // 3. Verifica se o botão de fechar (x) tem o atributo aria-label correto
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toHaveAttribute('aria-label', 'Close');
});

// Esse teste vai criar um arquivo no diretório "__snapshots__"
// na primeira vez que você o rodar. Na próxima vez, ele apenas
// fará a comparação.
test('O modal deve corresponder ao snapshot visual', () => {
    const { asFragment } = render(
        <ConfirmModal
            title="Excluir item"
            message="Esta ação não poderá ser desfeita."
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );

    // asFragment() retorna a estrutura do DOM do componente
    // e o toMatchSnapshot() faz a comparação.

    /*
        Dica: Se você fizer uma mudança intencional no componente e o snapshot falhar, basta rodar o comando npm test -- -u ou yarn test -u para atualizar o snapshot.
    */
    expect(asFragment()).toMatchSnapshot();
});


test('O modal deve renderizar títulos e mensagens dinâmicas', () => {
    const customTitle = "Alerta de Segurança";
    const customMessage = "Por favor, confirme sua identidade para continuar.";
    
    render(
        <ConfirmModal
            title={customTitle}
            message={customMessage}
            onConfirm={jest.fn()}
            onClose={jest.fn()}
        />
    );
    
    // Verifica se o novo título está presente
    expect(screen.getByText('Alerta de Segurança')).toBeInTheDocument();
    
    // Verifica se a nova mensagem está presente
    expect(screen.getByText('Por favor, confirme sua identidade para continuar.')).toBeInTheDocument();
});


