import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/shared/services/category.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { activeParamsUtils } from 'src/app/shared/utils/active-params.utils';
import { activeParamsType } from 'src/types/active-params.type';
import { AppliendFilterType } from 'src/types/appliend-filter.type';
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
  activeParams: activeParamsType = { types: [] };
  appliendFilters: AppliendFilterType[] = [];
  sortingOpen = false;
  sortingOptions: { name: string; value: string }[] = [
    { name: 'От А до Я', value: 'az-asc' },
    { name: 'От Я до А', value: 'az-desc' },
    { name: 'По возрастанию цены', value: 'price-asc' },
    { name: 'По убыванию цены', value: 'price-desc' },
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes().subscribe({
      next: data => {
        this.categoriesWithTypes = data;

        this.activatedRoute.queryParams.subscribe(params => {
          this.activeParams = activeParamsUtils.processParams(params);
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
        });
      },
    });

    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data.items;
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
}
