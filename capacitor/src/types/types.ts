export type Item = {
  barcode: string;
  name: string;
  count: number;
  price?: number;
};

export type DeviceInfo = {
  model: string;
  osVersion?: string;
  operatingSystem?: string;
  androidSDKVersion?: number;
  manufacturer?: string;
  webViewVersion?: string;
};

export type BatteryInfo = {
  batteryLevel?: number;
  isCharging?: boolean;
};