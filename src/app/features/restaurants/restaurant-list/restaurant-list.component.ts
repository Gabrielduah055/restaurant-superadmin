import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RESTAURANT_STATUS_OPTIONS } from '@core/constants/restaurant.constants';
import { Restaurant, RestaurantStatus } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

@Component({ selector: 'app-restaurant-list', imports: [FormsModule, RouterLink], templateUrl: './restaurant-list.component.html' })
export class RestaurantListComponent implements OnInit {
  readonly statusOptions = RESTAURANT_STATUS_OPTIONS;
  restaurants: Restaurant[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedStatus: RestaurantStatus | 'all' = 'all';

  constructor(private readonly restaurantService: RestaurantService) {}
  ngOnInit(): void { void this.loadRestaurants(); }

  get filteredRestaurants(): Restaurant[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.restaurants.filter((restaurant) => {
      const matchesSearch = !search || [restaurant.name, restaurant.ownerName, restaurant.ownerPhone, restaurant.wasenderSessionId, restaurant.whatsappNumber]
        .filter(Boolean).some((value) => value?.toLowerCase().includes(search));
      return matchesSearch && (this.selectedStatus === 'all' || restaurant.status === this.selectedStatus);
    });
  }

  async loadRestaurants(): Promise<void> {
    this.isLoading = true; this.errorMessage = '';
    try { this.restaurants = await firstValueFrom(this.restaurantService.getRestaurants()); }
    catch (error) { this.errorMessage = error instanceof Error ? error.message : 'Unable to load restaurant accounts.'; }
    finally { this.isLoading = false; }
  }
}
