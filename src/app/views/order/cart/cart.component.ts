import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductService } from 'src/app/shared/services/product.service';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  extraProducts: ProductType[] = [];
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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getBestProducts().subscribe({
      next: (data: ProductType[]) => {
        this.extraProducts = data;
      },
    });
  }
}
