import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from './currency.service';

interface Rate {
  currency: string;
  code: string;
  bid: number;
  ask: number;
  change: number;
}

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curency.component.html',
  styleUrls: ['./curency.component.css']
})
export class CurrencyComponent implements OnInit {
  exchangeRates: {
    [code: string]: {
      rate: number;
      change: number;
      flag: string;
    }
  } = {};
  error = '';

   waluty: string[] = [
    'USD', 'AUD', 'CAD', 'EUR', 'HUF',
    'CHF', 'GBP', 'JPY', 'CZK', 'DKK',
    'NOK', 'SEK', 'XDR'
  ];

  private flagMap: { [key: string]: string } = {
    USD: 'https://flagcdn.com/us.svg',
    AUD: 'https://flagcdn.com/au.svg',
    CAD: 'https://flagcdn.com/ca.svg',
    EUR: 'https://flagcdn.com/eu.svg',
    HUF: 'https://flagcdn.com/hu.svg',
    CHF: 'https://flagcdn.com/ch.svg',
    GBP: 'https://flagcdn.com/gb.svg',
    JPY: 'https://flagcdn.com/jp.svg',
    CZK: 'https://flagcdn.com/cz.svg',
    DKK: 'https://flagcdn.com/dk.svg',
    NOK: 'https://flagcdn.com/no.svg',
    SEK: 'https://flagcdn.com/se.svg',
    XDR: 'https://flagcdn.com/un.svg' 
  };

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadRates();
  }

  loadRates(): void {
    this.currencyService.getExchangeRatesForTwoDays().subscribe(
      ({ todayRates, yesterdayRates }) => {
        for (const todayRate of todayRates) {
          const yesterdayRate = yesterdayRates.find((rate: Rate) => rate.currency === todayRate.currency);

          if (this.waluty.includes(todayRate.currency) && yesterdayRate) {
            const change = todayRate.change;
            this.exchangeRates[todayRate.currency] = {
              rate: todayRate.rate,
              change,
              flag: this.flagMap[todayRate.currency] || ''
            };
          }
        }
      },
      () => {
        this.error = 'Błąd podczas pobierania danych.';
      }
    );
  }
}
