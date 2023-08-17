import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { ProductType } from 'src/types/product.type';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  getBestProducts(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(environment.api + 'products/best');
  }

  getProducts(): Observable<{ totalCount: number; pages: number; items: ProductType[] }> {
    return this.http.get<{ totalCount: number; pages: number; items: ProductType[] }>(environment.api + 'products');
  }
}
