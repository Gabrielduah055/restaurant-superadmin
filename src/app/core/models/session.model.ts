export type SessionStatus = 'connected' | 'disconnected' | 'pending';

export interface WhatsAppSession {
  id: string;
  restaurantId: string;
  restaurantName: string;
  phoneNumber: string;
  status: SessionStatus;
  lastSyncedAt?: string;
}
