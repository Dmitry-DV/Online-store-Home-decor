import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ProductType } from 'src/types/product.type';
import { CartService } from '../../services/cart.service';
import { CartType } from 'src/types/cart.type';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number | undefined = 0;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count).subscribe({
      next: (data: CartType) => {
        this.countInCart = this.count;
      },
    });
  }

  updataCount(value: number) {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe({
        next: (data: CartType) => {
          this.countInCart = this.count;
        },
      });
    }
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe({
      next: (data: CartType) => {
        this.countInCart = 0;
        this.count = 1;
      },
    });
  }
}
