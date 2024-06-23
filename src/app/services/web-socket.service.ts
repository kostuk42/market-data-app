import { Injectable, Inject, InjectionToken } from '@angular/core';
import { Observable, Observer, Subject, SubscriptionLike, interval } from 'rxjs';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/webSocket';
import { distinctUntilChanged, filter, map, share, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment'; 

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface IWsMessage<T> {
  type: string;
  data: T;
}

export interface IWebsocketService {
  on(type: string, kind: string): Observable<any>;
  sendMessage(data: any): void;
  connect(token: string): Observable<void>;
}

export const WS_CONFIG = new InjectionToken<WebSocketConfig>('ws.config');

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements IWebsocketService {
  private config: WebSocketSubjectConfig<IWsMessage<any>>;
  private websocketSub: SubscriptionLike;
  private statusSub: SubscriptionLike;
  private reconnection$: Observable<number> = interval(0);
  private websocket$!: WebSocketSubject<IWsMessage<any>> | null;
  private connection$!: Observer<boolean> | null;
  private wsMessages$: Subject<IWsMessage<any>> = new Subject<IWsMessage<any>>();
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private isConnected: boolean = false;
  public status: Observable<boolean>;
  private token!: string;  // Добавляем поле для хранения токена

  constructor(@Inject(WS_CONFIG) private wsConfig: WebSocketConfig) {
    this.reconnectInterval = wsConfig.reconnectInterval || 5000;
    this.reconnectAttempts = wsConfig.reconnectAttempts || 10;

    this.config = {
      url: wsConfig.url,
      closeObserver: {
        next: (event: CloseEvent) => {
          this.websocket$ = null;
          this.connection$!.next(false);
        }
      },
      openObserver: {
        next: (event: Event) => {
          console.log('WebSocket connected!');
          this.connection$!.next(true);
        }
      }
    };

    this.status = new Observable<boolean>((observer) => {
      this.connection$ = observer;
    }).pipe(share(), distinctUntilChanged());

    this.statusSub = this.status.subscribe((isConnected) => {
      this.isConnected = isConnected;

      if (!this.reconnection$ && typeof(isConnected) === 'boolean' && !isConnected) {
        this.reconnect(this.token);
      }
    });

    this.websocketSub = this.wsMessages$.subscribe(
      null, (error: ErrorEvent) => console.error('WebSocket error!', error)
    );
  }

  public connect(token: string): Observable<void> {
    this.token = token;  
    const webSocketUrl = `${environment.wsURL}${token}`;
    console.log('Connecting to WebSocket: ' + webSocketUrl);
    return new Observable<void>((observer) => {
        if (!this.websocket$ || this.websocket$.closed) {
            console.log('Connecting to WebSocket: ' + webSocketUrl);
            this.config.url = webSocketUrl;
            this.config.openObserver = {
                next: (event: Event) => {
                    console.log('WebSocket connected!');
                    this.connection$!.next(true);
                    observer.next();
                    observer.complete();
                }
            };

            this.websocket$ = new WebSocketSubject(this.config);

            this.websocket$.subscribe(
                message => {
                    this.wsMessages$.next(message);
                },
                error => {
                    this.handleError(error);
                    console.error('WebSocket connection error:', error);
                    observer.error(error); 
                },
                () => console.warn('WebSocket connection closed')
            );
        } else {
            observer.next();
            observer.complete();
        }
    });
}

  private getNewWebSocket(url: string): WebSocketSubject<IWsMessage<any>> {
    return new WebSocketSubject({
      url,
      closeObserver: {
        next: (event: CloseEvent) => {
          this.websocket$ = null;
          this.connection$!.next(false);
        }
      },
      openObserver: {
        next: (event: Event) => {
          console.log('WebSocket connected!');
          this.connection$!.next(true);
        }
      }
    });
  }

  private reconnect(token: string): void {
    this.reconnection$ = interval(this.reconnectInterval)
      .pipe(takeWhile((v, index) => index < this.reconnectAttempts && !this.websocket$));

    this.reconnection$.subscribe(
      () => this.connect(token).subscribe(),
      null,
      () => {
        if (!this.websocket$) {
          this.wsMessages$.complete();
          this.connection$!.complete();
        }
      }
    );
  }

  public sendMessage(data: any): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.websocket$ && this.websocket$.closed === false) {
        this.websocket$.next(data);
        console.log('WebSocket message sent:', data);
        observer.next();
        observer.complete();
      } else {
        console.error('WebSocket connection is closed or not established.');
        observer.error('WebSocket connection is closed or not established.');
      }
    });
  }

  public on(type: string, kind: string): Observable<any> {
    if (type) {
      return this.wsMessages$.pipe(
        filter((message: any) => message.type === type && message[kind]),
        map((message: any) => message)
      );
    }
    return new Observable<any>();
  }

  private handleError(error: any) {
    console.error('WebSocket error:', error);
  }
}
