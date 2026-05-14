interface NotifyMessage {
  objectType?: string;
  user?: string;
  message?: string;
  error?: boolean;
  send_user?: string;
  notify?: boolean;
  id?: number;
  type?: number;
  date?: string;
}

export default class WebSocketCLPP {
  isConnected: boolean = false;
  tokens: any;
  callbackOnMessage!: (notify: NotifyMessage) => Promise<void>;

  private socket: WebSocket | null = null;
  private intentionalClose: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimeoutRef: ReturnType<typeof setTimeout> | null = null;

  private static readonly RECONNECT_MAX_DELAY = 30000;
  private static readonly RECONNECT_MAX_ATTEMPTS = 10;

  constructor(
    tokens: any,
    callbackOnMessage: (notify: NotifyMessage) => Promise<void>
  ) {
    this.tokens = tokens;
    if (callbackOnMessage) this.callbackOnMessage = callbackOnMessage;
  }

  connectWebSocket(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.intentionalClose = false;
    try {
      const localWs = new WebSocket(
        `${process.env.REACT_APP_API_GIPP_BASE_WS}:${process.env.REACT_APP_API_GIPP_PORT_SOCKET_DEFAULT}`
      );
      this.socket = localWs;

      localWs.onopen = () => {
        this.reconnectAttempts = 0;
        this.onOpen(localWs);
      };

      localWs.onerror = (ev: Event) => {
        this.onError(ev);
      };

      localWs.onclose = () => {
        this.onClose();
      };

      localWs.onmessage = (ev: MessageEvent) => {
        this.onMessage(ev);
      };
    } catch (error) {
      console.error(error);
      this.scheduleReconnect();
    }
  }

  onOpen(localWs: WebSocket): void {
    const jsonString = {
      auth: this.tokens,
      app_id: 18,
    };
    localWs.send(JSON.stringify(jsonString));
    this.isConnected = true;
  }

  onError(ev: Event): void {
    console.error(ev);
  }

  onClose(): void {
    this.isConnected = false;
    if (this.intentionalClose) return;
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutRef) return;
    if (this.reconnectAttempts >= WebSocketCLPP.RECONNECT_MAX_ATTEMPTS) {
      console.warn("CLPP WS: limite de reconexões atingido");
      return;
    }
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      WebSocketCLPP.RECONNECT_MAX_DELAY
    );
    this.reconnectAttempts += 1;
    this.reconnectTimeoutRef = setTimeout(() => {
      this.reconnectTimeoutRef = null;
      this.connectWebSocket();
    }, delay);
  }

  public disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimeoutRef) {
      clearTimeout(this.reconnectTimeoutRef);
      this.reconnectTimeoutRef = null;
    }
    try {
      if (this.socket && this.socket.readyState !== WebSocket.CLOSED) this.socket.close();
    } catch {
      /* noop */
    }
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  async onMessage(ev: MessageEvent): Promise<void> {
    try {
      const getNotify: NotifyMessage = JSON.parse(ev.data);
      if (this.callbackOnMessage) await this.callbackOnMessage(getNotify);
    } catch (error) {
      console.error("Erro ao processar mensagem do WebSocket CLPP:", error);
    }
  }

  private sendIfOpen(payload: object): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  async informPreview(idSender: string): Promise<void> {
    this.sendIfOpen({ type: 3, send_id: idSender });
  }

  informSending(type: number, send_id: string, message_id: string): void {
    this.sendIfOpen({ type, send_id, last_id: message_id });
  }

  informSendingGroup(type: number, group_id: string, message_id: string): void {
    this.sendIfOpen({ type, group_id, last_id: message_id });
  }
}
