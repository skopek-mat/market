import { Component } from '@angular/core';
import { CurrencyComponent } from './curency/curency.component'; 
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
