import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { Subject } from 'rxjs';
import { HomeService } from './home.service';

export interface CurrencyItem {
  code: string;
  label: string;
  icon: string;
  type: string;
  rate: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  weather: any = null;
  error: string = '';
  currentTime = new Date();
  newYorkTime = new Date();
  londonTime = new Date();
  tokyoTime = new Date();
  currencies: CurrencyItem[] = [];
  goldData: number[] = [];
  goldLabels: string[] = [];
  goldChart: Chart | null = null;
  goldCurrentPrice: number | null = null;

  private _destroy$ = new Subject<void>();
  private _clockIntervalId: any;

  constructor(private router: Router, private homeService: HomeService) {}

  ngOnInit(): void {
    this._getWeather();
    this._updateClocks();
    this._loadRates();
    this._loadGoldData();

    this._clockIntervalId = setInterval(() => {
      this.currentTime = new Date();
      this._updateClocks();
    }, 60000);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();

    if (this._clockIntervalId) {
      clearInterval(this._clockIntervalId);
    }

    if (this.goldChart) {
      this.goldChart.destroy();
    }
  }

  goTo(type: string): void {
    this.router.navigate([`/${type}`]);
  }

  private _loadRates(): void {
    const cryptoKeys = ['bitcoin', 'dogecoin'];
    const cryptoRates: any[] = [];

    cryptoKeys.forEach(id => {
      const dataRaw = localStorage.getItem('crypto_' + id);
      if (!dataRaw) return;

      try {
        const parsed = JSON.parse(dataRaw);
        if (parsed.current) {
          cryptoRates.push(parsed.current);
        }
      } catch (e) {
        console.error(`Błąd parsowania danych crypto_${id}`);
      }
    });

    this.homeService.getCurrencyRatesFromNBP()
      .then(rates => {
        this.currencies = rates.map(cur => ({
          code: cur.code,
          label: cur.currency,
          icon: `https://flagcdn.com/w40/${cur.code.slice(0, 2).toLowerCase()}.png`,
          type: 'waluta',
          rate: `${cur.mid} PLN`
        }));

        cryptoRates.forEach(crypto => {
          this.currencies.push({
            code: crypto.symbol.toUpperCase(),
            label: crypto.name,
            icon: crypto.image,
            type: 'kryptowaluta',
            rate: `${crypto.current_price} USD`
          });
        });
      })
      .catch(err => {
        console.error('Błąd pobierania kursów walut:', err);
      });
  }

  private _loadGoldData(): void {
    this.homeService.getGoldRates()
      .then(goldPrices => {
        this.goldLabels = goldPrices.map(p => p.date);
        this.goldData = goldPrices.map(p => p.price);
        this.goldCurrentPrice = this.goldData[this.goldData.length - 1];
        this._renderGoldChart(this.goldLabels, this.goldData);
      })
      .catch(err => {
        console.error('Błąd pobierania danych złota:', err);
      });
  }

  private _renderGoldChart(labels: string[], data: number[]): void {
    if (this.goldChart) this.goldChart.destroy();

    setTimeout(() => {
      const canvas = document.getElementById('goldChart') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Nie znaleziono canvas dla wykresu złota.');
        return;
      }

      const trimmedLabels = labels.map((label, i) =>
        i === 0 || i === labels.length - 1 ? label : ''
      );

      this.goldChart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: trimmedLabels,
          datasets: [{
            label: 'Cena złota (PLN/1g)',
            data,
            borderColor: '#ffd700',
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (ctx) => `Data: ${labels[ctx[0].dataIndex]}`,
                label: (ctx) => `${ctx.formattedValue} PLN`
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#bbb',
                autoSkip: false,
                maxTicksLimit: 2
              },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#bbb' },
              grid: { color: 'rgba(255,255,255,0.05)' }
            }
          }
        }
      });
    }, 0);
  }

  private _updateClocks(): void {
    this.newYorkTime = this._getTimeInZone('America/New_York');
    this.londonTime = this._getTimeInZone('Europe/London');
    this.tokyoTime = this._getTimeInZone('Asia/Tokyo');
  }

  private _getTimeInZone(timeZone: string): Date {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const hour = +parts.find(p => p.type === 'hour')?.value!;
    const minute = +parts.find(p => p.type === 'minute')?.value!;

    const local = new Date();
    const zonedDate = new Date(local);
    zonedDate.setHours(hour, minute, 0, 0);

    return zonedDate;
  }

  private _getWeather(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;

        this.homeService.getCurrentWeather(latitude, longitude)
          .then(data => this.weather = data)
          .catch(() => this.error = 'Błąd pobierania pogody');
      });
    } else {
      this.error = 'Brak dostępu do lokalizacji';
    }
  }
}
