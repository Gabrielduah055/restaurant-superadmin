import { Component, inject } from '@angular/core';
import { FormArray, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ASSISTANT_TONE_OPTIONS } from '@core/constants/restaurant.constants';
import {
  BillingStatus,
  CreateRestaurantRequest,
  OwnerSummaryWeekday,
  RestaurantDeliveryPricing,
  RestaurantManagerContact,
  RestaurantStatus,
} from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type DeliveryPricingType = RestaurantDeliveryPricing['type'];

interface WizardStep {
  number: OnboardingStep;
  label: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-add-restaurant',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './add-restaurant.component.html',
})
export class AddRestaurantComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly restaurantService = inject(RestaurantService);
  private readonly router = inject(Router);

  readonly assistantToneOptions = ASSISTANT_TONE_OPTIONS;
  readonly steps: WizardStep[] = [
    { number: 1, label: 'Business', title: 'Business details', description: 'Record the business information supplied by the restaurant.' },
    { number: 2, label: 'Contacts', title: 'Authorized contacts', description: 'Add the owner and managers authorized to manage this OrderBridge account.' },
    { number: 3, label: 'WhatsApp', title: 'WhatsApp configuration', description: 'Add the Wasender details supplied for this restaurant.' },
    { number: 4, label: 'Ordering', title: 'Ordering setup', description: 'Enter the pickup and delivery rules provided by the restaurant.' },
    { number: 5, label: 'AI', title: 'AI & automations', description: 'Configure the assistant according to the restaurant’s communication preferences.' },
    { number: 6, label: 'Subscription', title: 'Initial subscription', description: 'Capture the initial billing configuration for this restaurant.' },
    { number: 7, label: 'Review', title: 'Review & create', description: 'Confirm the supplied setup details before creating the restaurant account.' },
  ];

  currentStep: OnboardingStep = 1;
  isSaving = false;
  errorMessage = '';

  readonly restaurantForm = this.formBuilder.group({
    business: this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(120)]],
      contactEmail: ['', Validators.email],
      primaryCuisine: [''],
      openingHours: [''],
      pickupAddress: [''],
      timezone: ['Africa/Accra', Validators.required],
    }),
    contacts: this.formBuilder.group({
      ownerName: [''],
      ownerPhone: ['', [Validators.required, Validators.minLength(7)]],
      managers: this.formBuilder.array([] as ReturnType<AddRestaurantComponent['createManagerControl']>[]),
    }),
    whatsapp: this.formBuilder.group({
      whatsappNumber: ['', [Validators.required, Validators.minLength(7)]],
      wasenderSessionId: ['', Validators.required],
      wasenderApiToken: [''],
    }),
    ordering: this.formBuilder.group({
      allowTakeaway: [false],
      deliveryEnabled: [false],
      deliveryRadiusKm: [10, Validators.min(0)],
      deliveryAreas: [''],
      minimumOrderValue: [0, Validators.min(0)],
      deliveryPricingType: ['flat' as DeliveryPricingType, Validators.required],
      flatFee: [0, Validators.min(0)],
      freeDeliveryThresholdEnabled: [false],
      freeDeliveryThreshold: new FormControl<number | null>(null, Validators.min(0)),
      zones: this.formBuilder.array([] as ReturnType<AddRestaurantComponent['createZoneControl']>[]),
      deliveryFeeNote: [''],
    }),
    ai: this.formBuilder.group({
      assistantTone: ['friendly', Validators.required],
      assistantPersonalitySummary: [''],
      followUpEnabled: [true],
      followUpDelayMinutes: [3, Validators.min(1)],
      ownerDailySummaryEnabled: [false],
      ownerDailySummaryTime: ['08:00'],
      ownerWeeklySummaryEnabled: [false],
      ownerWeeklySummaryDay: ['monday' as OwnerSummaryWeekday],
      ownerWeeklySummaryTime: ['08:00'],
      ownerPendingActionReminderEnabled: [false],
      ownerPendingActionReminderDelayMinutes: [3, Validators.min(1)],
      orderCheckInEnabled: [true],
      pickupCheckInDelayMinutes: [45, Validators.min(1)],
      deliveryCheckInDelayMinutes: [75, Validators.min(1)],
    }),
    subscription: this.formBuilder.group({
      subscriptionAmount: new FormControl<number | null>(null, Validators.min(0)),
      billingStatus: ['inactive' as BillingStatus, Validators.required],
      subscriptionRenewalDate: [''],
      status: ['trial' as RestaurantStatus, Validators.required],
    }),
  });

  get step(): WizardStep {
    return this.steps[this.currentStep - 1];
  }

  get businessForm() { return this.restaurantForm.controls.business; }
  get contactsForm() { return this.restaurantForm.controls.contacts; }
  get whatsappForm() { return this.restaurantForm.controls.whatsapp; }
  get orderingForm() { return this.restaurantForm.controls.ordering; }
  get aiForm() { return this.restaurantForm.controls.ai; }
  get subscriptionForm() { return this.restaurantForm.controls.subscription; }
  get managers(): FormArray<ReturnType<AddRestaurantComponent['createManagerControl']>> { return this.contactsForm.controls.managers; }
  get zones(): FormArray<ReturnType<AddRestaurantComponent['createZoneControl']>> { return this.orderingForm.controls.zones; }

  continue(): void {
    this.errorMessage = '';
    if (!this.isCurrentStepValid()) return;
    this.currentStep = (this.currentStep + 1) as OnboardingStep;
  }

  back(): void {
    this.errorMessage = '';
    this.currentStep = (this.currentStep - 1) as OnboardingStep;
  }

  editStep(step: OnboardingStep): void {
    this.currentStep = step;
    this.errorMessage = '';
  }

  addManager(contact: RestaurantManagerContact = { name: '', phone: '' }): void {
    this.managers.push(this.createManagerControl(contact));
  }

  removeManager(index: number): void {
    this.managers.removeAt(index);
  }

  addZone(): void {
    this.zones.push(this.createZoneControl());
  }

  removeZone(index: number): void {
    this.zones.removeAt(index);
  }

  onPricingTypeChange(): void {
    if (this.orderingForm.controls.deliveryPricingType.value === 'zone_based' && !this.zones.length) {
      this.addZone();
    }
  }

  async createRestaurant(): Promise<void> {
    if (this.isSaving) return;
    this.errorMessage = '';
    if (!this.isCurrentStepValid()) return;

    this.isSaving = true;
    try {
      const restaurant = await firstValueFrom(this.restaurantService.createRestaurant(this.toPayload()));
      await this.router.navigate(['/dashboard/restaurants', restaurant._id], { queryParams: { created: '1' } });
    } catch (error) {
      this.errorMessage = error instanceof Error
        ? error.message
        : 'Unable to create the restaurant. Review the supplied information and try again.';
    } finally {
      this.isSaving = false;
    }
  }

  isInvalid(control: FormControl<string> | FormControl<number> | FormControl<number | null>): boolean {
    return control.invalid && control.touched;
  }

  private isCurrentStepValid(): boolean {
    const control = this.getCurrentStepControl();
    control.markAllAsTouched();

    const orderingIsValid = this.currentStep !== 4 || this.isOrderingValid();
    if (control.valid && orderingIsValid) return true;

    this.errorMessage = 'Complete the required fields on this step before continuing.';
    return false;
  }

  private getCurrentStepControl() {
    switch (this.currentStep) {
      case 1: return this.businessForm;
      case 2: return this.contactsForm;
      case 3: return this.whatsappForm;
      case 4: return this.orderingForm;
      case 5: return this.aiForm;
      case 6: return this.subscriptionForm;
      case 7: return this.restaurantForm;
    }
  }

  private isOrderingValid(): boolean {
    if (!this.orderingForm.controls.deliveryEnabled.value) return true;
    const ordering = this.orderingForm.controls;
    const type = ordering.deliveryPricingType.value;
    if (type === 'flat') return ordering.flatFee.valid && (!ordering.freeDeliveryThresholdEnabled.value || ordering.freeDeliveryThreshold.valid && ordering.freeDeliveryThreshold.value !== null);
    if (type === 'zone_based') return this.zones.length > 0 && this.zones.valid;
    return true;
  }

  private toPayload(): CreateRestaurantRequest {
    const value = this.restaurantForm.getRawValue();
    const managerContacts = value.contacts.managers
      .map((manager) => ({ name: manager.name.trim() || undefined, phone: manager.phone.trim() }))
      .filter((manager) => manager.phone);
    const payload: CreateRestaurantRequest = {
      name: value.business.name.trim(),
      ownerPhone: value.contacts.ownerPhone.trim(),
      managerPhones: managerContacts.map((manager) => manager.phone),
      // This is a temporary backend compatibility value. OrderBridge no longer exposes commercial plan tiers in the Super Admin UI.
      plan: 'growth',
      status: value.subscription.status,
      wasenderSessionId: value.whatsapp.wasenderSessionId.trim(),
      whatsappNumber: value.whatsapp.whatsappNumber.trim(),
      deliveryEnabled: value.ordering.deliveryEnabled,
      deliveryAreas: this.toList(value.ordering.deliveryAreas),
      allowTakeaway: value.ordering.allowTakeaway,
      freeDeliveryThresholdEnabled: value.ordering.freeDeliveryThresholdEnabled,
      assistantTone: value.ai.assistantTone as CreateRestaurantRequest['assistantTone'],
      followUpEnabled: value.ai.followUpEnabled,
      followUpDelayMinutes: Number(value.ai.followUpDelayMinutes),
      timezone: value.business.timezone.trim(),
      ownerDailySummaryEnabled: value.ai.ownerDailySummaryEnabled,
      ownerDailySummaryTime: value.ai.ownerDailySummaryTime,
      ownerWeeklySummaryEnabled: value.ai.ownerWeeklySummaryEnabled,
      ownerWeeklySummaryDay: value.ai.ownerWeeklySummaryDay,
      ownerWeeklySummaryTime: value.ai.ownerWeeklySummaryTime,
      ownerPendingActionReminderEnabled: value.ai.ownerPendingActionReminderEnabled,
      ownerPendingActionReminderDelayMinutes: Number(value.ai.ownerPendingActionReminderDelayMinutes),
      orderCheckInEnabled: value.ai.orderCheckInEnabled,
      pickupCheckInDelayMinutes: Number(value.ai.pickupCheckInDelayMinutes),
      deliveryCheckInDelayMinutes: Number(value.ai.deliveryCheckInDelayMinutes),
    };

    this.assignOptional(payload, 'ownerName', value.contacts.ownerName);
    this.assignOptional(payload, 'contactEmail', value.business.contactEmail);
    this.assignOptional(payload, 'primaryCuisine', value.business.primaryCuisine);
    this.assignOptional(payload, 'openingHours', value.business.openingHours);
    this.assignOptional(payload, 'pickupAddress', value.business.pickupAddress);
    this.assignOptional(payload, 'wasenderApiToken', value.whatsapp.wasenderApiToken);
    this.assignOptional(payload, 'assistantPersonalitySummary', value.ai.assistantPersonalitySummary);
    this.assignOptional(payload, 'subscriptionRenewalDate', value.subscription.subscriptionRenewalDate);
    this.assignOptional(payload, 'deliveryFeeNote', value.ordering.deliveryFeeNote);

    if (managerContacts.length) payload.managerContacts = managerContacts;
    if (value.subscription.subscriptionAmount !== null) payload.subscriptionAmount = Number(value.subscription.subscriptionAmount);
    payload.billingStatus = value.subscription.billingStatus;

    if (value.ordering.deliveryEnabled) {
      payload.deliveryRadiusKm = Number(value.ordering.deliveryRadiusKm);
      payload.minimumOrderValue = Number(value.ordering.minimumOrderValue);
      payload.deliveryPricing = this.toDeliveryPricing(value.ordering.deliveryPricingType, value.ordering);
    }

    return payload;
  }

  private toDeliveryPricing(
    type: DeliveryPricingType,
    ordering: ReturnType<AddRestaurantComponent['orderingForm']['getRawValue']>,
  ): RestaurantDeliveryPricing {
    if (type === 'flat') {
      const pricing: RestaurantDeliveryPricing = { type, flatFee: Number(ordering.flatFee) };
      if (ordering.freeDeliveryThresholdEnabled && ordering.freeDeliveryThreshold !== null) {
        pricing.freeDeliveryThreshold = Number(ordering.freeDeliveryThreshold);
      }
      return pricing;
    }
    if (type === 'zone_based') {
      return {
        type,
        zones: ordering.zones.map((zone) => ({
          name: zone.name.trim(),
          fee: Number(zone.fee),
          ...(this.toList(zone.aliases).length ? { aliases: this.toList(zone.aliases) } : {}),
        })),
      };
    }
    return { type: 'manual_confirmation' };
  }

  private createManagerControl(contact: RestaurantManagerContact) {
    return this.formBuilder.group({ name: [contact.name ?? ''], phone: [contact.phone, [Validators.required, Validators.minLength(7)]] });
  }

  private createZoneControl() {
    return this.formBuilder.group({ name: ['', Validators.required], aliases: [''], fee: [0, Validators.min(0)] });
  }

  private toList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  private assignOptional<T extends keyof CreateRestaurantRequest>(payload: CreateRestaurantRequest, key: T, value: string): void {
    const trimmedValue = value.trim();
    if (trimmedValue) payload[key] = trimmedValue as CreateRestaurantRequest[T];
  }
}
