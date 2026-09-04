import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://10.0.2.2:3000';

const config: CapacitorConfig = {
  appId: 'com.viewer.social',
  appName: 'Viewer Social',
  webDir: 'out',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://')
  }
};

export default config;
