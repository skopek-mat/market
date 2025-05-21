import { Routes, RouterModule } from '@angular/router';
import { CurrencyComponent } from './curency/curency.component';  
import { CryptoComponent } from './crypto/crypto.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { NewsComponent } from './news/news.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
 

  {
    path: 'waluty',
    component: CurrencyComponent,
  },
   {
    path: 'kryptowaluty',
    component: CryptoComponent,
  },
  
  {
    path: 'wiadomosci',
    component: NewsComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '',
    component: HomeComponent,

    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule
      
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
