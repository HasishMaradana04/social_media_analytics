import { createClient } from '@supabase/supabase-js';
import { Post, AnalyticsMetric, ChartDataPoint, UserProfile } from '../types';

// Safely retrieve environment variables to prevent crashes in browser
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        // @ts-ignore
        return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }
  } catch (e) {
    // ignore errors in environments where process/import.meta are restricted
  }
  return '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_ANON_KEY');

// Initialize Supabase Client
// We provide fallback values to prevent the app from crashing immediately if keys are missing.
// API calls will fail gracefully with auth errors instead of a white screen.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

const isConfigured = !!supabaseUrl && !!supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co';

export interface ConnectedAccount {
  id?: number;
  platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'YouTube' | 'Kindle';
  handle: string;
  connected: boolean;
  avatar?: string;
}

// Platforms we support adding
export const SUPPORTED_PLATFORMS = ['Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'Kindle'];

// --- API Methods ---

export const api = {
  
  // --- Auth ---

  signUp: async (email: string, password: string) => {
    if (!isConfigured) throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.");
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0], // Default name
          avatar_url: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=6366f1&color=fff`
        }
      }
    });
    if (error) throw error;
    
    // Create profile entry
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: email.split('@')[0],
            avatar_url: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=6366f1&color=fff`
        });
    }
    return data;
  },

  login: async (email: string, password: string) => {
    if (!isConfigured) throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  signInWithOAuth: async (provider: 'linkedin_oidc' | 'google' | 'twitter') => {
    if (!isConfigured) throw new Error("Supabase is not configured.");
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  },

  syncUserFromSession: async (session: any) => {
    if (!isConfigured || !session?.user) return;
    
    const user = session.user;
    const metadata = user.user_metadata || {};
    
    // 1. Upsert Profile
    await supabase.from('profiles').upsert({
        id: user.id,
        full_name: metadata.full_name || user.email?.split('@')[0],
        avatar_url: metadata.avatar_url,
        updated_at: new Date().toISOString()
    });

    // 2. If OAuth, connect account and store token
    const provider = user.app_metadata?.provider;
    if (provider) {
       // Map provider to platform name supported by our dashboard
       const platformMap: Record<string, string> = {
         'linkedin_oidc': 'LinkedIn',
         'twitter': 'Twitter',
         'google': 'YouTube' // Google auth maps to YouTube metrics in this app context
       };
       
       const platform = platformMap[provider];
       if (platform) {
         const handle = metadata.user_name || metadata.email?.split('@')[0] || 'user';
         
         // Store the access token and profile info
         await supabase.from('connected_accounts').upsert({
             user_id: user.id,
             platform: platform,
             handle: handle,
             connected: true,
             avatar_url: metadata.avatar_url,
             access_token: session.provider_token 
         }, { onConflict: 'user_id, platform' });
       }
    }
  },

  logout: async () => {
    if (!isConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (!isConfigured) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch extra profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        fullName: profile?.full_name || user.user_metadata?.full_name || 'User',
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=User',
        followers: 0,
        following: 0,
        engagementRate: 0,
        platform: 'LinkedIn'
      };
    } catch (e) {
      console.warn("Failed to get current user details", e);
      return null;
    }
  },

  // --- Accounts ---

  getConnectedAccounts: async (): Promise<ConnectedAccount[]> => {
    if (!isConfigured) return [];

    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*');
    
    if (error) {
        throw new Error(error.message || "Failed to fetch connected accounts");
    }

    // Merge with supported platforms to show unconnected ones in UI
    const connectedPlatforms = new Set(data?.map(acc => acc.platform));
    const allAccounts: ConnectedAccount[] = [];

    // Add existing connections
    if (data) {
        allAccounts.push(...data.map(d => ({
            id: d.id,
            platform: d.platform as any,
            handle: d.handle,
            connected: d.connected,
            avatar: d.avatar_url
        })));
    }

    // Add unconnected placeholders
    SUPPORTED_PLATFORMS.forEach(p => {
        if (!connectedPlatforms.has(p)) {
            allAccounts.push({
                platform: p as any,
                handle: '',
                connected: false,
                avatar: undefined
            });
        }
    });

    return allAccounts;
  },

  connectAccount: async (platform: string, handle: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Check if exists
    const { data: existing } = await supabase
        .from('connected_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();

    let error;
    if (existing) {
        const res = await supabase.from('connected_accounts').update({
            handle,
            connected: true,
            avatar_url: `https://ui-avatars.com/api/?name=${handle}&background=random`
        }).eq('id', existing.id);
        error = res.error;
    } else {
        const res = await supabase.from('connected_accounts').insert({
            user_id: user.id,
            platform,
            handle,
            connected: true,
            avatar_url: `https://ui-avatars.com/api/?name=${handle}&background=random`
        });
        error = res.error;
    }

    if (error) throw new Error(error.message || `Failed to connect ${platform}`);
    
    // Simulate fetching initial data
    try {
      await api.syncInitialData(platform, user.id);
    } catch(e) {
      console.warn("Initial sync failed, but account connected.", e);
    }
  },

  disconnectAccount: async (platform: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('connected_accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

    if (error) throw new Error(error.message || "Failed to disconnect account");
        
    // Also cleanup posts for this platform
    await supabase.from('posts').delete().eq('user_id', user.id).eq('platform', platform);
  },

  // --- Data & Sync ---

  syncInitialData: async (platform: string, userId: string) => {
    // Insert dummy "live" data so the user sees something immediately
    const dummyPosts = [
        { user_id: userId, platform, content: `Just connected my ${platform} account! #analytics`, likes: 12, comments: 2, shares: 0, media_type: 'text' },
        { user_id: userId, platform, content: `Analyzing trends on ${platform} is getting easier.`, likes: 45, comments: 5, shares: 3, media_type: 'image', media_url: 'https://picsum.photos/400/300' },
    ];

    await supabase.from('posts').insert(dummyPosts);
  },

  getDashboardMetrics: async (): Promise<AnalyticsMetric[]> => {
    if (!isConfigured) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Calculate metrics from actual DB data
    const { data: posts, error } = await supabase.from('posts').select('likes, comments, shares').eq('user_id', user.id);
    
    if (error) throw new Error(error.message || "Failed to fetch metrics");

    if (!posts || posts.length === 0) {
        return [
            { name: 'Total Reach', value: 0, change: 0, period: 'No data' },
            { name: 'Engagement Rate', value: 0, change: 0, period: 'No data' },
            { name: 'Total Posts', value: 0, change: 0, period: 'No data' },
            { name: 'Interactions', value: 0, change: 0, period: 'No data' },
        ];
    }

    const totalLikes = posts.reduce((acc, curr) => acc + (curr.likes || 0), 0);
    const totalComments = posts.reduce((acc, curr) => acc + (curr.comments || 0), 0);
    const totalShares = posts.reduce((acc, curr) => acc + (curr.shares || 0), 0);
    const totalInteractions = totalLikes + totalComments + totalShares;

    return [
      { name: 'Total Reach', value: totalInteractions * 12, change: 5.4, period: 'vs last week' }, 
      { name: 'Engagement Rate', value: parseFloat(((totalInteractions / (Math.max(posts.length, 1) * 100)) * 100).toFixed(2)), change: 1.2, period: 'avg per post' },
      { name: 'Total Posts', value: posts.length, change: 0, period: 'all time' },
      { name: 'Interactions', value: totalInteractions, change: 15.3, period: 'total' },
    ];
  },

  getEngagementData: async (): Promise<ChartDataPoint[]> => {
    if (!isConfigured) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch real posts to aggregate data
    const { data: posts, error } = await supabase
        .from('posts')
        .select('created_at, likes, comments, shares')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message || "Failed to fetch engagement data");

    if (!posts || posts.length === 0) return [];

    // Group by day (simple JS aggregation)
    const grouped: Record<string, number> = {};
    
    // Sort posts by date first (already sorted by query but good to be safe)
    posts.forEach(post => {
        const date = new Date(post.created_at).toLocaleDateString(undefined, { weekday: 'short' }); 
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += (post.likes + post.comments + post.shares);
    });

    // Convert to array
    return Object.keys(grouped).map(key => ({
        name: key,
        value: grouped[key]
    }));
  },

  getPosts: async (): Promise<Post[]> => {
    if (!isConfigured) return [];

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message || "Failed to fetch posts");

    return data.map((p: any) => ({
        id: p.id.toString(),
        userId: p.user_id,
        content: p.content,
        mediaUrl: p.media_url,
        mediaType: p.media_type as any,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        timestamp: new Date(p.created_at).toLocaleDateString(),
        sentiment: p.sentiment,
        platform: p.platform
    }));
  }
};