
export interface Room {
  id: string;
  name: string;
  dimensions?: string; // Legacy field, kept for compatibility
  width?: number;      // New separate field
  length?: number;     // New separate field
  unit?: 'imperial' | 'metric'; // Unit used for width/length
  description: string;
  linkedRoomIds: string[];
}

export interface Item {
  id: string;
  roomId: string;
  name: string;
  description: string;
  category: string;
  type?: string;
  brand?: string;
  model?: string;
  notes?: string;
  projectIds: string[];
  manualUrl?: string;
  manualTitle?: string;
  value?: number;
  purchaseDate?: string;
  isFixed?: boolean; // Distinguishes Building Insurance items (Fixed) from Contents
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface SearchResult {
  title: string;
  uri: string;
}

export type ViewState = 
  | { type: 'DASHBOARD' }
  | { type: 'ROOM_DETAIL'; roomId: string }
  | { type: 'PROJECTS' }
  | { type: 'PROJECT_DETAIL'; projectId: string }
  | { type: 'ALL_ITEMS' }
  | { type: 'REPORTS' }
  | { type: 'SETTINGS' };

export interface UserPreferences {
  currency: string; // ISO Code (e.g. 'USD', 'ZAR')
  units: 'imperial' | 'metric';
}

export const CATEGORIES = [
  'Furniture',
  'Electronics',
  'Appliances',
  'Decor',
  'Clothing',
  'Tools',
  'Other'
];

export const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'ZAR', symbol: 'R', label: 'South African Rand (R)' },
];

export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

// Helper to format dimensions based on preferences
export const formatRoomDimensions = (room: Room, targetUnit: 'imperial' | 'metric'): string => {
  if (room.width && room.length) {
    let w = room.width;
    let l = room.length;
    // Default to imperial if unit is missing for some reason, or assume matches target if we can't convert
    const sourceUnit = room.unit || targetUnit;

    if (sourceUnit !== targetUnit) {
      if (sourceUnit === 'metric' && targetUnit === 'imperial') {
        w = w * 3.28084;
        l = l * 3.28084;
      } else if (sourceUnit === 'imperial' && targetUnit === 'metric') {
        w = w / 3.28084;
        l = l / 3.28084;
      }
    }

    const unitLabel = targetUnit === 'imperial' ? 'ft' : 'm';
    const area = w * l;
    return `${w.toFixed(1)} x ${l.toFixed(1)} ${unitLabel} (${area.toFixed(1)} sq ${unitLabel})`;
  }
  return room.dimensions || 'Dimensions not set';
};
