import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateRestaurantRequest, Restaurant, RestaurantPlan, RestaurantStatus } from '@core/models/restaurant.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(private readonly apiService: ApiService) {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.apiService.get<Restaurant[]>('restaurants');
  }

  getRestaurantById(restaurantId: string): Observable<Restaurant> {
    return this.apiService.get<Restaurant>(`restaurants/${restaurantId}`);
  }

  createRestaurant(payload: CreateRestaurantRequest): Observable<Restaurant> {
    return this.apiService.post<Restaurant, CreateRestaurantRequest>('restaurants', payload);
  }

  updateRestaurant(restaurantId: string, payload: Partial<CreateRestaurantRequest>): Observable<Restaurant> {
    return this.apiService.patch<Restaurant, Partial<CreateRestaurantRequest>>(`restaurants/${restaurantId}`, payload);
  }

  updateRestaurantStatus(restaurantId: string, status: RestaurantStatus): Observable<Restaurant> {
    return this.apiService.patch<Restaurant, { status: RestaurantStatus }>(`restaurants/${restaurantId}/status`, {
      status,
    });
  }

  updateRestaurantPlan(restaurantId: string, plan: RestaurantPlan): Observable<Restaurant> {
    return this.apiService.patch<Restaurant, { plan: RestaurantPlan }>(`restaurants/${restaurantId}/plan`, {
      plan,
    });
  }

  deleteRestaurant(restaurantId: string): Observable<void> {
    return this.apiService.delete<void>(`restaurants/${restaurantId}`);
  }
}
