import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ProductType } from 'src/types/product.type';
import { CartService } from '../../services/cart.service';
import { CartType } from 'src/types/cart.type';
import { FavoriteService } from '../../services/favorites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error == !undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      },
    });
  }

  updataCount(value: number) {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe({
        next: (data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error == !undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.countInCart = this.count;
        },
      });
    }
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error == !undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = 0;
        this.count = 1;
      },
    });
  }

  updateFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return;
    }

    if (this.product.isInFavorite) {
      this.favoriteService.removeFavorite(this.product.id).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            throw new Error(data.message);
          }
          this.product.isInFavorite = false;
        },
      });
    } else {
      this.favoriteService.addFavorite(this.product.id).subscribe({
        next: (data: FavoriteType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.isInFavorite = true;
        },
      });
    }
  }

  navigate() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }
}
