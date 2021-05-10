import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Statistics } from '../../interfaces/statistics';
@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(private http: HttpClient) {}

  protected headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  getStatistics(): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(
      environment.developmentUrl + 'statistics'
    );
  }

  getByContinentName(continentName: string): Observable<Statistics[]> {
    return this.http.get<Statistics[]>(
      environment.developmentUrl +
        `statistics/by-continent-name?continentName=${continentName}`
    );
  }

  updateCases(body: any): Observable<any> {
    const data = JSON.stringify(body);
    return this.http.put<Statistics>(
      environment.developmentUrl + 'statistics/new-cases',
      data,
      {
        headers: this.headers,
      }
    );
  }
}
