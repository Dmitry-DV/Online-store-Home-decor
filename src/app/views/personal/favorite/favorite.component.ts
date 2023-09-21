import { Component, OnInit } from '@angular/core';
import { FavoriteService } from 'src/app/shared/services/favorites.service';
import { environment } from 'src/environments/environment.development';
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

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error == !undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = data as FavoriteType[];
      },
    });
  }

  removeFromFavorites(id: string) {}
}
