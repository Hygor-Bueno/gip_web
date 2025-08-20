class GtppWebSocket {
  private socket!: WebSocket;
  isConnected: boolean = false;
  private responseWebSocket: object | null = {};
  private dataResponseWebSocket: object | null | any[] = [];
  private pingIntervalRef: NodeJS.Timeout | null = null;
  private timeoutRef: NodeJS.Timeout | null = null;
  private lastSentMessage: object | null = null;
  callbackOnMessage!: (notify: any) => Promise<void>;

  // Função para conectar ao WebSocket

  connect(): void {

    if (localStorage?.tokenGIPP) {
      this.socket = new WebSocket("ws://gigpp.com.br:3333");
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
        this.callbackOnMessage(ev);
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
    if (this.pingIntervalRef) {
      clearInterval(this.pingIntervalRef);
    }

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

      if (this.timeoutRef) {
        clearTimeout(this.timeoutRef);
      }

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
