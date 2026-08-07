'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      {/* 👨‍🏫 巨大な先生用ダッシュボードボタン */}
      <div style={{ marginBottom: '30px' }}>
        <Link 
          href="/admin" 
          style={{
            padding: '16px 32px',
            backgroundColor: '#4F46E5',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '18px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'inline-block'
          }}
        >
          👨‍🏫 先生用ダッシュボードを開く
        </Link>
      </div>

      <h1>クロスロード・アプリ</h1>
      <p>アプリへようこそ！上のボタンから管理者画面へ移動できます。</p>
    </div>
  );
}