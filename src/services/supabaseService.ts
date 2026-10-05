import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://osffgqrbsxqnmkqzjtff.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZmZncXJic3hxbm1rcXpqdGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMjg0MTYsImV4cCI6MjEwNjcwNDQxNn0.18iPcr9AU1ws3EErtvpznj9MWY4c6CMWhFMs6DSgjc8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEVICE_ID_KEY = 'sky_launcher_device_id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export class CloudSyncService {
  private syncTimer: any = null;

  constructor() {
    this.initSync();
  }

  private async initSync() {
    // Pull on startup
    await this.pullSettingsFromCloud();
  }

  public async pullSettingsFromCloud() {
    try {
      const deviceId = getDeviceId();
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (error) {
        console.warn('[CloudSync] Pull error:', error.message);
        return;
      }

      if (data) {
        console.log('[CloudSync] Synced settings from Supabase:', data);
        if (data.settings && Object.keys(data.settings).length > 0) {
          localStorage.setItem('sky_launcher_settings', JSON.stringify(data.settings));
        }
        if (data.sources && data.sources.length > 0) {
          localStorage.setItem('sky_launcher_sources', JSON.stringify(data.sources));
        }
        if (data.library && data.library.length > 0) {
          localStorage.setItem('sky_launcher_library_real', JSON.stringify(data.library));
        }
      } else {
        // First time on this device: push initial state to cloud
        await this.pushSettingsToCloud();
      }
    } catch (err) {
      console.warn('[CloudSync] Pull exception:', err);
    }
  }

  public schedulePush() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.pushSettingsToCloud();
    }, 1500);
  }

  public async pushSettingsToCloud() {
    try {
      const deviceId = getDeviceId();
      const settingsStr = localStorage.getItem('sky_launcher_settings') || '{}';
      const sourcesStr = localStorage.getItem('sky_launcher_sources') || '[]';
      const libraryStr = localStorage.getItem('sky_launcher_library_real') || '[]';

      const payload = {
        device_id: deviceId,
        settings: JSON.parse(settingsStr),
        sources: JSON.parse(sourcesStr),
        library: JSON.parse(libraryStr),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'device_id' });

      if (error) {
        console.warn('[CloudSync] Push error:', error.message);
      } else {
        console.log('[CloudSync] Successfully backed up settings & library to Supabase cloud!');
      }
    } catch (err) {
      console.warn('[CloudSync] Push exception:', err);
    }
  }
}

export const cloudSync = new CloudSyncService();
