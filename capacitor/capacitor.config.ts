import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.etm571.mc18scan',
  appName: 'zebramc18scan',
  webDir: 'dist',
   android: {
    zoomEnabled: false
  }
};

export default config;
