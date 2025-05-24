import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, AutoCompleteModule, FloatLabelModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  search($event: AutoCompleteCompleteEvent) {
    throw new Error('Method not implemented.');
  }
  title = 'dia-gachas';
  items!: any[];
  value2: any;
}
