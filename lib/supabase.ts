import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const cleanUrl = rawUrl.replace(/[<>"'\s]/g, '');
const cleanKey = rawKey.replace(/[<>"'\s]/g, '');

const supabaseUrl = (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))
  ? cleanUrl
  : 'https://jpuaqnpenlvgtaxpvtfj.supabase.co';

// 万が一キーが読み込めていなくてもビルドエラーにならないダミーフォーマット
const supabaseAnonKey = cleanKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);