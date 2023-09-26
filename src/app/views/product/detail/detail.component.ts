import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { FavoriteService } from 'src/app/shared/services/favorites.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { environment } from 'src/environments/environment.development';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent {
  count: number = 1;
  recomendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath = environment.serverStaticPath;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    margin: 24,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: false,
  };

  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url']).subscribe({
        next: (data: ProductType) => {
          this.product = data;

          this.cartService.getCart().subscribe({
            next: (cartData: CartType | DefaultResponseType) => {
              if ((cartData as DefaultResponseType).error == !undefined) {
                throw new Error((cartData as DefaultResponseType).message);
              }

              const cartDataResponse = cartData as CartType;
              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            },
          });

          if (this.authService.getIsLoggedIn()) {
            this.favoriteService.getFavorites().subscribe({
              next: (data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error = (data as DefaultResponseType).message;
                  throw new Error(error);
                }
                const products = data as FavoriteType[];
                const currentProductExists = products.find(item => item.id === this.product.id);
                if (currentProductExists) {
                  this.product.isInFavorite = true;
                }
              },
            });
          }
        },
      });
    });

    this.productService.getBestProducts().subscribe({
      next: (data: ProductType[]) => {
        this.recomendedProducts = data;
      },
    });
  }

  updataCount(value: number) {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count).subscribe({
        next: (data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.countInCart = this.count;
        },
      });
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.product.countInCart = this.count;
      },
    });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe({
      next: (data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.product.countInCart = 0;
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
}
