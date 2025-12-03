export interface ScanResult {
  decodedText: string;
  resultFormat: string;
  timestamp: number;
  productInfo?: ProductInfo | null;
  loading?: boolean;
}

export interface ProductInfo {
  name: string;
  category: string;
  description: string;
  estimatedPrice?: string;
}

export enum ScannerStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
