import { createClient } from '@supabase/supabase-js';

// URLを厳密に判定・洗浄する安全関数
const getValidUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // 不正な記号 (< > " ' や空白) を全て除去
  const cleaned = envUrl.replace(/[<>"'\s]/g, '');
  
  try {
    // 実際にURLとして正しく機能するかテスト
    const parsed = new URL(cleaned);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // テスト失敗（不正なURL）の場合は公式URLを強制適用
  }
  
  return 'https://jpuaqnpenlvgtaxpvtfj.supabase.co';
};

const getValidKey = () => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const cleaned = envKey.replace(/[<>"'\s]/g, '');
  return cleaned || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.s';
};

export const supabase = createClient(getValidUrl(), getValidKey());