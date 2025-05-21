import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewsService } from './news.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  articles: any[] = [];
  selectedArticle: any = null;

  private destroy$ = new Subject<void>(); 

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.newsService.getNews()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: (data) => {
          this.articles = data.articles;
        },
        error: () => {
          alert('Błąd ładowania newsów');
        }
      });
  }

  openArticle(article: any) {
    this.selectedArticle = article;
  }

  closeArticle() {
    this.selectedArticle = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
