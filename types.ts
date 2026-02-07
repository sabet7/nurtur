
export enum UserRole {
  CONSUMER = 'CONSUMER',
  FARMER = 'FARMER',
  UNSET = 'UNSET'
}

export interface UserProfile {
  name: string;
  farmName?: string;
  role: UserRole;
  dietaryRestrictions: string[];
  healthGoals: string[];
  budget: string;
  shoppingPreferences: string[];
  location?: string;
  // Farmer specific
  frequency?: string;
  produce?: string[];
  pickupMethod?: string;
  paymentForms?: string[];
  newsUpdates?: { date: string; content: string }[];
  schedule?: string[];
  // AI Learning State
  interactionHistory: string[];
  savedMeals: any[];
  behaviors: string[];
  fridgeContents?: FridgeItem[];
  lastFridgeScan?: string;
}

export interface FridgeItem {
  item: string;
  aligns: boolean;
  reason: string;
  scannedAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  time: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  budgetLevel: 'Low' | 'Medium' | 'High';
}

export interface FoodSource {
  name: string;
  address: string;
  hours: string;
  summary: string;
  rating: number;
  ebtAccepted: boolean;
  deliveryOffered: boolean;
  coordinates: { lat: number; lng: number };
}
