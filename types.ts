export type Language = 'ar' | 'en';

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  isPrimary: boolean;
  whatsappMessage?: string;
}

export interface Founder {
  id: string;
  name: string;
  title: string;
  description: string;
  bio: string;
  image: string;
}

export interface Stat {
  id: number;
  label: string;
  value: number;
  suffix: string;
  icon: string;
}

export interface Testimonial {
  id: number;
  content: string;
  author: string;
  role: string;
  rating: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}