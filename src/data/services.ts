import { Service } from '../types';
import { Plane, Briefcase, Calendar, Clock, Heart, MapPin, Moon, Music } from 'lucide-react'; 
// Assumindo que está a usar a Lucide-React para os ícones

export const services: Service[] = [
  {
    id: 'airport',
    title: 'Transfers Aeroporto', 
    description: 'Serviço confiável de/para o aeroporto com monitorização de voos', 
    icon: 'Plane', 
    image: 'https://st3.idealista.pt/news/arquivos/styles/fullwidth_xl/public/2025-02/images/aeroporto_da_madeira_2.jpg?VersionId=Vh_Mx_3x1zOj07P4slZ8ELyMrAPZGPy7&h=60abd727&itok=CzZVW6VA'
  },
  {
    id: 'executive',
    title: 'Transporte Executivo',
    description: 'Transporte profissional para reuniões e eventos corporativos',
    icon: 'Briefcase',
    image: 'https://images.pexels.com/photos/3972752/pexels-photo-3972752.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'events',
    title: 'Eventos Especiais',
    description: 'Transporte elegante para ocasiões especiais e celebrações',
    icon: 'Calendar',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'hourly',
    title: 'Serviço à Hora',
    description: 'Flexibilidade total com o nosso serviço de transporte à hora',
    icon: 'Clock',
    image: 'https://images.pexels.com/photos/3608542/pexels-photo-3608542.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'weddings',
    title: 'Transfers Casamentos',
    description: 'Torne o seu dia especial ainda mais memorável',
    icon: 'Heart',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'tours',
    title: 'Passeios Privados',
    description: 'Explore destinos com os nossos tours personalizados',
    icon: 'MapPin',
    image: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'nightlife',
    title: 'Passeios Noturnos',
    description: 'Desfrute da vida noturna com segurança e estilo',
    icon: 'Moon',
    image: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  },
  {
    id: 'parties',
    title: 'Transporte Festas',
    description: 'Chegue e saia das suas festas com classe',
    icon: 'Music',
    image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1'
  }
];