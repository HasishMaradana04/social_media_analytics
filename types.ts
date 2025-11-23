export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  followers: number;
  following: number;
  engagementRate: number;
  platform: 'Instagram' | 'Twitter' | 'TikTok' | 'LinkedIn' | 'YouTube' | 'Kindle';
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  sentiment?: string; // AI Analyzed
  platform?: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number; // Percentage change
  period: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  value2?: number; // For comparison
}

export enum AnalysisType {
  SENTIMENT = 'SENTIMENT',
  STRATEGY = 'STRATEGY',
  PREDICTION = 'PREDICTION',
}

export interface AIResponse {
  result: string;
  loading: boolean;
  error?: string;
}