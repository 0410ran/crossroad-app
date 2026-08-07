import { createClient } from '@supabase/supabase-js';

const getUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url.trim();
  }
  return 'https://jpuaqnpenlvgtaxpvtfj.supabase.co';
};

const getKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return key.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s';
};

export const supabase = createClient(getUrl(), getKey());