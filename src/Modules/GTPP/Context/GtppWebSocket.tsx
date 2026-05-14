class GtppWebSocket {
  private static instance: GtppWebSocket;
  private socket: WebSocket | null = null;
  public isConnected: boolean = false;
  private responseWebSocket: object | null = {};
  private dataResponseWebSocket: object | null | unknown[] = [];
  private pingIntervalRef: ReturnType<typeof setInterval> | null = null;
  private timeoutRef: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimeoutRef: ReturnType<typeof setTimeout> | null = null;
  private lastSentMessage: object | null = null;
  private intentionalClose: boolean = false;
  private reconnectAttempts: number = 0;
  private lastPingSentAt: number = 0;

  private static readonly PING_INTERVAL_MS = 30000;
  private static readonly PONG_TIMEOUT_MS = 8000;
  private static readonly RECONNECT_MAX_DELAY = 30000;
  private static readonly RECONNECT_MAX_ATTEMPTS = 10;

  private callbacks: Record<string, (event: MessageEvent) => void> = {};

  private constructor() {}

  public static getInstance(): GtppWebSocket {
    if (!GtppWebSocket.instance) {
      GtppWebSocket.instance = new GtppWebSocket();
    }
    return GtppWebSocket.instance;
  }

  public setCallback(key: string, callback: (event: MessageEvent) => void): void {
    this.callbacks[key] = callback;
  }

  public removeCallback(key: string) {
    delete this.callbacks[key];
  }

  connect(): void {
    if (this.isConnected || this.socket?.readyState === WebSocket.OPEN) return;
    if (this.socket?.readyState === WebSocket.CONNECTING) return;
    if (!localStorage?.tokenGIPP) return;

    this.intentionalClose = false;

    try {
      this.socket = new WebSocket(
        `${process.env.REACT_APP_API_GIPP_BASE_WS}:${process.env.REACT_APP_API_GIPP_PORT_SOCKET_SECONDARY}`
      );
    } catch (err) {
      console.error("Falha ao abrir WebSocket GTPP", err);
      this.scheduleReconnect();
      return;
    }

    const localWs = this.socket;

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.onOpen(localWs);
    };

    this.socket.onerror = (ev) => {
      console.error("Erro no WebSocket GTPP", ev);
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      this.stopPing();
      if (!this.intentionalClose) this.scheduleReconnect();
    };

    this.socket.onmessage = (ev) => {
      if (typeof ev.data === "string" && ev.data === "__pong__") {
        this.pong();
        return;
      }
      Object.values(this.callbacks).forEach((cb) => {
        try {
          cb(ev);
        } catch (err) {
          console.error("Callback GTPP WS lançou erro", err);
        }
      });
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeoutRef) return;
    if (this.reconnectAttempts >= GtppWebSocket.RECONNECT_MAX_ATTEMPTS) {
      console.warn("GTPP WS: limite de reconexões atingido");
      return;
    }
    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempts,
      GtppWebSocket.RECONNECT_MAX_DELAY
    );
    this.reconnectAttempts += 1;
    this.reconnectTimeoutRef = setTimeout(() => {
      this.reconnectTimeoutRef = null;
      this.connect();
    }, delay);
  }

  onOpen(localWs: WebSocket): void {
    const jsonString = {
      auth: localStorage.tokenGIPP,
      app_id: 18,
    };
    localWs.send(JSON.stringify(jsonString));
    this.startPing();
    this.isConnected = true;
  }

  private startPing(): void {
    this.stopPing();
    this.pingIntervalRef = setInterval(() => {
      this.ping();
    }, GtppWebSocket.PING_INTERVAL_MS);
  }

  private stopPing(): void {
    if (this.pingIntervalRef) {
      clearInterval(this.pingIntervalRef);
      this.pingIntervalRef = null;
    }
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
  }

  private ping(): void {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) return;
    this.lastPingSentAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    this.socket.send("__ping__");
    if (this.timeoutRef) clearTimeout(this.timeoutRef);
    this.timeoutRef = setTimeout(() => {
      console.warn("Timeout: não recebeu __pong__. Reabrindo conexão.");
      try {
        this.socket?.close();
      } catch {
        /* noop */
      }
    }, GtppWebSocket.PONG_TIMEOUT_MS);
  }

  private pong(): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
    if (this.lastPingSentAt > 0 && process.env.NODE_ENV === "development") {
      const rtt = Math.round(
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - this.lastPingSentAt
      );
      if (typeof window !== "undefined" && window.__gippPerf) {
        window.__gippPerf.markWs(rtt);
      }
    }
  }

  informSending(json: object) {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(json));
    }
  }

  public disconnect(): void {
    this.intentionalClose = true;
    this.stopPing();
    if (this.reconnectTimeoutRef) {
      clearTimeout(this.reconnectTimeoutRef);
      this.reconnectTimeoutRef = null;
    }
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        /* noop */
      }
    }
    this.socket = null;
    this.isConnected = false;
    this.callbacks = {};
    this.reconnectAttempts = 0;
  }

  public getResponseWebSocket(): object | null {
    return this.responseWebSocket;
  }

  public getDataResponseWebSocket(): object | null | unknown[] {
    return this.dataResponseWebSocket;
  }

  public getLastSentMessage(): object | null {
    return this.lastSentMessage;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export default GtppWebSocket;
