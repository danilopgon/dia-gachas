import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InfoPopoverComponent } from './shared/info-popover/info-popover.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InfoPopoverComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
