import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CartService } from 'src/app/shared/services/cart.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { environment } from 'src/environments/environment.development';
import { CartType } from 'src/types/cart.type';
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

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute, private cartService: CartService) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.productService.getProduct(params['url']).subscribe({
        next: (data: ProductType) => {
          this.cartService.getCart().subscribe({
            next: (cartData: CartType) => {
              if (cartData) {
                const productInCart = cartData.items.find(item => item.product.id === data.id);
                if (productInCart) {
                  data.countInCart = productInCart.quantity;
                  this.count = data.countInCart;
                }
              }
              this.product = data;
            },
          });
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
        next: (data: CartType) => {
          this.product.countInCart = this.count;
        },
      });
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count).subscribe({
      next: (data: CartType) => {
        this.product.countInCart = this.count;
      },
    });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0).subscribe({
      next: (data: CartType) => {
        this.product.countInCart = 0;
        this.count = 1;
      },
    });
  }
}
