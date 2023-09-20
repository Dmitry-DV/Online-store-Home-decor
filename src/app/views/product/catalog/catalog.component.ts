import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounce, debounceTime } from 'rxjs';
import { CartService } from 'src/app/shared/services/cart.service';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { ActiveParamsUtils } from 'src/app/shared/utils/active-params.utils';
import { ActiveParamsType } from 'src/types/active-params.type';
import { AppliendFilterType } from 'src/types/appliend-filter.type';
import { CartType } from 'src/types/cart.type';
import { CategoryWithTypeType } from 'src/types/category-with-type.type';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  products: ProductType[] = [];
  categoriesWithTypes: CategoryWithTypeType[] = [];
  activeParams: ActiveParamsType = { types: [] };
  appliendFilters: AppliendFilterType[] = [];
  sortingOpen = false;
  pages: number[] = [];
  sortingOptions: { name: string; value: string }[] = [
    { name: 'От А до Я', value: 'az-asc' },
    { name: 'От Я до А', value: 'az-desc' },
    { name: 'По возрастанию цены', value: 'price-asc' },
    { name: 'По убыванию цены', value: 'price-desc' },
  ];
  cart: CartType | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (data: CartType) => {
        this.cart = data;
      },
    });

    this.categoryService.getCategoriesWithTypes().subscribe({
      next: data => {
        this.categoriesWithTypes = data;

        this.activatedRoute.queryParams.pipe(debounceTime(500)).subscribe(params => {
          this.activeParams = ActiveParamsUtils.processParams(params);
          this.appliendFilters = [];
          this.activeParams.types.forEach(url => {
            for (let index = 0; index < this.categoriesWithTypes.length; index++) {
              const foundType = this.categoriesWithTypes[index].types.find(type => type.url === url);

              if (foundType) {
                this.appliendFilters.push({
                  name: foundType.name,
                  urlParam: foundType.url,
                });
              }
            }
          });

          if (this.activeParams.heightFrom) {
            this.appliendFilters.push({
              name: 'Высота от ' + this.activeParams.heightFrom + ' см',
              urlParam: 'heightFrom',
            });
          }

          if (this.activeParams.heightTo) {
            this.appliendFilters.push({
              name: 'Высота до ' + this.activeParams.heightTo + ' см',
              urlParam: 'heightTo',
            });
          }

          if (this.activeParams.diameterFrom) {
            this.appliendFilters.push({
              name: 'Диаметр от ' + this.activeParams.diameterFrom + ' см',
              urlParam: 'diameterFrom',
            });
          }

          if (this.activeParams.diameterTo) {
            this.appliendFilters.push({
              name: 'Диаметр до ' + this.activeParams.diameterTo + ' см',
              urlParam: 'diameterTo',
            });
          }

          this.productService.getProducts(this.activeParams).subscribe({
            next: data => {
              this.pages = [];
              for (let index = 1; index <= data.pages; index++) {
                this.pages.push(index);
              }

              if (this.cart && this.cart.items.length > 0) {
                this.products = data.items.map(product => {
                  if (this.cart) {
                    const productInCart = this.cart.items.find(item => item.product.id === product.id);
                    if (productInCart) {
                      product.countInCart = productInCart.quantity;
                    }
                  }
                  return product;
                });
              } else {
                this.products = data.items;
              }
            },
          });
        });
      },
    });
  }

  removeAppliendFilter(appliendFilter: AppliendFilterType) {
    if (
      appliendFilter.urlParam === 'heightFrom' ||
      appliendFilter.urlParam === 'heightTo' ||
      appliendFilter.urlParam === 'diameterFrom' ||
      appliendFilter.urlParam === 'diameterTo'
    ) {
      delete this.activeParams[appliendFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types.filter(item => item !== appliendFilter.urlParam);
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  toggleSorting() {
    this.sortingOpen = !this.sortingOpen;
  }

  sort(value: string) {
    this.activeParams.sort = value;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  openPage(page: number) {
    this.activeParams.page = page;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  openPrevPage() {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }

  openNextPage() {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }
}
