import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Restaurant } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  restaurants: Restaurant[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private readonly restaurantService: RestaurantService) {}

  async ngOnInit(): Promise<void> { await this.loadRestaurants(); }

  async loadRestaurants(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.restaurants = await firstValueFrom(this.restaurantService.getRestaurants());
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load restaurant accounts.';
    } finally {
      this.isLoading = false;
    }
  }

  get activeRestaurants(): number { return this.countByStatus('active'); }
  get trialRestaurants(): number { return this.countByStatus('trial'); }
  get pausedRestaurants(): number { return this.countByStatus('paused'); }
  get configuredWhatsApp(): number { return this.restaurants.filter((restaurant) => Boolean(restaurant.wasenderSessionId?.trim())).length; }
  get recentRestaurants(): Restaurant[] { return [...this.restaurants].sort((a, b) => this.dateValue(b.createdAt) - this.dateValue(a.createdAt)).slice(0, 6); }

  private countByStatus(status: Restaurant['status']): number { return this.restaurants.filter((restaurant) => restaurant.status === status).length; }
  private dateValue(value?: string): number { return value ? new Date(value).getTime() || 0 : 0; }
}
