import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Restaurant } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';
import {
  getBillingStatusLabel,
  getEffectiveBillingStatus,
  getSubscriptionRenewalState,
  hasValidSubscriptionAmount,
  isActiveRevenueSubscription,
  SubscriptionDisplayStatus,
  SubscriptionRenewalState,
} from '@core/utils/subscription-billing.util';

type RenewalFilter = 'all' | Exclude<SubscriptionRenewalState, undefined>;

@Component({
  selector: 'app-subscriptions',
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './subscriptions.component.html',
})
export class SubscriptionsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  searchTerm = '';
  selectedBillingStatus: SubscriptionDisplayStatus | 'all' = 'all';
  selectedRenewal: RenewalFilter = 'all';
  isLoading = true;
  errorMessage = '';

  constructor(private readonly restaurantService: RestaurantService) {}

  ngOnInit(): void {
    void this.loadSubscriptions();
  }

  get subscriptionRestaurants(): Restaurant[] {
    return this.restaurants;
  }

  get filteredSubscriptions(): Restaurant[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.subscriptionRestaurants.filter((restaurant) => {
      const matchesSearch = !search || restaurant.name.toLowerCase().includes(search);
      const matchesBilling = this.selectedBillingStatus === 'all'
        || this.getBillingStatus(restaurant) === this.selectedBillingStatus;
      const matchesRenewal = this.selectedRenewal === 'all' || this.getRenewalState(restaurant) === this.selectedRenewal;
      return matchesSearch && matchesBilling && matchesRenewal;
    });
  }

  get monthlyRecurringRevenue(): number {
    return this.subscriptionRestaurants
      .filter((restaurant) => isActiveRevenueSubscription(restaurant))
      .reduce((total, restaurant) => total + restaurant.subscriptionAmount!, 0);
  }

  get activeSubscriptions(): number {
    return this.subscriptionRestaurants.filter((restaurant) => this.getBillingStatus(restaurant) === 'active').length;
  }

  get pastDueSubscriptions(): number {
    return this.subscriptionRestaurants.filter((restaurant) => this.getBillingStatus(restaurant) === 'past_due').length;
  }

  get renewingSoonSubscriptions(): number { return this.subscriptionRestaurants.filter((restaurant) => this.getRenewalState(restaurant) === 'renewing_soon').length; }

  async loadSubscriptions(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.restaurants = await firstValueFrom(this.restaurantService.getRestaurants());
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load subscription information.';
    } finally {
      this.isLoading = false;
    }
  }

  getBillingStatus(restaurant: Restaurant): SubscriptionDisplayStatus {
    return getEffectiveBillingStatus(restaurant);
  }

  getBillingLabel(restaurant: Restaurant): string {
    return getBillingStatusLabel(this.getBillingStatus(restaurant));
  }

  getRenewalState(restaurant: Restaurant): SubscriptionRenewalState {
    return getSubscriptionRenewalState(restaurant);
  }

  hasSubscriptionAmount(restaurant: Restaurant): boolean {
    return hasValidSubscriptionAmount(restaurant);
  }
}
