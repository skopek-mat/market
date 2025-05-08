import { Component } from '@angular/core';
import { CurrencyComponent } from './curency/curency.component'; 
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CurrencyComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
