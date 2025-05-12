import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService, SingleRate } from './currency.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curency.component.html',
  styleUrls: ['./curency.component.css']
})
export class CurrencyComponent implements OnInit, OnDestroy {
  exchangeRates: {
    [code: string]: {
      rate: number;
      change: number;
      flag: string;
    }
  } = {};

  error = '';
  private _subscription = new Subscription();

  waluty: string[] = [
    'USD', 'AUD', 'CAD', 'EUR', 'HUF',
    'CHF', 'GBP', 'JPY', 'CZK', 'DKK',
    'NOK', 'SEK', 'XDR'
  ];

  private _flagMap: { [key: string]: string } = {
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

  constructor(private _currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.loadRates();
  }

  loadRates(): void {
    const sub = this._currencyService.getExchangeRatesForTwoDays().subscribe(
      ({ todayRates, yesterdayRates }) => {
        for (const todayRate of todayRates) {
          const yesterdayRate = yesterdayRates.find((rate: SingleRate) => rate.currency === todayRate.currency);

          if (this.waluty.includes(todayRate.currency) && yesterdayRate) {
            this.exchangeRates[todayRate.currency] = {
              rate: todayRate.rate,
              change: todayRate.change,
              flag: this._flagMap[todayRate.currency] || ''
            };
          }
        }
      },
      () => {
        this.error = 'Błąd podczas pobierania danych.';
      }
    );

    this._subscription.add(sub);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
