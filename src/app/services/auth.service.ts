import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RestApiService } from './rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string = '';

  constructor(private http: HttpClient) {}

  authenticate(): any {
    const body = new HttpParams()
      .set('client_id', 'app-cli')
      .set('grant_type', 'password')
      .set('username', 'r_test@fintatech.com')
      .set('password', 'kisfiz-vUnvy9-sopnyv');

      return this.http.post<any>(`${environment.baseUrl}/identity/realms/fintatech/protocol/openid-connect/token`, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      })
}

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string {
    return this.token;
  }
}
