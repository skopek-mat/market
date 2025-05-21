import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { CryptoService, CryptoRate } from './crypto.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-crypto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crypto.component.html',
  styleUrls: ['./crypto.component.css'],
})
export class CryptoComponent implements OnInit, OnDestroy {
  cryptos: CryptoRate[] = [];
  selectedCrypto: CryptoRate | null = null;
  selectedRange = '30';
  chart: any;

  private destroy$ = new Subject<void>();

  constructor(private cryptoService: CryptoService) {}

  ngOnInit(): void {
    this.loadAllFromLocalStorage();

    if (this.cryptos.length > 0) {
      this.setCrypto(this.cryptos[0]);
    }

    this.cryptoService.getCryptos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((apiList) => {
        this.rotationalFetchAndStore(apiList);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.destroy();
    }
  }

  loadAllFromLocalStorage(): void {
    this.cryptos = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('crypto_')) continue;

      const data = this.cryptoService.loadFromLocalStorage(key.replace('crypto_', ''));
      if (data && data.current) {
        this.cryptos.push(data.current);
      }
    }

    this.cryptos.sort((a, b) => a.name.localeCompare(b.name));
  }

  rotationalFetchAndStore(apiList: CryptoRate[]): void {
    const rotationKey = 'crypto_rotation_index';
    const index = +(localStorage.getItem(rotationKey) || '0');
    const chunkSize = 3;
    const total = apiList.length;

    let start = index;
    if (start >= total) start = 0;

    const chunk = apiList.slice(start, start + chunkSize);

    chunk.forEach((crypto) => {
      this.cryptoService.getHistoricalRates(crypto.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((historical) => {
          this.cryptoService.saveToLocalStorage(crypto.id, crypto, historical);
          this.loadAllFromLocalStorage();
        });
    });

    localStorage.setItem('crypto_rotation_index', ((start + chunkSize) % total).toString());
  }

  setCrypto(crypto: CryptoRate): void {
    this.selectedCrypto = crypto;
    this.loadChartData();
  }

  loadChartData(): void {
    if (!this.selectedCrypto) return;

    const cached = this.cryptoService.loadFromLocalStorage(this.selectedCrypto.id);
    if (!cached) return;

    const filtered = this.filterHistoricalDataByDays(cached.historical.prices, +this.selectedRange);

    const labels = filtered.map(p => new Date(p[0]).toLocaleDateString());
    const values = filtered.map(p => p[1]);

    this.renderChart(labels, values);
  }

  filterHistoricalDataByDays(prices: number[][], days: number): number[][] {
    return prices.slice(-days);
  }

  renderChart(labels: string[], data: number[]): void {
    if (this.chart) this.chart.destroy();

    const ctx = document.getElementById('currencyChart') as HTMLCanvasElement;

    const trimmedLabels = labels.map((label, i) =>
      i === 0 || i === labels.length - 1 ? label : ''
    );

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trimmedLabels,
        datasets: [{
          label: `${this.selectedCrypto?.name} price`,
          data,
          borderColor: '#00bfff',
          backgroundColor: 'rgba(0, 191, 255, 0.1)',
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
              title: (ctx) => {
                const index = ctx[0].dataIndex;
                return `Data: ${labels[index]}`;
              },
              label: (ctx) => `$${ctx.formattedValue}`
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
  }
}
