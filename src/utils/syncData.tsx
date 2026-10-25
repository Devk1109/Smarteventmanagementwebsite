// Central data synchronization utility
// Call this on app start to sync all data from Supabase

import { syncEventsFromSupabase } from './eventStorage';
import { syncRegistrationsFromSupabase } from './registrationStorage';
import { syncClubsFromSupabase, syncMembershipsFromSupabase } from './clubStorage';
import { projectId, publicAnonKey } from './supabase/info';

// Sync organizers from Supabase
async function syncOrganizersFromSupabase(): Promise<void> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-94da7951/make-server-94da7951/data/organizers`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );
    
    const responseText = await response.text();
    let data: { organizers?: unknown[]; error?: string };
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(`Supabase organizers API returned non-JSON (${response.status})`);
    }
    if (!response.ok) throw new Error(data.error || `Supabase organizers API failed (${response.status})`);
    localStorage.setItem('clubhub-organizers', JSON.stringify(data.organizers || []));
  } catch (error) {
    console.error('Error syncing organizers from Supabase:', error);
  }
}

export async function syncAllDataFromSupabase(): Promise<void> {
  console.log('🔄 Syncing all data from Supabase...');
  
  try {
    await Promise.all([
      syncEventsFromSupabase(),
      syncRegistrationsFromSupabase(),
      syncClubsFromSupabase(),
      syncMembershipsFromSupabase(),
      syncOrganizersFromSupabase(),
    ]);
    
    console.log('✅ Data sync complete!');
  } catch (error) {
    console.error('❌ Error syncing data from Supabase:', error);
  }
}

// Auto-sync every 30 seconds to keep data fresh across devices
export function startAutoSync(): void {
  // Sync immediately on start
  syncAllDataFromSupabase();
  
  // Then sync every 30 seconds
  setInterval(() => {
    syncAllDataFromSupabase();
  }, 30000); // 30 seconds
}
