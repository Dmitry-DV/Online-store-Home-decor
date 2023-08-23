import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { activeParamsType } from 'src/types/active-params.type';
import { CategoryWithTypeType } from 'src/types/category-with-type.type';
import { activeParamsUtils } from '../../utils/active-params.utils';

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
})
export class CategoryFilterComponent implements OnInit {
  open: boolean = false;
  activeParams: activeParamsType = { types: [] };
  from: number | null = null;
  to: number | null = null;

  @Input() categoryWithTypes: CategoryWithTypeType | null = null;
  @Input() type: string | null = null;

  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    } else if (this.type) {
      if (this.type === 'height') {
        return 'Высота';
      } else if (this.type === 'diameter') {
        return 'Диаметр';
      }
    }
    return '';
  }

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.activeParams = activeParamsUtils.processParams(params);

      if (this.type) {
        if (this.type === 'height') {
          this.open = !!(this.activeParams.heightFrom || this.activeParams.heightTo);
          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null;
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null;
        } else if (this.type === 'diameter') {
          this.open = !!(this.activeParams.diameterFrom || this.activeParams.diameterTo);
          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null;
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null;
        }
      } else {
        if (params['types']) {
          this.activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
        }

        if (
          this.categoryWithTypes &&
          this.categoryWithTypes.types &&
          this.categoryWithTypes.types.length > 0 &&
          this.categoryWithTypes.types.some(type => this.activeParams.types.find(item => type.url === item))
        ) {
          this.open = true;
        }
      }
    });
  }

  toggle() {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean) {
    if (this.activeParams.types && this.activeParams.types.length > 0) {
      const existingTypeInParams = this.activeParams.types.find(item => item === url);
      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      } else if (!existingTypeInParams && checked) {
        this.activeParams.types = [...this.activeParams.types, url];
      }
    } else if (checked) {
      this.activeParams.types = [url];
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams,
    });
  }

  updateFilterFromTo(param: string, value: string) {
    if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterTo' || param === 'diameterFrom') {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = value;
      }

      this.activeParams.page = 1;
      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams,
      });
    }
  }
}
