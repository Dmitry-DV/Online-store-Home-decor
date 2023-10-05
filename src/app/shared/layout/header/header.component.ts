import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CategoryWithTypeType } from 'src/types/category-with-type.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ProductType } from 'src/types/product.type';
import { environment } from 'src/environments/environment.development';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false;
  count: number = 0;
  products: ProductType[] = [];
  serverStaticPath = environment.serverStaticPath;
  showedSearch: boolean = false;
  searchField = new FormControl();

  @Input() categories: CategoryWithTypeType[] = [];

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private cartService: CartService,
    private productService: ProductService,
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        if (value && value.length > 2) {
              this.productService.searchProducts(value).subscribe({
                next: (data: ProductType[]) => {
                  this.products = data;
                  this.showedSearch = true;
                },
              });
            } else {
              this.products = [];
            }
      }
    })

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });

    this.getCart();

    this.cartService.count$.subscribe({
      next: count => {
        this.count = count;
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.doLogout();
      },
      error: () => {
        this.doLogout();
      },
    });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
    this.getCart();
  }

  selectProduct(productUrl: string) {
    this.router.navigate(['/product/' + productUrl]);
    this.searchField.setValue('');
    this.products = [];
  }

  getCart() {
    this.cartService.getCartCount().subscribe({
      next: (data: { count: number } | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.count = (data as { count: number }).count;
      },
    });
  }

  @HostListener('document:click', ['$event'])
  click(event: Event) {
    if (this.showedSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false;
    }
  }
}
