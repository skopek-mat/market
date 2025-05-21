import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private endpoint = `https://gnews.io/api/v4/search?q=economic&apikey=4fe46dcffb03076e37be9be803685ca0`;

  constructor(private http: HttpClient) {}

  getNews(): Observable<any> {
    return this.http.get(this.endpoint);
  }
}
