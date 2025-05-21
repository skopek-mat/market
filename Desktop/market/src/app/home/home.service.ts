import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  getCurrentWeather(latitude: number, longitude: number): Promise<any> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    return fetch(url)
      .then(res => res.json())
      .then(data => data.current_weather);
  }

  getCurrencyRatesFromNBP(): Promise<any[]> {
    const url = 'https://api.nbp.pl/api/exchangerates/tables/A/?format=json';
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        const table = data[0];
        return table.rates.filter((r: any) => ['USD', 'EUR'].includes(r.code));
      });
  }

  getGoldRates(): Promise<{ date: string; price: number }[]> {
    const url = 'https://api.nbp.pl/api/cenyzlota/last/30/?format=json';
    return fetch(url)
      .then(res => res.json())
      .then(data => data.map((entry: any) => ({
        date: entry.data,
        price: entry.cena
      })));
  }
}
