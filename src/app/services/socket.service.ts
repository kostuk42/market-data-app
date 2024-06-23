import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject$: Subject<any> = new Subject();
  public messages$: Observable<any> = this.messagesSubject$.asObservable();

  constructor() {}

  public connect(token: string): void {
    const webSocketUrl = `${environment.wsURL}${token}`;
    if (!this.socket$ || this.socket$.closed) {
        console.log('works  ' + webSocketUrl)
      this.socket$ = this.getNewWebSocket(webSocketUrl);
      this.socket$.subscribe(
        message => {
            console.log('WebSocket message received:', message);
            this.messagesSubject$.next(message)
        },
        error => {
            this.handleError(error);
            console.error('WebSocket connection error:', error)
        },
        () => console.warn('WebSocket connection closed')
      );
    }
  }

  private getNewWebSocket(url: string): WebSocketSubject<any> {
    return webSocket(url);
  }

  public sendMessage(msg: any): void {
    if (this.socket$) {
      this.socket$.next(msg);
    }
  }

  private handleError(error: any): void {
    console.error('WebSocket error occurred:', error);
    if (error instanceof CloseEvent) {
      console.error(`WebSocket close event. Code: ${error.code}, Reason: ${error.reason}, Was clean: ${error.wasClean}`);
    } else {
      console.error('An unknown WebSocket error occurred:', error);
    }
  }

  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
