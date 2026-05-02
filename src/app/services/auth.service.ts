import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api2023.zerolite.in/api';

  constructor(private http: HttpClient) { }

  login(data: { viplcode: string; username: string; password: string; loginas: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }
}
