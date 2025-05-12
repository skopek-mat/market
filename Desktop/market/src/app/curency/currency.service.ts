import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  constructor(private http: HttpClient) {}

  getExchangeRatesForTwoDays(): Observable<any> {
    const today = new Date();
    const [endDate, startDate] = this.GetDays(today);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const todayRatesRequest = this.Rates(startStr, endStr);
    const yesterdayRatesRequest = this.Rates(startStr, endStr);

    return forkJoin([todayRatesRequest, yesterdayRatesRequest]).pipe(
      map(([todayRates, yesterdayRates]) => {
        return {
          todayRates,
          yesterdayRates
        };
      }),
      catchError(() => {
        return of({ todayRates: [], yesterdayRates: [] });
      })
    );
  }

   Rates(startDate: string, endDate: string): Observable<any> {
    const currencies = [
      'USD', 'AUD', 'CAD', 'EUR', 'HUF', 'CHF', 'GBP', 'JPY', 'CZK', 'DKK', 'NOK', 'SEK', 'XDR'
    ];

    const requests = currencies.map(currency => {
      const url = `https://api.nbp.pl/api/exchangerates/rates/C/${currency}/${startDate}/${endDate}/?format=json`;
      return this.http.get<any>(url).pipe(
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

  GetDays(referenceDate: Date): [Date, Date] {
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
