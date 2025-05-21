import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface CryptoRate {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cacheDuration = 60 * 1000; 

  constructor(private http: HttpClient) {}

 
  getCryptos(): Observable<CryptoRate[]> {
    return this.http.get<CryptoRate[]>(`${this.baseUrl}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '20',
        page: '1',
        sparkline: 'false'
      }
    });
  }

 
  getHistoricalRates(id: string): Observable<{ prices: number[][] }> {
    return this.http.get<{ prices: number[][] }>(
      `${this.baseUrl}/coins/${id}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: '365',
          interval: 'daily'
        }
      }
    );
  }

  
  saveToLocalStorage(id: string, current: CryptoRate, historical: { prices: number[][] }): void {
    const key = `crypto_${id}`;
    const value = {
      timestamp: Date.now(),
      current,
      historical
    };
    localStorage.setItem(key, JSON.stringify(value));
  }

 
  loadFromLocalStorage(id: string): {
    timestamp: number;
    current: CryptoRate;
    historical: { prices: number[][] };
  } | null {
    const key = `crypto_${id}`;
    const raw = localStorage.getItem(key);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  
  isCachedFresh(id: string): boolean {
    const cached = this.loadFromLocalStorage(id);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheDuration;
  }
}
