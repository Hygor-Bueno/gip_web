class GtppWebSocket {
  private static instance: GtppWebSocket;
  private socket!: WebSocket;
  public isConnected: boolean = false;
  private responseWebSocket: object | null = {};
  private dataResponseWebSocket: object | null | any[] = [];
  private pingIntervalRef: NodeJS.Timeout | null = null;
  private timeoutRef: NodeJS.Timeout | null = null;
  private lastSentMessage: object | null = null;
  
  private callbacks: { [key: string]: (notify: any) => void } = {};

  private constructor() {}

  public static getInstance(): GtppWebSocket {
    if (!GtppWebSocket.instance) {
      GtppWebSocket.instance = new GtppWebSocket();
    }
    return GtppWebSocket.instance;
  }

  public setCallback(key: string, callback: (notify: any) => void) {
    this.callbacks[key] = callback;
  }

  public removeCallback(key: string) {
    delete this.callbacks[key];
  }

  connect(): void {
    if (this.isConnected || this.socket?.readyState === WebSocket.OPEN) return;

    if (localStorage?.tokenGIPP) {
      this.socket = new WebSocket(`${process.env.REACT_APP_API_GIPP_BASE_WS}:${process.env.REACT_APP_API_GIPP_PORT_SOCKET_SECONDARY}`);
      const localWs = this.socket;
      
      this.socket.onopen = (ev) => {
        this.onOpen(localWs);
      };

      this.socket.onerror = (ev) => {
        console.error("Erro no WebSocket", ev);
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.stopPing();
      };

      this.socket.onmessage = (ev) => {
        if (ev.data.toString() === "__pong__") {
          this.pong();
          return;
        }
        
        Object.values(this.callbacks).forEach(callback => callback(ev));
      };
    }
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
    if (this.pingIntervalRef) clearInterval(this.pingIntervalRef);
    this.pingIntervalRef = setInterval(() => {
      this.ping();
    }, 10000);
  }

  private stopPing(): void {
    if (this.pingIntervalRef) {
      clearInterval(this.pingIntervalRef);
      this.pingIntervalRef = null;
    }
  }

  private ping(): void {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send("__ping__");
      if (this.timeoutRef) clearTimeout(this.timeoutRef);
      this.timeoutRef = setTimeout(() => {
        console.warn("Timeout: não recebeu __pong__");
      }, 5000);
    }
  }

  private pong(): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
  }

  informSending(json: object) {
    if (this.isConnected && this.socket) {
      this.socket.send(JSON.stringify(json));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.stopPing();
      this.socket.close();
      this.isConnected = false;
    }
  }

  public getResponseWebSocket(): object | null {
    return this.responseWebSocket;
  }

  public getDataResponseWebSocket(): object | null | any[] {
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