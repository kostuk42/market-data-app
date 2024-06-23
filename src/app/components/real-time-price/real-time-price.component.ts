import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { WebsocketService, WS_CONFIG, WebSocketConfig } from '../../services/web-socket.service';
import { RestApiService } from '../../services/rest-api.service';
import { SocketService } from '../../services/socket.service';
import { Observable, of, switchMap } from 'rxjs';
import { PROVIDERS, SUBSCRIPTION_EXAMPLE } from '../../constants/constants';

@Component({
  selector: 'app-real-time-price',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './real-time-price.component.html',
  styleUrls: ['./real-time-price.component.css']
})
export class RealTimePriceComponent implements OnInit, OnChanges {
  symbol!: string | null;  
  price!: number | null;
  time!: string | null;
  form: FormGroup = this.fb.group({
    instrument: [''],
    provider: ['oanda']
  });
  currentSuscription: any
  @Input()instruments: any[] = [];
  providers = PROVIDERS;

  constructor(
    private fb: FormBuilder,
    private restApiService: RestApiService,
    @Inject(WS_CONFIG) private wsConfig: WebSocketConfig,
    private websocketService: WebsocketService,
    public socketService: SocketService
  ) {
    this.form = this.fb.group({
      instrument: [''],
      provider: ['simulation']
    });
    
  }

  ngOnInit(): void {
    this.form.get('provider')!.valueChanges.subscribe((val) => {
        if (val) {
            this.restApiService.getInstruments(val).subscribe(data => {
                console.log("data1", data)
                this.instruments = data.data;
                if(this.instruments[0]?.id){
                    this.form.patchValue({
                        instrument: this.instruments[0].id
                    });
                }
                
            });
        }
    })
  }

  ngOnChanges(): void {
    if(this.instruments.length > 0){
    this.form.patchValue({
        instrument: this.instruments[0].id
    });
   }
  }
  
  subscribe(): void {
    const { instrument, provider } = this.form.value;
    const token = this.restApiService.getToken();
    
    this.websocketService.connect(token)
    .pipe(
        switchMap(() => this.unsubscribe()),
        switchMap(() => {
            console.log("subscribe")
            this.currentSuscription = {
                ...SUBSCRIPTION_EXAMPLE,
                provider: provider,
                instrumentId: instrument
            }
            
              return this.websocketService.sendMessage(this.currentSuscription);
        }),
        switchMap(() => this.websocketService.on('l1-update', 'last'))
    ) 
    .subscribe((data) => this.handleEvent(data));
  }

  handleEvent(data: any): void {
    console.log("data event", data) 
    this.symbol = this.instruments.find((item) => item.id === data.instrumentId)?.symbol || 'No symbol';
    this.price = data.last.price;
    this.time = new Date(data.last.timestamp).toLocaleTimeString();
  }

  unsubscribe(): Observable<any> {
    this.price = this.symbol = this.time = null;
    return this.currentSuscription ? this.websocketService.sendMessage({...this.currentSuscription, subscribe: false}) : of(null);
  }


}
