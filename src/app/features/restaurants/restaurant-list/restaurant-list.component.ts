import { Component, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  RESTAURANT_PAGE_COPY,
  RESTAURANT_PLAN_OPTIONS,
  RESTAURANT_STATUS_OPTIONS,
} from '@core/constants/restaurant.constants';
import { Restaurant, RestaurantPlan, RestaurantStatus } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  imports: [FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './restaurant-list.component.html',
})
export class RestaurantListComponent implements OnInit {
  readonly pageCopy = RESTAURANT_PAGE_COPY;
  readonly planOptions = RESTAURANT_PLAN_OPTIONS;
  readonly statusOptions = RESTAURANT_STATUS_OPTIONS;

  restaurants: Restaurant[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedPlan: RestaurantPlan | 'all' = 'all';
  selectedStatus: RestaurantStatus | 'all' = 'all';
  selectedSession: 'all' | 'connected' | 'disconnected' | 'inactive' = 'all';
  openMenuId = '';

  constructor(private readonly restaurantService: RestaurantService) {}

  ngOnInit(): void {
    void this.loadRestaurants();
  }

  get filteredRestaurants(): Restaurant[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.restaurants.filter((restaurant) => {
      const matchesSearch =
        !search ||
        [restaurant.name, restaurant.ownerName, restaurant.ownerPhone, restaurant.wasenderSessionId, restaurant.whatsappNumber]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search));
      const matchesPlan = this.selectedPlan === 'all' || restaurant.plan === this.selectedPlan;
      const matchesStatus = this.selectedStatus === 'all' || restaurant.status === this.selectedStatus;
      const matchesSession =
        this.selectedSession === 'all' || this.getSessionState(restaurant) === this.selectedSession;

      return matchesSearch && matchesPlan && matchesStatus && matchesSession;
    });
  }

  async loadRestaurants(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.restaurants = await firstValueFrom(this.restaurantService.getRestaurants());
    } catch {
      this.restaurants = [];
      this.errorMessage = 'Unable to load restaurants. Check that the backend is running and your account is a super admin.';
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

  getTrialEnd(restaurant: Restaurant): string {
    if (restaurant.status !== 'trial' || !restaurant.createdAt) {
      return '--';
    }

    const createdAt = new Date(restaurant.createdAt);
    const trialEnd = new Date(createdAt);
    trialEnd.setDate(createdAt.getDate() + 14);

    if (Number.isNaN(trialEnd.getTime())) {
      return '--';
    }

    return trialEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  toggleMenu(restaurantId: string): void {
    this.openMenuId = this.openMenuId === restaurantId ? '' : restaurantId;
  }
}
