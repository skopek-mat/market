
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ExchangeRate {
  code: string;
  currency: string;
  mid: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiBase = 'https://api.nbp.pl/api/exchangerates';

  constructor(private http: HttpClient) {}

  getExchangeRates(): Observable<ExchangeRate[]> {
    return this.http.get<any>('https://api.nbp.pl/api/exchangerates/tables/A?format=json').pipe(
      map((response: any[]) => response[0].rates)
    );
  }

  getHistoricalRates(code: string, start: string, end: string): Observable<{ effectiveDate: string; mid: number; }[]> {
    const url = `${this.apiBase}/rates/A/${code}/${start}/${end}/?format=json`;
    return this.http.get<any>(url).pipe(
      map(res => res.rates)
    );
  }
}
