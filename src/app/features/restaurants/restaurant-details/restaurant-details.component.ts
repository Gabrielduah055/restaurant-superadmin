import { Component, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  RESTAURANT_PAGE_COPY,
  RESTAURANT_PLAN_OPTIONS,
  RESTAURANT_STATUS_OPTIONS,
} from '@core/constants/restaurant.constants';
import { Restaurant, RestaurantPlan, RestaurantStatus } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-details',
  imports: [RouterLink, TitleCasePipe],
  templateUrl: './restaurant-details.component.html',
})
export class RestaurantDetailsComponent implements OnInit {
  readonly pageCopy = RESTAURANT_PAGE_COPY;
  readonly planOptions = RESTAURANT_PLAN_OPTIONS;
  readonly statusOptions = RESTAURANT_STATUS_OPTIONS;
  readonly tabs = ['Overview', 'Subscription', 'Session', 'Settings Summary', 'Access Control'];

  restaurant?: Restaurant;
  activeTab = 'Overview';
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restaurantService: RestaurantService,
  ) {}

  ngOnInit(): void {
    void this.loadRestaurant();
  }

  async loadRestaurant(): Promise<void> {
    const restaurantId = this.route.snapshot.paramMap.get('restaurantId');

    if (!restaurantId) {
      this.errorMessage = 'Restaurant ID is missing from the route.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.restaurant = await firstValueFrom(this.restaurantService.getRestaurantById(restaurantId));
    } catch {
      this.restaurant = undefined;
      this.errorMessage = 'Unable to load restaurant details. Confirm the backend is running and the restaurant exists.';
    } finally {
      this.isLoading = false;
    }
  }

  getPlanLabel(plan: RestaurantPlan): string {
    return this.planOptions.find((option) => option.value === plan)?.label ?? plan;
  }

  getStatusLabel(status: RestaurantStatus): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? status;
  }

  getSessionState(restaurant: Restaurant): 'connected' | 'disconnected' | 'inactive' {
    if (restaurant.status === 'cancelled') {
      return 'inactive';
    }

    return restaurant.wasenderSessionId && restaurant.status !== 'paused' ? 'connected' : 'disconnected';
  }

  getJoinedDate(restaurant: Restaurant): string {
    if (!restaurant.createdAt) {
      return '--';
    }

    const joinedDate = new Date(restaurant.createdAt);

    if (Number.isNaN(joinedDate.getTime())) {
      return '--';
    }

    return joinedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getManagerCount(restaurant: Restaurant): number {
    return restaurant.managerPhones?.length ?? 0;
  }
}
