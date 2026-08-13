import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule],
  templateUrl: './search-input.component.html',
})
export class SearchInputComponent {
  @Input() value = '';
  @Input() placeholder = 'Search...';
  @Output() valueChange = new EventEmitter<string>();
}
