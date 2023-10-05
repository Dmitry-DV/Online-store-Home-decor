import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { FavoriteService } from 'src/app/shared/services/favorites.service';
import { environment } from 'src/environments/environment.development';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss'],
})
export class FavoriteComponent implements OnInit {
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;

  constructor(private favoriteService: FavoriteService, private cartService: CartService) {}

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = data as FavoriteType[];

        this.cartService.getCart().subscribe({
          next: (cartData: CartType | DefaultResponseType) => {
            if ((cartData as DefaultResponseType).error == !undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }

            const cartDataResponse = cartData as CartType;
            if (cartDataResponse) {
              this.products.forEach(product => {
                const favoriteProductInCart = cartDataResponse.items.find(itemCart => itemCart.product.id === product.id);
                if (favoriteProductInCart) {
                  product.countInCart = favoriteProductInCart.quantity;
                }
              });
            }
          },
        });
      },
    });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id).subscribe({
      next: (data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }

        this.products = this.products.filter(item => item.id !== id);
      },
    });
  }

  addToCart(product: FavoriteType, count: number) {
    this.cartService.updateCart(product.id, count).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.countInCart = count;
      },
    });
  }

  removeFromCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 0).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        product.countInCart = 0;
      },
    });
  }

  updataCount(product: FavoriteType, value: number) {
    if (product.countInCart) {
      this.cartService.updateCart(product.id, value).subscribe({
        next: (data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          product.countInCart = value;
        },
      });
    }
  }
}
