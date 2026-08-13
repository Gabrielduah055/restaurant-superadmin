import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  ATTENTION_ISSUES,
  DASHBOARD_STATS,
  OVERVIEW_PAGE_COPY,
  PLAN_INSIGHTS,
  PLATFORM_EVENTS,
  RECENT_RESTAURANTS,
} from '@core/constants/dashboard.constants';
import { Restaurant } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PlanBadgeComponent } from '@shared/components/plan-badge/plan-badge.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-overview',
  imports: [PageHeaderComponent, PlanBadgeComponent, StatCardComponent, StatusBadgeComponent],
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {
  readonly pageCopy = OVERVIEW_PAGE_COPY;
  readonly dashboardStats = DASHBOARD_STATS;
  readonly attentionIssues = ATTENTION_ISSUES;
  readonly planInsights = PLAN_INSIGHTS;
  readonly platformEvents = PLATFORM_EVENTS;
  readonly recentRestaurants = RECENT_RESTAURANTS;

  restaurants: Restaurant[] = [];

  constructor(private readonly restaurantService: RestaurantService) {}

  async ngOnInit(): Promise<void> {
    await this.loadRestaurants();
  }

  private async loadRestaurants(): Promise<void> {
    try {
      this.restaurants = await firstValueFrom(this.restaurantService.getRestaurants());
    } catch {
      this.restaurants = [];
    }
  }
}
