export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: "Sedan" | "SUV" | "Coupe" | "Electric" | "Sports";
  image: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  price: number;
  estMonthly: number;
  // Extended optional properties
  images?: string[];
  spinImages?: string[];
  msrp?: number;
  driveType?: string;
  exteriorColor?: string;
  interiorColor?: string;
  vin?: string;
  stockNumber?: string;
  description?: string;
  customPremiumFeatures?: string[];
  hasAudioPackage?: boolean;
  hasDrivingAssists?: boolean;
  hasClimateControl?: boolean;
  hasSafetySuite?: boolean;
  threeDViewUrl?: string;
  evRebateAmount?: number;
  netCost?: number;
  isEvEligible?: boolean;
  location?: string;
  legalDisclaimer?: string;
  standardEquipment?: string;
}

export const CARS: Car[] = [];
