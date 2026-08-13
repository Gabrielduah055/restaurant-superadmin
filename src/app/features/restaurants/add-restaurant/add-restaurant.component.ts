import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ASSISTANT_TONE_OPTIONS,
  RESTAURANT_PAGE_COPY,
  RESTAURANT_PLAN_CARDS,
  RESTAURANT_PLAN_OPTIONS,
  RESTAURANT_STATUS_OPTIONS,
} from '@core/constants/restaurant.constants';
import { CreateRestaurantRequest, RestaurantManagerContact, RestaurantPlan } from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

@Component({
  selector: 'app-add-restaurant',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-restaurant.component.html',
})
export class AddRestaurantComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly restaurantService = inject(RestaurantService);
  private readonly router = inject(Router);

  readonly pageCopy = RESTAURANT_PAGE_COPY;
  readonly planCards = RESTAURANT_PLAN_CARDS;
  readonly planOptions = RESTAURANT_PLAN_OPTIONS;
  readonly statusOptions = RESTAURANT_STATUS_OPTIONS;
  readonly assistantToneOptions = ASSISTANT_TONE_OPTIONS;

  isSaving = false;
  errorMessage = '';

  readonly restaurantForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    ownerName: [''],
    primaryCuisine: ['Italian'],
    contactEmail: ['', [Validators.email]],
    ownerPhone: ['', [Validators.required, Validators.minLength(7)]],
    managerName1: [''],
    managerPhone1: [''],
    managerName2: [''],
    managerPhone2: [''],
    plan: ['growth', [Validators.required]],
    status: ['active', [Validators.required]],
    subscriptionRenewalDate: [''],
    wasenderSessionId: ['', [Validators.required]],
    wasenderApiToken: [''],
    whatsappNumber: ['', [Validators.required, Validators.minLength(7)]],
    openingHours: [''],
    pickupAddress: [''],
    deliveryEnabled: [true],
    deliveryRadiusKm: [10, [Validators.required, Validators.min(0)]],
    minimumOrderValue: [20, [Validators.required, Validators.min(0)]],
    allowTakeaway: [false],
    freeDeliveryThresholdEnabled: [false],
    deliveryAreas: [''],
    deliveryFeeNote: [''],
    assistantTone: ['friendly', [Validators.required]],
    assistantPersonalitySummary: [''],
    followUpEnabled: [true],
    followUpDelayMinutes: [5, [Validators.required, Validators.min(0)]],
  });

  get selectedPlanLimit(): string {
    const selectedPlan = this.restaurantForm.controls.plan.value as RestaurantPlan;
    const limit = this.planCards.find((plan) => plan.value === selectedPlan)?.managerLimit ?? 0;

    return limit >= 999 ? 'Unlimited' : String(limit);
  }

  async saveRestaurant(): Promise<void> {
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      this.errorMessage = `Please complete required fields: ${this.getMissingFields().join(', ')}.`;
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    try {
      await firstValueFrom(this.restaurantService.createRestaurant(this.toPayload()));
      await this.router.navigate(['/dashboard/restaurants']);
    } catch (error) {
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Unable to save restaurant. Confirm the backend is running and the restaurant fields are valid.';
    } finally {
      this.isSaving = false;
    }
  }

  private toPayload(): CreateRestaurantRequest {
    const value = this.restaurantForm.getRawValue();
    const payload: CreateRestaurantRequest = {
      name: value.name.trim(),
      ownerPhone: value.ownerPhone.trim(),
      managerPhones: this.toManagerContacts(value).map((manager) => manager.phone),
      plan: value.plan as CreateRestaurantRequest['plan'],
      status: value.status as CreateRestaurantRequest['status'],
      wasenderSessionId: value.wasenderSessionId.trim(),
      whatsappNumber: value.whatsappNumber.trim(),
      deliveryEnabled: value.deliveryEnabled,
      deliveryAreas: this.toList(value.deliveryAreas),
      deliveryRadiusKm: Number(value.deliveryRadiusKm),
      minimumOrderValue: Number(value.minimumOrderValue),
      allowTakeaway: value.allowTakeaway,
      freeDeliveryThresholdEnabled: value.freeDeliveryThresholdEnabled,
      assistantTone: value.assistantTone as CreateRestaurantRequest['assistantTone'],
      followUpEnabled: value.followUpEnabled,
      followUpDelayMinutes: Number(value.followUpDelayMinutes),
    };

    this.assignOptional(payload, 'ownerName', value.ownerName);
    this.assignOptional(payload, 'contactEmail', value.contactEmail);
    this.assignOptional(payload, 'primaryCuisine', value.primaryCuisine);
    this.assignOptional(payload, 'subscriptionRenewalDate', value.subscriptionRenewalDate);
    this.assignOptional(payload, 'wasenderApiToken', value.wasenderApiToken);
    this.assignOptional(payload, 'openingHours', value.openingHours);
    this.assignOptional(payload, 'pickupAddress', value.pickupAddress);
    this.assignOptional(payload, 'deliveryFeeNote', value.deliveryFeeNote);
    this.assignOptional(payload, 'assistantPersonalitySummary', value.assistantPersonalitySummary);

    const managerContacts = this.toManagerContacts(value);
    if (managerContacts.length) {
      payload.managerContacts = managerContacts;
    }

    return payload;
  }

  private getMissingFields(): string[] {
    const missingRequired: string[] = [];

    if (this.restaurantForm.controls.name.invalid) {
      missingRequired.push('Restaurant Name');
    }

    if (this.restaurantForm.controls.ownerPhone.invalid) {
      missingRequired.push('Phone Number');
    }

    if (this.restaurantForm.controls.wasenderSessionId.invalid) {
      missingRequired.push('Instance ID');
    }

    if (this.restaurantForm.controls.whatsappNumber.invalid) {
      missingRequired.push('WhatsApp Number');
    }

    if (this.restaurantForm.controls.contactEmail.invalid) {
      missingRequired.push('Valid Contact Email');
    }

    return missingRequired;
  }

  private toManagerContacts(value: {
    managerName1: string;
    managerPhone1: string;
    managerName2: string;
    managerPhone2: string;
  }): RestaurantManagerContact[] {
    return [
      { name: value.managerName1.trim(), phone: value.managerPhone1.trim() },
      { name: value.managerName2.trim(), phone: value.managerPhone2.trim() },
    ].filter((manager) => manager.phone);
  }

  private toList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private assignOptional<T extends keyof CreateRestaurantRequest>(
    payload: CreateRestaurantRequest,
    key: T,
    value: string,
  ): void {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      payload[key] = trimmedValue as CreateRestaurantRequest[T];
    }
  }
}
