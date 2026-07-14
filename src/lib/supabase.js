import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// The app is offline-first: it works fully on localStorage alone. Supabase is a
// sync + cross-device layer that activates only when real credentials are present.
export const supabaseEnabled =
	!!PUBLIC_SUPABASE_URL &&
	!!PUBLIC_SUPABASE_ANON_KEY &&
	PUBLIC_SUPABASE_URL.startsWith('http');

export const supabase = supabaseEnabled
	? createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true
			}
		})
	: null;
