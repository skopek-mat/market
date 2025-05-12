import { Routes } from '@angular/router';
import { CurrencyComponent } from './curency/curency.component';

export const routes: Routes = [
  {
    path: 'waluty',
    component: CurrencyComponent
  },
  {
    path: '',
    redirectTo: '/waluty',
    pathMatch: 'full'
  }
];
