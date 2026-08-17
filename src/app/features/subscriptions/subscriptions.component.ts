import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BillingStatus, Restaurant } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

type RenewalFilter = 'all' | 'renewing_soon' | 'overdue';
type RenewalState = 'renewing_soon' | 'overdue' | undefined;

@Component({
  selector: 'app-subscriptions',
  imports: [DatePipe, DecimalPipe, FormsModule, RouterLink, TitleCasePipe],
  templateUrl: './subscriptions.component.html',
})
export class SubscriptionsComponent implements OnInit {
  restaurants: Restaurant[] = [];
  searchTerm = '';
  selectedBillingStatus: BillingStatus | 'all' = 'all';
  selectedRenewal: RenewalFilter = 'all';
  isLoading = true;
  errorMessage = '';

  constructor(private readonly restaurantService: RestaurantService) {}

  ngOnInit(): void {
    void this.loadSubscriptions();
  }

  get subscriptionRestaurants(): Restaurant[] {
    return this.restaurants.filter((restaurant) =>
      restaurant.subscriptionAmount !== undefined
      || restaurant.billingStatus !== undefined
      || restaurant.subscriptionRenewalDate !== undefined,
    );
  }

  get filteredSubscriptions(): Restaurant[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.subscriptionRestaurants.filter((restaurant) => {
      const matchesSearch = !search || restaurant.name.toLowerCase().includes(search);
      const matchesBilling = this.selectedBillingStatus === 'all' || restaurant.billingStatus === this.selectedBillingStatus;
      const matchesRenewal = this.selectedRenewal === 'all' || this.getRenewalState(restaurant) === this.selectedRenewal;
      return matchesSearch && matchesBilling && matchesRenewal;
    });
  }

  get monthlyRecurringRevenue(): number {
    return this.subscriptionRestaurants
      .filter((restaurant) => restaurant.billingStatus === 'active' && this.hasSubscriptionAmount(restaurant))
      .reduce((total, restaurant) => total + restaurant.subscriptionAmount!, 0);
  }

  get activeSubscriptions(): number { return this.subscriptionRestaurants.filter((restaurant) => restaurant.billingStatus === 'active').length; }
  get pastDueSubscriptions(): number { return this.subscriptionRestaurants.filter((restaurant) => restaurant.billingStatus === 'past_due').length; }
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

  getRenewalState(restaurant: Restaurant): RenewalState {
    if (!restaurant.subscriptionRenewalDate || restaurant.billingStatus === 'cancelled') return undefined;
    const renewalDate = this.toLocalDate(restaurant.subscriptionRenewalDate);
    if (!renewalDate) return undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilRenewal = Math.round((renewalDate.getTime() - today.getTime()) / 86_400_000);
    if (daysUntilRenewal < 0) return 'overdue';
    return daysUntilRenewal <= 7 ? 'renewing_soon' : undefined;
  }

  hasSubscriptionAmount(restaurant: Restaurant): boolean {
    return typeof restaurant.subscriptionAmount === 'number' && Number.isFinite(restaurant.subscriptionAmount);
  }

  private toLocalDate(value: string): Date | undefined {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return undefined;
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
