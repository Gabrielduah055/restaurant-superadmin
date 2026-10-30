import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Business } from '@core/models/business.model';
import { BusinessService } from '@core/services/business.service';

@Component({
  selector: 'app-business-details',
  imports: [DatePipe, RouterLink, TitleCasePipe],
  templateUrl: './business-details.component.html',
})
export class BusinessDetailsComponent implements OnInit {
  business?: Business;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly businessService: BusinessService,
  ) {}

  ngOnInit(): void {
    void this.loadBusiness();
  }

  private async loadBusiness(): Promise<void> {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (!businessId) {
      this.errorMessage = 'Business ID is missing from the route.';
      return;
    }
    this.isLoading = true;
    try {
      this.business = await firstValueFrom(this.businessService.getBusinessById(businessId));
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load this business.';
    } finally {
      this.isLoading = false;
    }
  }
}
