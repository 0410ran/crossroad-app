import { createClient } from '@supabase/supabase-js';

// 環境変数を取得
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// < > や 引用符 " ' や 空白を自動除去するクリーニング処理
const cleanUrl = rawUrl.replace(/[<>"'\s]/g, '');
const cleanKey = rawKey.replace(/[<>"'\s]/g, '');

// 正しいURL形式か判定し、不十分なら正しい公式URLを強制適用
const supabaseUrl = (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))
  ? cleanUrl
  : 'https://jpuaqnpenlvgtaxpvtfj.supabase.co';

const supabaseAnonKey = cleanKey || 'dummy-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);