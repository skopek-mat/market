import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curency.component.html',
})
export class CurrencyComponent implements OnInit {
  exchangeRates: {
    [key: string]: {
      rate: number;
      change: number;
      flag: string;
    }
  } = {};
  error: string = '';

  ngOnInit(): void {
    this.fetchExchangeRates();
  }

  fetchExchangeRates(): void {
    const waluty = ['USD', 'EUR', 'GBP', 'CHF'];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    // const todayStr = "2025-05-08";
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    Promise.all(
      waluty.map(currency =>
        fetch(`https://api.nbp.pl/api/exchangerates/rates/A/${currency}/${yesterdayStr}/${todayStr}/?format=json`)
          .then(res => {
            // console.log(res.json())
            return res.json();
            
          })
          .then(data => {
            const rates = data.rates;
            const currentRate = rates[rates.length - 1].mid;
            const previousRate = rates.length > 1 ? rates[rates.length - 2].mid : currentRate;
            const change = (((currentRate - previousRate) / previousRate) * 100);

            this.exchangeRates[currency] = {
              rate: currentRate,
              change: change,
              flag: this.getFlagUrl(currency)
            };
            console.log(data)
          })
                    .catch(err => {
            console.error(err);
            this.exchangeRates[currency] = { rate: 0, change: 0, flag: '' };
            this.error = 'Brak danych';
            return 0;
          })
      )
    );
  }

  getFlagUrl(currency: string): string {
    const flags: { [key: string]: string } = {
      'USD': 'https://flagcdn.com/us.svg',
      'EUR': 'https://flagcdn.com/eu.svg',
      'GBP': 'https://flagcdn.com/gb.svg',
      'CHF': 'https://flagcdn.com/ch.svg'
    };
    return flags[currency] || '';
  }
}
