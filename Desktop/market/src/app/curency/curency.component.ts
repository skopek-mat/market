import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService, ExchangeRate } from './currency.service';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-currency',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './curency.component.html',
  styleUrls: ['./curency.component.css'],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  exchangeRates: ExchangeRate[] = [];
  selectedCurrency: string = '';
  selectedCurrencyData: ExchangeRate | null = null;
  selectedRange: string = 'month';
  chart: any;
  error: string = '';
  showCurrencyList: boolean = false;

  fromCurrency: string = 'PLN';
  toCurrency: string = 'USD';
  fromAmount: number = 1;
  toAmount: number = 0;

  trendDirection: 'up' | 'down' | 'none' = 'none';
  trendChangePercent: number = 0;

  private destroy$ = new Subject<void>();

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.currencyService.getExchangeRates()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (rates) => {
          this.exchangeRates = rates;

          if (rates.length > 0) {
            this.setCurrency(rates[0].code);
            this.calculateToAmount();
          }
        },
        (error) => {
          this.error = error.message;
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.destroy();
    }
  }

  setCurrency(code: string): void {
    this.selectedCurrency = code;
    this.selectedCurrencyData = this.exchangeRates.find(rate => rate.code === code) || null;
    this.loadTrend();
    this.showCurrencyList = false;

    setTimeout(() => {
      this.loadChartData();
    }, 50);
  }

  toggleCurrencyList(): void {
    this.showCurrencyList = !this.showCurrencyList;
  }

  getRate(code: string): number {
    if (code === 'PLN') return 1;
    return this.exchangeRates.find(r => r.code === code)?.mid || 1;
  }

  getEffectiveRate(from: string, to: string): number {
    const fromRate = this.getRate(from);
    const toRate = this.getRate(to);
    return fromRate / toRate;
  }

  calculateToAmount(): void {
    const rate = this.getEffectiveRate(this.fromCurrency, this.toCurrency);
    this.toAmount = +(this.fromAmount * rate).toFixed(4);
  }

  calculateFromAmount(): void {
    const rate = this.getEffectiveRate(this.toCurrency, this.fromCurrency);
    this.fromAmount = +(this.toAmount * rate).toFixed(4);
  }

  getFlagUrl(code: string): string {
    if(code !== "XDR"){
    return `https://flagcdn.com/w40/${code.slice(0, 2).toLowerCase()}.png`;

    }else{
          return `https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/IMF-Seal_ENG_RGB.svg/1024px-IMF-Seal_ENG_RGB.svg.jpg`;

    }
  }

  loadTrend(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const hour = today.getHours();
    const dateToUse = hour >= 12 ? today : yesterday;

    const todayStr = dateToUse.toISOString().split('T')[0];
    const yesterdayStr = new Date(dateToUse);
    yesterdayStr.setDate(dateToUse.getDate() - 1);
    const yesterdayFormatted = yesterdayStr.toISOString().split('T')[0];

    this.currencyService.getHistoricalRates(this.selectedCurrency, yesterdayFormatted, todayStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          if (data.length >= 2) {
            const [older, newer] = data;
            const change = ((newer.mid - older.mid) / older.mid) * 100;
            this.trendChangePercent = +change.toFixed(2);
            this.trendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'none';
          } else {
            this.trendDirection = 'none';
          }
        },
        (error) => {
          this.trendDirection = 'none';
          this.trendChangePercent = 0;
        }
      );
  }

  loadChartData(): void {
    const endDate = new Date();
    let startDate = new Date();

    switch (this.selectedRange) {
      case 'week': startDate.setDate(endDate.getDate() - 7); break;
      case 'month': startDate.setDate(endDate.getDate() - 30); break;
      case '3m': startDate.setDate(endDate.getDate() - 90); break;
      case 'year': startDate.setFullYear(endDate.getFullYear() - 1); break;
    }

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    this.currencyService.getHistoricalRates(this.selectedCurrency, start, end)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const labels = data.map(rate => rate.effectiveDate);
          const values = data.map(rate => rate.mid);
          this.renderChart(labels, values);
        },
        (error) => {
          this.error = error.message;
        }
      );
  }

  renderChart(labels: string[], data: number[]): void {
    let borderColor = '#00ff88';
    let backgroundColor = 'rgba(0, 255, 136, 0.1)';

    if (this.trendDirection === 'down') {
      borderColor = '#ff4d4d';
      backgroundColor = 'rgba(255, 77, 77, 0.1)';
    } else if (this.trendDirection === 'none') {
      borderColor = '#cccccc';
      backgroundColor = 'rgba(200, 200, 200, 0.05)';
    }

    if (this.chart) this.chart.destroy();
    const ctx = document.getElementById('currencyChart') as HTMLCanvasElement;

    const trimmedLabels = labels.map((l, i) => i === 0 || i === labels.length ? l : '');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Kurs ${this.selectedCurrency}`,
          data,
          borderColor,
          backgroundColor,
          tension: 0.3,
          pointRadius: 0,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (ctx) => `Data: ${ctx[0].label}`,
              label: (ctx) => `Kurs: ${ctx.formattedValue}`
            }
          },
          legend: {
            display: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          x: {
            ticks: {
              color: '#bbb',
              autoSkip: true,
              maxTicksLimit: 2
            },
            grid: {
              display: false
            }
          },
          y: {
            ticks: {
              color: '#bbb'
            },
            grid: {
              color: 'rgba(255,255,255,0.05)'
            }
          }
        }
      }
    });
  }
}
