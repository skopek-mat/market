import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SingleRate {
  currency: string;
  rate: number;
  change: number;
}

export interface ExchangeRatesResponse {
  todayRates: SingleRate[];
  yesterdayRates: SingleRate[];
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(private _http: HttpClient) {}

  getExchangeRatesForTwoDays(): Observable<ExchangeRatesResponse> {
    const today = new Date();
    const [endDate, startDate] = this.getdays(today);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const todayRatesRequest = this.rates(startStr, endStr);
    const yesterdayRatesRequest = this.rates(startStr, endStr); // Można zoptymalizować

    return forkJoin([todayRatesRequest, yesterdayRatesRequest]).pipe(
      map(([todayRates, yesterdayRates]) => ({
        todayRates,
        yesterdayRates
      })),
      catchError(() => {
        return of({ todayRates: [], yesterdayRates: [] });
      })
    );
  }

  rates(startDate: string, endDate: string): Observable<SingleRate[]> {
    const currencies = [
      'USD', 'AUD', 'CAD', 'EUR', 'HUF', 'CHF', 'GBP',
      'JPY', 'CZK', 'DKK', 'NOK', 'SEK', 'XDR'
    ];

    const requests = currencies.map(currency => {
      const url = `https://api.nbp.pl/api/exchangerates/rates/C/${currency}/${startDate}/${endDate}/?format=json`;
      return this._http.get<any>(url).pipe(
        map(data => {
          const rates = data.rates;
          const currentRate = rates[rates.length - 1]?.bid ?? 0;
          const previousRate = rates.length > 1 ? rates[rates.length - 2]?.bid : currentRate;
          const change = previousRate ? ((currentRate - previousRate) / previousRate) * 100 : 0;
          return {
            currency,
            rate: currentRate,
            change
          };
        }),
        catchError(() => of({ currency, rate: 0, change: 0 }))
      );
    });

    return forkJoin(requests);
  }

  getdays(referenceDate: Date): [Date, Date] {
    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

    const dates: Date[] = [];
    let current = new Date(referenceDate);

    while (dates.length < 2) {
      current.setDate(current.getDate() - 1);
      if (!isWeekend(current)) {
        dates.unshift(new Date(current));
      }
    }

    return [dates[1], dates[0]];
  }
}
