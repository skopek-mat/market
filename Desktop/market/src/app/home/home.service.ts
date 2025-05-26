import { Injectable } from '@angular/core';

export interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
}

export interface CurrencyRate {
  currency: string;
  code: string;
  mid: number;
}

export interface GoldRate {
  date: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    return fetch(url)
      .then(res => res.json())
      .then(data => data.current_weather as WeatherData);
  }

  getCurrencyRatesFromNBP(): Promise<CurrencyRate[]> {
    const url = 'https://api.nbp.pl/api/exchangerates/tables/A/?format=json';
    return fetch(url)
      .then(res => res.json())
      .then((data: any[]) => {
        const table = data[0];
        return table.rates.filter((r: CurrencyRate) =>
          ['USD', 'EUR'].includes(r.code)
        );
      });
  }

  getGoldRates(): Promise<GoldRate[]> {
    const url = 'https://api.nbp.pl/api/cenyzlota/last/30/?format=json';
    return fetch(url)
      .then(res => res.json())
      .then((data: any[]) =>
        data.map((entry: any) => ({
          date: entry.data,
          price: entry.cena,
        } as GoldRate))
      );
  }
}
