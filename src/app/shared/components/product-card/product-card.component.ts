import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
}
