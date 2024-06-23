import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { WebsocketService, WS_CONFIG, WebSocketConfig } from './app/services/web-socket.service';

const wsConfig: WebSocketConfig = {
  url: 'wss://platform.fintacharts.com/api/streaming/ws/v1/realtime?token=your-token-here'
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations(), 
    { provide: WS_CONFIG, useValue: wsConfig },
    WebsocketService
  ]
});
