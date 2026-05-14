let ws: WebSocket;


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
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.intentionalClose = false;
    try {
      const localWs = new WebSocket(`${process.env.REACT_APP_API_GIPP_BASE_WS}:${process.env.REACT_APP_API_GIPP_PORT_SOCKET_DEFAULT}`);
      ws = localWs;

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
      if (ws && ws.readyState !== WebSocket.CLOSED) ws.close();
    } catch {
      /* noop */
    }
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

  async informPreview(idSender: string): Promise<void> {
    const jsonString: { type: number; send_id: string } = {
      type: 3,
      send_id: idSender,
    };
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(jsonString));
  }

  informSending(type: number, send_id: string, message_id: string): void {
    const jsonString: { type: number; send_id: string; last_id: string } = {
      type,
      send_id,
      last_id: message_id,
    };
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(jsonString));
  }

  informSendingGroup(type: number, group_id: string, message_id: string): void {
    const jsonString: { type: number; group_id: string; last_id: string } = {
      type,
      group_id,
      last_id: message_id,
    };
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(jsonString));
  }
}
