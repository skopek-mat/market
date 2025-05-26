import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewsService } from './news.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  content: string;
  source: {
    name: string;
    url: string;
  };
}

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  articles: NewsArticle[] = [];
  selectedArticle: NewsArticle | null = null;

  private _destroy$ = new Subject<void>();

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data) => {
          this.articles = data.articles;
        },
        error: () => {
          alert('Błąd ładowania newsów');
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  openArticle(article: NewsArticle): void {
    this.selectedArticle = article;
  }

  closeArticle(): void {
    this.selectedArticle = null;
  }
}
