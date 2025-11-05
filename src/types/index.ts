export interface Vehicle {
  id: string;
  name: string;
  category: string;
  image: string;
  images?: string[];
  passengers: number;
  luggage: number;
  price: number;
  features: string[];
  description: string;
  serviceTypes?: string[]; 
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}
export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  location: string;
}

export interface BookingStep {
  step: number;
  title: string;
  completed: boolean;
}

export interface TripDetails {
  pickupAddress: string;
  dropoffAddress: string;
  tripType: 'one-way' | 'round-trip';
  date: string;
  time: string;
  returnDate?: string;
  returnTime?: string;
  service?: string;
  vehicleId?: string;
  duration?: string;
}

export interface Language {
  code: 'pt' | 'en';
  name: string;
  flag: string;
}