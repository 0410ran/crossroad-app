'use client';
import Link from 'next/link';

// ... (既存のコード)

{/* ボタンを置きたい場所に以下を貼り付けます */}
<div style={{ padding: '10px', textAlign: 'right' }}>
  <Link 
    href="/admin" 
    style={{
      padding: '10px 20px',
      backgroundColor: '#4F46E5', // お好みの色に変更できます
      color: 'white',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      display: 'inline-block'
    }}
  >
    👨‍🏫 先生用ダッシュボードへ
  </Link>
</div>
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Question = {
  id: number;
  situation: string;
  question: string;
};

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<'YES' | 'NO' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初回読み込み＆先生が問題を変えたときのリアルタイム受信
  useEffect(() => {
    // アクティブな最新問題の取得
    const fetchQuestion = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setCurrentQuestion(data[0]);
      }
    };

    fetchQuestion();

    // 先生が新しい問題を送信した瞬間に問題文を自動で更新する
    const channel = supabase
      .channel('questions_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        (payload) => {
          setCurrentQuestion(payload.new as Question);
          // 問題が変わったら生徒の回答状態をリセット
          setIsSubmitted(false);
          setSelected(null);
          setReason('');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      alert('YES または NO を選択してください！');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('answers')
        .insert([{ choice: selected, reason: reason }]);

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">回答を送信しました！</h1>
          <p className="text-slate-600 mb-6">先生が結果を一斉開示するまでお待ちください。</p>

          <div className="bg-slate-50 p-4 rounded-lg text-left border border-slate-200 mb-6">
            <p className="text-sm font-semibold text-slate-500">あなたの選択:</p>
            <p className={`text-xl font-bold mt-1 ${selected === 'YES' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {selected}
            </p>
            <p className="text-sm font-semibold text-slate-500 mt-3">理由:</p>
            <p className="text-slate-700 text-sm mt-1">{reason || '（理由なし）'}</p>
          </div>

          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← もう一度回答し直す
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            建築基準法・単体規定編
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-3">
            クロスロードゲーム
          </h1>
        </div>

        {/* 状況 */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r">
          <h2 className="font-bold text-amber-900 mb-1">【状況】</h2>
          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
            {currentQuestion ? currentQuestion.situation : '問題データを読み込み中...'}
          </p>
        </div>

        {/* 問い */}
        <div className="mb-8">
          <h2 className="font-bold text-slate-800 mb-2">【問い】</h2>
          <p className="text-slate-800 font-medium text-lg bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap">
            {currentQuestion ? currentQuestion.question : '読み込み中...'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setSelected('YES')}
              className={`py-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center transition border-2 ${
                selected === 'YES'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50'
              }`}
            >
              YES
            </button>

            <button
              type="button"
              onClick={() => setSelected('NO')}
              className={`py-4 rounded-xl font-bold text-xl flex flex-col items-center justify-center transition border-2 ${
                selected === 'NO'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                  : 'bg-white text-rose-600 border-rose-600 hover:bg-rose-50'
              }`}
            >
              NO
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              選択した理由（自由記述）:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="理由を入力してください..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading || !currentQuestion}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50"
          >
            {loading ? '送信中...' : '回答を送信する'}
          </button>
        </form>
      </div>
    </main>
  );
}