export interface Location {
  lat: number;
  lng: number;
}

export enum ReportCategory {
  PARKING = 'Parking Violation',
  INFRASTRUCTURE = 'Infrastructure/Pothole',
  SAFETY = 'Public Safety',
  CLEANLINESS = 'Sanitation/Litter',
  OTHER = 'Other'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Ticket {
  id?: string;
  userId: string;
  userName: string;
  description: string;
  category: ReportCategory;
  severity: Severity;
  location: Location;
  imageUrl?: string;
  createdAt: any; // Firebase Timestamp
  aiSummary?: string;
}

export interface Radar {
  id: string;
  location: Location;
  type: 'fixed' | 'mobile' | 'average';
  speedLimit: number;
  road: string;
  country: 'PT' | 'ES';
}

export interface AIAnalysis {
  category: ReportCategory;
  severity: Severity;
  summary: string;
}

export interface UserSettings {
  voiceAlertsEnabled: boolean;
  autoReportEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es' | 'fr' | 'de';
  gdprAccepted: boolean;
  usernameOverride?: string;
  bio?: string;
  showRadars?: boolean;
}