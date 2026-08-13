import { RestaurantPlan } from './restaurant.model';

export interface Plan {
  id: RestaurantPlan;
  name: string;
  description: string;
  priceLabel: string;
  restaurantLimit: number;
  managerPhoneLimit: number;
  features: string[];
}

export interface PlanInsight {
  label: string;
  count: number;
  percentage: number;
  tone: 'primary' | 'secondary' | 'muted';
}
