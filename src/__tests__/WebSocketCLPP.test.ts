// Importa um WebSocket mockado para simular comportamento real sem usar uma rede.
import { MockWebSocket } from '../__mock__/WebSocket';

// Importa a classe WebSocketCLPP que será testada.
import WebSocketCLPP from '../Services/Websocket';

// Substitui o WebSocket global pelo mock para interceptar e testar as chamadas sem conexão real.
(global as any).WebSocket = MockWebSocket;

describe('WebSocketCLPP', () => {
  // Token de autenticação fictício usado nos testes.
  const tokens = { token: 'test' };

  // Função simulada (mock) que será usada como callback quando o WebSocket receber mensagens.
  const mockCallback = jest.fn().mockResolvedValue(undefined);

  // Antes de cada teste, limpa os mocks e as instâncias do WebSocket.
  beforeEach(() => {
    jest.clearAllMocks();               // Limpa chamadas anteriores dos mocks.
    MockWebSocket.clearInstances();     // Limpa todas as instâncias do WebSocket simulado.
  });

  // Teste: Conectar com sucesso e enviar os dados de autenticação.
  it('deve conectar com sucesso e enviar dados de autenticação', () => {
    const client = new WebSocketCLPP(tokens, mockCallback); // Cria a instância do cliente.
    client.connectWebSocket(); // Chama o método que conecta ao WebSocket.

    const socket = MockWebSocket.instances[0]; // Pega a instância mockada do WebSocket.
    socket.simulateOpen(); // Simula a abertura da conexão WebSocket.

    // Verifica se uma mensagem foi enviada (autenticação).
    expect(socket.sentMessages.length).toBe(1);

    // Converte a mensagem enviada para JSON.
    const authData = JSON.parse(socket.sentMessages[0]);

    // Verifica se os dados de autenticação enviados são os mesmos fornecidos.
    expect(authData.auth).toEqual(tokens);

    expect(authData).toMatchSnapshot();

    // Verifica se a flag de conexão do cliente foi atualizada.
    expect(client.isConnected).toBe(true);
  });

  // Teste: Callback é chamado quando uma mensagem é recebida.
  it('deve chamar o callback ao receber mensagem', async () => {
    const client = new WebSocketCLPP(tokens, mockCallback);
    client.connectWebSocket();

    const socket = MockWebSocket.instances[0];
    socket.simulateOpen(); // Simula conexão aberta.

    // Cria uma mensagem simulada que será recebida.
    const testMessage = {
      objectType: 'test',
      user: 'user1',
      message: 'Mensagem de teste',
    };

    // Simula o recebimento de uma mensagem.
    await socket.simulateMessage(testMessage);

    // Verifica se o callback foi chamado com a mensagem recebida.
    expect(mockCallback).toHaveBeenCalledWith(testMessage);
  });

  // Teste: Reconectar automaticamente após desconexão.
  it('deve tentar reconectar ao fechar conexão', () => {
    jest.useFakeTimers(); // Usa timers falsos para controlar o tempo no teste.

    const client = new WebSocketCLPP(tokens, mockCallback);
    client.connectWebSocket();

    const socket = MockWebSocket.instances[0];
    socket.simulateClose(); // Simula o fechamento da conexão.

    // Verifica se a flag de conexão foi atualizada.
    expect(client.isConnected).toBe(false);

    // Avança o tempo simulado em 1000ms (1 segundo).
    jest.advanceTimersByTime(1000);

    // Verifica se uma nova instância do WebSocket foi criada (tentativa de reconexão).
    expect(MockWebSocket.instances.length).toBe(2);

    jest.useRealTimers(); // Restaura o uso de timers reais.
  });

  // Teste: Envio de mensagem via método informPreview().
  it('deve enviar mensagem ao chamar informPreview', () => {
    const client = new WebSocketCLPP(tokens, mockCallback);
    client.connectWebSocket();

    const socket = MockWebSocket.instances[0];
    socket.simulateOpen(); // Simula a abertura da conexão.

    client.informPreview('senderId'); // Chama o método que envia a mensagem tipo "preview".

    const sentData = JSON.parse(socket.sentMessages[1]); // Segunda mensagem enviada (primeira foi autenticação).

    // Verifica os dados da mensagem enviada.
    expect(sentData.type).toBe(3);
    expect(sentData.send_id).toBe('senderId');
  });

  // Teste: Envio de mensagem via método informSending().
  it('deve enviar mensagem ao chamar informSending', () => {
    const client = new WebSocketCLPP(tokens, mockCallback);
    client.connectWebSocket();

    const socket = MockWebSocket.instances[0];
    socket.simulateOpen(); // Simula a abertura da conexão.

    client.informSending(1, 'senderId', 'messageId'); // Envia uma mensagem com tipo 1.

    const sentData = JSON.parse(socket.sentMessages[1]);

    // Verifica os dados da mensagem.
    expect(sentData.type).toBe(1);
    expect(sentData.send_id).toBe('senderId');
    expect(sentData.last_id).toBe('messageId');
  });

  // Teste: Envio de mensagem via método informSendingGroup().
  it('deve enviar mensagem ao chamar informSendingGroup', () => {
    const client = new WebSocketCLPP(tokens, mockCallback);
    client.connectWebSocket();

    const socket = MockWebSocket.instances[0];
    socket.simulateOpen(); // Simula a abertura da conexão.

    client.informSendingGroup(2, 'groupId', 'messageId'); // Envia uma mensagem para grupo.

    const sentData = JSON.parse(socket.sentMessages[1]);

    // Verifica os dados da mensagem enviada para grupo.
    expect(sentData.type).toBe(2);
    expect(sentData.group_id).toBe('groupId');
    expect(sentData.last_id).toBe('messageId');
  });
});
