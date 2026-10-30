import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Business, BusinessStatus } from '@core/models/business.model';
import { BusinessService } from '@core/services/business.service';

@Component({
  selector: 'app-business-list',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './business-list.component.html',
})
export class BusinessListComponent implements OnInit {
  businesses: Business[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedStatus: BusinessStatus | 'all' = 'all';

  constructor(private readonly businessService: BusinessService) {}

  ngOnInit(): void {
    void this.loadBusinesses();
  }

  get filteredBusinesses(): Business[] {
    const search = this.searchTerm.trim().toLowerCase();
    return this.businesses.filter((business) => {
      const matchesSearch = !search || [business.name, business.slug, business.ownerName, business.ownerEmail]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search));
      return matchesSearch && (this.selectedStatus === 'all' || business.status === this.selectedStatus);
    });
  }

  async loadBusinesses(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.businesses = await firstValueFrom(this.businessService.getBusinesses());
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Unable to load businesses.';
    } finally {
      this.isLoading = false;
    }
  }
}
