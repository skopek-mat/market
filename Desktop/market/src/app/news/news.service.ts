import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  content: string;
  source: {
    name: string;
    url: string;
  };
}

export interface NewsApiResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private _endpoint = 'https://gnews.io/api/v4/search?q=economic&apikey=4fe46dcffb03076e37be9be803685ca0';

  constructor(private http: HttpClient) {}

  getNews(): Observable<NewsApiResponse> {
    return this.http.get<NewsApiResponse>(this._endpoint);
  }
}
