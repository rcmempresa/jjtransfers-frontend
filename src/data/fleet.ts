import { Vehicle } from '../types';

export const vehicles: Vehicle[] = [
  // 3 Mercedes V-Class (Ideais para Airport, Executive, Events, Parties, Tours)
  {
    id: '1',
    name: 'Mercedes-Benz V-Class #1',
    category: 'Business Van',
    image: 'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2226476/pexels-photo-2226476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    passengers: 7,
    luggage: 8,
    price: 145,
    features: [
      'Fits up to 7 people',
      'Fits 8 carry-on bags, or 6 standard check-in, or 4 extra large check-in bags',
      'Available in most of our business districts',
      'Spacious interior with individual seats',
      'WiFi and refreshments included',
      'Air conditioning and USB charging'
    ],
    description: 'Mercedes V-Class, or similar',
    // PROPRIEDADE ADICIONADA:
    serviceTypes: ['airport', 'executive', 'events', 'hourly', 'tours', 'nightlife', 'parties'] 
  },
  {
    id: '2',
    name: 'Mercedes-Benz V-Class #2',
    category: 'Business Van',
    image: 'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    passengers: 7,
    luggage: 8,
    price: 145,
    features: [
      'Fits up to 7 people',
      'Fits 8 carry-on bags, or 6 standard check-in, or 4 extra large check-in bags',
      'Available in most of our business districts',
      'Spacious interior with individual seats',
      'WiFi and refreshments included',
      'Air conditioning and USB charging'
    ],
    description: 'Mercedes V-Class, or similar',
    // PROPRIEDADE ADICIONADA:
    serviceTypes: ['airport', 'executive', 'events', 'hourly', 'tours', 'nightlife', 'parties']
  },
  {
    id: '3',
    name: 'Mercedes-Benz V-Class #3',
    category: 'Business Van',
    image: 'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/2226476/pexels-photo-2226476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    passengers: 7,
    luggage: 8,
    price: 145,
    features: [
      'Fits up to 7 people',
      'Fits 8 carry-on bags, or 6 standard check-in, or 4 extra large check-in bags',
      'Available in most of our business districts',
      'Spacious interior with individual seats',
      'WiFi and refreshments included',
      'Air conditioning and USB charging'
    ],
    description: 'Mercedes V-Class, or similar',
    // PROPRIEDADE ADICIONADA:
    serviceTypes: ['airport', 'executive', 'events', 'hourly', 'tours', 'nightlife', 'parties']
  },
  // 2 Mercedes E-Class (Ideais para Airport, Executive, Weddings, Tours)
  {
    id: '4',
    name: 'Mercedes-Benz E-Class #1',
    category: 'Business Class',
    image: 'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    passengers: 3,
    luggage: 3,
    price: 85,
    features: [
      'Fits up to 3 people',
      'Fits 2 carry-on bags, or 2 standard check-in, or 1 extra large check-in bag',
      'Available in most of our business districts',
      'Leather seats and climate control',
      'WiFi and premium sound system',
      'Navigation and water bottles'
    ],
    description: 'Mercedes E-Class, BMW 5 Series, Audi A6, or similar',
    // PROPRIEDADE ADICIONADA E CORRIGIDA:
    serviceTypes: ['airport', 'executive', 'hourly', 'weddings', 'tours']
  },
  {
    id: '5',
    name: 'Mercedes-Benz E-Class #2',
    category: 'Business Class',
    image: 'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    images: [
      'https://images.pexels.com/photos/2365572/pexels-photo-2365572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    ],
    passengers: 3,
    luggage: 3,
    price: 85,
    features: [
      'Fits up to 3 people',
      'Fits 2 carry-on bags, or 2 standard check-in, or 1 extra large check-in bag',
      'Available in most of our business districts',
      'Leather seats and climate control',
      'WiFi and premium sound system',
      'Navigation and water bottles'
    ],
    description: 'Mercedes E-Class, BMW 5 Series, Audi A6, or similar',
    // PROPRIEDADE ADICIONADA E CORRIGIDA:
    serviceTypes: ['airport', 'executive', 'hourly', 'weddings', 'tours']
  }
];