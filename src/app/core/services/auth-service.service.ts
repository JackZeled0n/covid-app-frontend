import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLogged } from '../interfaces/login';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  userLogged: UserLogged;
  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(environment.developmentUrl + 'auth/login', data);
  }

  me(): Observable<any> {
    return this.http.get(environment.developmentUrl + 'auth/me');
  }

  register(data: any): Observable<any> {
    return this.http.post(environment.developmentUrl + 'users', data);
  }

  logout() {}
}
