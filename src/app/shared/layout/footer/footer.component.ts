import { Component, Input } from '@angular/core';
import { CategoryType } from 'src/types/category.type';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input() categories: CategoryType[] = [];
}
