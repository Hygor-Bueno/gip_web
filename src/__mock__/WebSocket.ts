export class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static clearInstances() {
    MockWebSocket.instances = [];
  }

  onopen: (() => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  sentMessages: any[] = [];

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send(data: any) {
    this.sentMessages.push(data);
  }

  close() {
    if (this.onclose) this.onclose();
  }

  simulateMessage(message: any) {
    if (this.onmessage) {
      const event = { data: JSON.stringify(message) } as MessageEvent;
      this.onmessage(event);
    }
  }

  simulateOpen() {
    if (this.onopen) this.onopen();
  }

  simulateClose() {
    if (this.onclose) this.onclose();
  }

  simulateError() {
    if (this.onerror) this.onerror(new Event("error"));
  }
}
