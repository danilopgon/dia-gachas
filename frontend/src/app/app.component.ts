import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, PopoverModule],
  templateUrl: './app.component.html',
})
export class AppComponent {}
