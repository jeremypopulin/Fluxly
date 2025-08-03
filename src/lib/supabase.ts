import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://diyuewnatraebokzeatl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXVld25hdHJhZWJva3plYXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjEzNjIsImV4cCI6MjA2OTIzNzM2Mn0.xvAbWWQaVKpOfmMVvJEqjUaMgxG6t82BGUpVwe8r8HE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // ✅ store login in localStorage
    autoRefreshToken: true,      // ✅ keep session alive without re-login
  },
});
