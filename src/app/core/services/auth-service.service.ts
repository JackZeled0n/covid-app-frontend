import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  constructor(private http: HttpClient) {}

  login(data): Observable<any> {
    return this.http.post(environment.developmentUrl + 'auth/login', data);
  }

  register(data): Observable<any> {
    return this.http.post(environment.developmentUrl + 'users', data);
  }
}
