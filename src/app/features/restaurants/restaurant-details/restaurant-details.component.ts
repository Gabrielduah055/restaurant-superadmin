import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  ASSISTANT_TONE_OPTIONS,
  RESTAURANT_STATUS_OPTIONS,
} from '@core/constants/restaurant.constants';
import {
  AssistantTone,
  CreateRestaurantRequest,
  Restaurant,
  RestaurantManagerContact,
  RestaurantStatus,
} from '@core/models/restaurant.model';
import { RestaurantService } from '@core/services/restaurant.service';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

type RestaurantTab = 'Overview' | 'Business' | 'Authorized Contacts' | 'WhatsApp' | 'AI & Automations' | 'Subscription';

@Component({
  selector: 'app-restaurant-details',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, StatusBadgeComponent, TitleCasePipe],
  templateUrl: './restaurant-details.component.html',
})
export class RestaurantDetailsComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  readonly statusOptions = RESTAURANT_STATUS_OPTIONS;
  readonly assistantToneOptions = ASSISTANT_TONE_OPTIONS;
  readonly tabs: RestaurantTab[] = ['Overview', 'Business', 'Authorized Contacts', 'WhatsApp', 'AI & Automations', 'Subscription'];

  restaurant?: Restaurant;
  activeTab: RestaurantTab = 'Overview';
  editingTab?: Exclude<RestaurantTab, 'Overview' | 'Subscription'>;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  readonly businessForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    ownerName: [''],
    contactEmail: ['', Validators.email],
    primaryCuisine: [''],
    openingHours: [''],
    pickupAddress: [''],
    timezone: ['Africa/Accra', Validators.required],
  });

  readonly contactsForm = this.formBuilder.group({
    ownerName: [''],
    ownerPhone: ['', Validators.required],
    managers: this.formBuilder.array([] as ReturnType<RestaurantDetailsComponent['createManagerControl']>[]),
  });

  readonly whatsappForm = this.formBuilder.group({
    whatsappNumber: ['', Validators.required],
    wasenderSessionId: [''],
    wasenderApiToken: [''],
  });

  readonly aiForm = this.formBuilder.group({
    assistantTone: ['friendly' as AssistantTone, Validators.required],
    assistantPersonalitySummary: [''],
    followUpEnabled: [false],
    followUpDelayMinutes: [30, [Validators.min(1)]],
    ownerDailySummaryEnabled: [false],
    ownerDailySummaryTime: ['18:00'],
    ownerWeeklySummaryEnabled: [false],
    ownerWeeklySummaryDay: ['monday'],
    ownerWeeklySummaryTime: ['09:00'],
    ownerPendingActionReminderEnabled: [false],
    ownerPendingActionReminderDelayMinutes: [60, [Validators.min(1)]],
    orderCheckInEnabled: [false],
    pickupCheckInDelayMinutes: [30, [Validators.min(1)]],
    deliveryCheckInDelayMinutes: [45, [Validators.min(1)]],
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly restaurantService: RestaurantService,
  ) {}

  ngOnInit(): void {
    void this.loadRestaurant();
  }

  get managers(): FormArray<ReturnType<RestaurantDetailsComponent['createManagerControl']>> {
    return this.contactsForm.controls.managers;
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
      this.patchForms(this.restaurant);
    } catch {
      this.restaurant = undefined;
      this.errorMessage = 'Unable to load this restaurant configuration. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  setActiveTab(tab: RestaurantTab): void {
    this.activeTab = tab;
    this.editingTab = undefined;
    this.clearMessages();
  }

  beginEdit(tab: Exclude<RestaurantTab, 'Overview' | 'Subscription'>): void {
    this.editingTab = tab;
    this.clearMessages();
  }

  cancelEdit(): void {
    if (this.restaurant) this.patchForms(this.restaurant);
    this.editingTab = undefined;
    this.clearMessages();
  }

  addManager(contact: RestaurantManagerContact = { name: '', phone: '' }): void {
    this.managers.push(this.createManagerControl(contact));
  }

  removeManager(index: number): void {
    this.managers.removeAt(index);
  }

  async saveBusiness(): Promise<void> {
    if (!this.businessForm.valid) return this.markInvalid(this.businessForm);
    await this.saveConfiguration('Business', this.businessForm.getRawValue());
  }

  async saveContacts(): Promise<void> {
    if (!this.contactsForm.valid) return this.markInvalid(this.contactsForm);
    const managers = this.managers.getRawValue()
      .map((manager) => ({ name: manager.name.trim() || undefined, phone: manager.phone.trim() }))
      .filter((manager) => manager.phone.length > 0);
    await this.saveConfiguration('Authorized Contacts', {
      ownerName: this.contactsForm.controls.ownerName.value.trim() || undefined,
      ownerPhone: this.contactsForm.controls.ownerPhone.value.trim(),
      managerContacts: managers,
      managerPhones: managers.map((manager) => manager.phone),
    });
  }

  async saveWhatsApp(): Promise<void> {
    if (!this.whatsappForm.valid) return this.markInvalid(this.whatsappForm);
    const value = this.whatsappForm.getRawValue();
    const payload: Partial<CreateRestaurantRequest> = {
      whatsappNumber: value.whatsappNumber.trim(),
      wasenderSessionId: value.wasenderSessionId.trim(),
    };
    if (value.wasenderApiToken.trim()) payload.wasenderApiToken = value.wasenderApiToken.trim();
    await this.saveConfiguration('WhatsApp', payload);
  }

  async saveAiAutomations(): Promise<void> {
    if (!this.aiForm.valid) return this.markInvalid(this.aiForm);
    await this.saveConfiguration('AI & Automations', {
      ...this.aiForm.getRawValue(),
      ownerWeeklySummaryDay: this.aiForm.controls.ownerWeeklySummaryDay.value as CreateRestaurantRequest['ownerWeeklySummaryDay'],
    });
  }

  async changeStatus(nextStatus: RestaurantStatus): Promise<void> {
    if (!this.restaurant || nextStatus === this.restaurant.status) return;
    if (!window.confirm(`Change ${this.restaurant.name} to ${this.getStatusLabel(nextStatus)}?`)) return;

    this.isSaving = true;
    this.clearMessages();
    try {
      this.restaurant = await firstValueFrom(this.restaurantService.updateRestaurantStatus(this.restaurant._id, nextStatus));
      this.patchForms(this.restaurant);
      this.successMessage = `Account status changed to ${this.getStatusLabel(nextStatus)}.`;
    } catch {
      this.errorMessage = 'Unable to change account status. No other configuration was changed.';
    } finally {
      this.isSaving = false;
    }
  }

  getStatusLabel(status: RestaurantStatus): string {
    return this.statusOptions.find((option) => option.value === status)?.label ?? status;
  }

  getAccountTone(status: RestaurantStatus): 'success' | 'warning' | 'danger' | 'secondary' {
    if (status === 'active') return 'success';
    if (status === 'trial') return 'warning';
    if (status === 'cancelled') return 'danger';
    return 'secondary';
  }

  getBillingTone(): 'success' | 'warning' | 'danger' | 'secondary' {
    if (this.restaurant?.billingStatus === 'active') return 'success';
    if (this.restaurant?.billingStatus === 'past_due') return 'warning';
    if (this.restaurant?.billingStatus === 'cancelled') return 'danger';
    return 'secondary';
  }

  getWhatsAppLabel(): string {
    return this.restaurant?.wasenderSessionId ? 'Configured' : 'Not configured';
  }

  private createManagerControl(contact: RestaurantManagerContact) {
    return this.formBuilder.group({ name: [contact.name ?? ''], phone: [contact.phone, Validators.required] });
  }

  private patchForms(restaurant: Restaurant): void {
    this.businessForm.patchValue({
      name: restaurant.name,
      ownerName: restaurant.ownerName ?? '',
      contactEmail: restaurant.contactEmail ?? '',
      primaryCuisine: restaurant.primaryCuisine ?? '',
      openingHours: restaurant.openingHours ?? '',
      pickupAddress: restaurant.pickupAddress ?? '',
      timezone: restaurant.timezone || 'Africa/Accra',
    });
    this.contactsForm.patchValue({ ownerName: restaurant.ownerName ?? '', ownerPhone: restaurant.ownerPhone ?? '' });
    this.managers.clear();
    const managerContacts = restaurant.managerContacts?.length
      ? restaurant.managerContacts
      : restaurant.managerPhones.map((phone) => ({ phone }));
    managerContacts.forEach((contact) => this.addManager(contact));
    this.whatsappForm.patchValue({
      whatsappNumber: restaurant.whatsappNumber ?? '',
      wasenderSessionId: restaurant.wasenderSessionId ?? '',
      wasenderApiToken: '',
    });
    this.aiForm.patchValue({
      assistantTone: restaurant.assistantTone ?? 'friendly',
      assistantPersonalitySummary: restaurant.assistantPersonalitySummary ?? '',
      followUpEnabled: restaurant.followUpEnabled ?? false,
      followUpDelayMinutes: restaurant.followUpDelayMinutes ?? 30,
      ownerDailySummaryEnabled: restaurant.ownerDailySummaryEnabled ?? false,
      ownerDailySummaryTime: restaurant.ownerDailySummaryTime ?? '18:00',
      ownerWeeklySummaryEnabled: restaurant.ownerWeeklySummaryEnabled ?? false,
      ownerWeeklySummaryDay: restaurant.ownerWeeklySummaryDay ?? 'monday',
      ownerWeeklySummaryTime: restaurant.ownerWeeklySummaryTime ?? '09:00',
      ownerPendingActionReminderEnabled: restaurant.ownerPendingActionReminderEnabled ?? false,
      ownerPendingActionReminderDelayMinutes: restaurant.ownerPendingActionReminderDelayMinutes ?? 60,
      orderCheckInEnabled: restaurant.orderCheckInEnabled ?? false,
      pickupCheckInDelayMinutes: restaurant.pickupCheckInDelayMinutes ?? 30,
      deliveryCheckInDelayMinutes: restaurant.deliveryCheckInDelayMinutes ?? 45,
    });
  }

  private async saveConfiguration(tab: Exclude<RestaurantTab, 'Overview' | 'Subscription'>, payload: Partial<CreateRestaurantRequest>): Promise<void> {
    if (!this.restaurant) return;
    this.isSaving = true;
    this.clearMessages();
    try {
      this.restaurant = await firstValueFrom(this.restaurantService.updateRestaurant(this.restaurant._id, payload));
      this.patchForms(this.restaurant);
      this.editingTab = undefined;
      this.successMessage = `${tab} configuration saved.`;
    } catch {
      this.errorMessage = `Unable to save ${tab.toLowerCase()} configuration. Your changes are still in the form.`;
    } finally {
      this.isSaving = false;
    }
  }

  private markInvalid(form: typeof this.businessForm | typeof this.contactsForm | typeof this.whatsappForm | typeof this.aiForm): void {
    form.markAllAsTouched();
    this.errorMessage = 'Review the highlighted fields before saving.';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
