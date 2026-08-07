import { createClient } from '@supabase/supabase-js';

// URLから不完全な文字を一切排除する安全関数
const getSafeUrl = () => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const cleaned = raw.replace(/[^a-zA-Z0-9:./-_]/g, '');
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }
  return 'https://jpuaqnpenlvgtaxpvtfj.supabase.co';
};

const getSafeKey = () => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const cleaned = raw.replace(/[^a-zA-Z0-9._-]/g, '');
  return cleaned || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s';
};

export const supabase = createClient(getSafeUrl(), getSafeKey());