import { Radar } from '../types';

// Coleção representativa de radares fixos principais baseada em dados públicos de Portugal (ANSR) e Espanha (DGT)
export const officialRadars: Radar[] = [
  // PORTUGAL (SINCRO - Exemplos principais)
  { id: 'PT-01', location: { lat: 38.7436, lng: -9.1602 }, type: 'fixed', speedLimit: 80, road: 'A1 - Lisboa', country: 'PT' },
  { id: 'PT-02', location: { lat: 41.1621, lng: -8.6233 }, type: 'fixed', speedLimit: 90, road: 'VCI - Porto', country: 'PT' },
  { id: 'PT-03', location: { lat: 38.6593, lng: -9.1554 }, type: 'fixed', speedLimit: 100, road: 'A2 - Almada', country: 'PT' },
  { id: 'PT-04', location: { lat: 37.1356, lng: -8.5361 }, type: 'fixed', speedLimit: 120, road: 'A22 - Algarve', country: 'PT' },
  { id: 'PT-05', location: { lat: 40.2033, lng: -8.4102 }, type: 'fixed', speedLimit: 120, road: 'A1 - Coimbra', country: 'PT' },
  { id: 'PT-06', location: { lat: 38.7883, lng: -9.1121 }, type: 'fixed', speedLimit: 80, road: 'IC2 - Sacavém', country: 'PT' },
  { id: 'PT-07', location: { lat: 38.7071, lng: -9.3906 }, type: 'fixed', speedLimit: 80, road: 'A5 - Cascais', country: 'PT' },
  { id: 'PT-08', location: { lat: 38.5244, lng: -8.8882 }, type: 'fixed', speedLimit: 50, road: 'EN10 - Setúbal', country: 'PT' },
  { id: 'PT-09', location: { lat: 39.2333, lng: -8.6833 }, type: 'fixed', speedLimit: 90, road: 'IC10 - Santarém', country: 'PT' },
  { id: 'PT-10', location: { lat: 41.5503, lng: -8.4200 }, type: 'fixed', speedLimit: 90, road: 'Circular de Braga', country: 'PT' },

  // ESPANHA (DGT - Exemplos principais)
  { id: 'ES-01', location: { lat: 40.4168, lng: -3.7038 }, type: 'fixed', speedLimit: 70, road: 'M-30 - Madrid', country: 'ES' },
  { id: 'ES-02', location: { lat: 41.3851, lng: 2.1734 }, type: 'fixed', speedLimit: 80, road: 'B-10 - Barcelona', country: 'ES' },
  { id: 'ES-03', location: { lat: 39.4699, lng: -0.3763 }, type: 'fixed', speedLimit: 90, road: 'V-30 - Valência', country: 'ES' },
  { id: 'ES-04', location: { lat: 37.3891, lng: -5.9845 }, type: 'fixed', speedLimit: 80, road: 'SE-30 - Sevilha', country: 'ES' },
  { id: 'ES-05', location: { lat: 43.2630, lng: -2.9350 }, type: 'fixed', speedLimit: 100, road: 'A-8 - Bilbau', country: 'ES' },
  { id: 'ES-06', location: { lat: 36.7213, lng: -4.4214 }, type: 'fixed', speedLimit: 80, road: 'MA-20 - Málaga', country: 'ES' },
  { id: 'ES-07', location: { lat: 42.8467, lng: -2.6716 }, type: 'fixed', speedLimit: 120, road: 'A-1 - Vitoria', country: 'ES' },
  { id: 'ES-08', location: { lat: 41.6488, lng: -0.8891 }, type: 'fixed', speedLimit: 120, road: 'A-2 - Zaragoza', country: 'ES' },
  { id: 'ES-09', location: { lat: 43.3623, lng: -8.4115 }, type: 'fixed', speedLimit: 80, road: 'AC-11 - A Coruña', country: 'ES' },
  { id: 'ES-10', location: { lat: 39.5696, lng: 2.6502 }, type: 'fixed', speedLimit: 80, road: 'Ma-20 - Palma', country: 'ES' },
  { id: 'ES-11', location: { lat: 40.4637, lng: -3.6750 }, type: 'fixed', speedLimit: 120, road: 'A-1 km 12 - Madrid', country: 'ES' },
  { id: 'ES-12', location: { lat: 40.3241, lng: -3.7512 }, type: 'fixed', speedLimit: 100, road: 'A-42 km 14 - Getafe', country: 'ES' },
];