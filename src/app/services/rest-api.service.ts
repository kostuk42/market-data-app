import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  private apiUrl = environment.apiUrl;
  private token!: string;

  constructor(private http: HttpClient) {}

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }

  getInstruments(provider: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/instruments/v1/instruments?provider=${provider}&kind=forex&symbol=EUR/USD&page=1&size=10`, { headers });
  }

  getProviders(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/instruments/v1/providers`, { headers });
  }

  getExchanges(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/exchanges/v1/exchanges`, { headers });
  }

  getChartData(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    return this.http.get<any>(`${this.apiUrl}/bars/v1/bars/date-range?instrumentId=ebefe2c7-5ac9-43bb-a8b7-4a97bf2c2576&provider=oanda&interval=1&periodicity=hour&startDate=2023-08-07&endDate=2023-08-08`, { headers });
  }
}
