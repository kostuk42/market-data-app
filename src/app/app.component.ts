import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RestApiService } from './services/rest-api.service';
import { RealTimePriceComponent } from './components/real-time-price/real-time-price.component';
import { HistoricalChartComponent } from './components/historical-chart/historical-chart.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service'; // Import the AuthService class

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    RealTimePriceComponent,
    HistoricalChartComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Market Data App';
  instruments = [];
  chartData = [];

  constructor(private http: HttpClient,
     private authService: AuthService,
     private restApiService: RestApiService) {}

  ngOnInit(): void {
    this.authService.authenticate().subscribe((response: any) => {
        this.restApiService.setToken(response.access_token);
        this.restApiService.getInstruments('oanda').subscribe(data => {
            this.instruments = data.data;
            });
        this.restApiService.getChartData().subscribe(data => {
            this.chartData = data.data;
            console.log("data", data);
        })    
  });
  }

  
}
