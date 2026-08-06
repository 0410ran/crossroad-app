'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Answer = {
  id: number;
  created_at: string;
  choice: 'YES' | 'NO';
  reason: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'results'>('results');
  const [isRevealed, setIsRevealed] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // 問題作成フォームの入力値
  const [newSituation, setNewSituation] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 初回読み込み＆リアルタイム受信
  useEffect(() => {
    const fetchAnswers = async () => {
      const { data } = await supabase.from('answers').select('*').order('id', { ascending: true });
      if (data) setAnswers(data as Answer[]);
    };

    fetchAnswers();

    const channel = supabase
      .channel('answers_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'answers' },
        (payload) => {
          setAnswers((prev) => [...prev, payload.new as Answer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 新しい問題の投稿処理
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSituation || !newQuestion) {
      alert('【状況】と【問い】の両方を入力してください。');
      return;
    }

    setIsCreating(true);

    try {
      // 1. 既存の全問題を非アクティブ化
      await supabase.from('questions').update({ is_active: false }).gte('id', 0);

      // 2. 新しい問題を追加
      const { error } = await supabase
        .from('questions')
        .insert([{ situation: newSituation, question: newQuestion, is_active: true }]);

      if (error) throw error;

      // 3. 前の問題の回答データをクリア＆開示フラグを隠す
      await supabase.from('answers').delete().gte('id', 0);
      setAnswers([]);
      setIsRevealed(false);

      alert('新しい問題を配信しました！生徒画面も自動更新されました。');
      setNewSituation('');
      setNewQuestion('');
      setActiveTab('results'); // スクリーンタブへ移動
    } catch (error) {
      console.error(error);
      alert('問題の更新に失敗しました。');
    } finally {
      setIsCreating(false);
    }
  };

  // 回答のリセット
  const handleReset = async () => {
    if (confirm('生徒の回答データを全てクリアしますか？')) {
      await supabase.from('answers').delete().gte('id', 0);
      setAnswers([]);
    }
  };

  const yesCount = answers.filter((a) => a.choice === 'YES').length;
  const noCount = answers.filter((a) => a.choice === 'NO').length;
  const totalCount = answers.length;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🏫</span> 先生用ダッシュボード
            </h1>
            <p className="text-xs text-slate-400 mt-1">建築基準法・クロスロードゲーム管理画面</p>
          </div>

          <div className="bg-slate-800 p-1 rounded-lg flex gap-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                activeTab === 'create' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ① 問題作成
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition ${
                activeTab === 'results' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ② 授業用スクリーン（結果表示）
            </button>
          </div>
        </header>

        {/* タブ1: 問題作成 */}
        {activeTab === 'create' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
              📝 新しい問題を作成して配信する
            </h2>
            <form className="space-y-6" onSubmit={handleCreateQuestion}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">【状況】の説明文</label>
                <textarea
                  rows={4}
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="例：既存不適格の木造住宅の改修工事計画中..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">【問い】の質問文</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500"
                  placeholder="例：増築面積を10㎡以内に抑えて確認申請を不要にするプランを勧めますか？"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
              >
                {isCreating ? '配信中...' : 'この問題でゲームを開始する（生徒画面を更新）🚀'}
              </button>
            </form>
          </div>
        )}

        {/* タブ2: 授業用スクリーン */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* QRコード */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-slate-400 mb-2">生徒はここから参加</p>
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000"
                  alt="QR Code"
                  className="bg-white p-2 rounded-lg shadow-md mb-2"
                />
                <p className="text-xs font-mono text-blue-400">http://localhost:3000</p>
              </div>

              {/* 回答状況 */}
              <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-200">現在の回答状況</h3>
                    <div className="flex gap-2 items-center">
                      <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-700 text-xs px-3 py-1 rounded-full animate-pulse">
                        ● リアルタイム受信中（現在 {totalCount} 名回答）
                      </span>
                      <button
                        onClick={handleReset}
                        className="text-xs text-rose-400 hover:underline border border-rose-800/50 bg-rose-950/30 px-2 py-1 rounded"
                      >
                        回答データリセット
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    生徒の回答が集まったら「結果を一斉開示」ボタンを押して、全員でディスカッションしましょう！
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    表示状態: <strong className={isRevealed ? "text-emerald-400" : "text-amber-400"}>
                      {isRevealed ? "【公開中】" : "【非公開（ブラインド中）】"}
                    </strong>
                  </span>
                  <button
                    onClick={() => setIsRevealed(!isRevealed)}
                    className={`px-6 py-3 rounded-lg font-bold shadow-lg transition ${
                      isRevealed
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white text-lg'
                    }`}
                  >
                    {isRevealed ? '🫣 結果を隠す' : '👀 結果を一斉開示（オープン！）'}
                  </button>
                </div>
              </div>
            </div>

            {/* 結果表示エリア */}
            {isRevealed ? (
              <div className="space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h3 className="text-lg font-bold mb-4">【回答比率】</h3>
                  {totalCount > 0 ? (
                    <div className="flex h-12 rounded-xl overflow-hidden font-bold text-lg shadow-inner">
                      <div
                        style={{ width: `${(yesCount / totalCount) * 100}%` }}
                        className="bg-emerald-600 flex items-center justify-center transition-all duration-500"
                      >
                        YES {Math.round((yesCount / totalCount) * 100)}% ({yesCount}人)
                      </div>
                      <div
                        style={{ width: `${(noCount / totalCount) * 100}%` }}
                        className="bg-rose-600 flex items-center justify-center transition-all duration-500"
                      >
                        NO {Math.round((noCount / totalCount) * 100)}% ({noCount}人)
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">まだ回答がありません。</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 p-6 rounded-xl border border-emerald-900/50">
                    <h4 className="font-bold text-emerald-400 border-b border-emerald-900/50 pb-2 mb-4">
                      🟢 YESを選んだ理由 ({yesCount}件)
                    </h4>
                    <ul className="space-y-3">
                      {answers.filter(a => a.choice === 'YES').map(a => (
                        <li key={a.id} className="bg-slate-900 p-3 rounded border border-slate-700 text-sm">
                          {a.reason || '（理由なし）'}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-800 p-6 rounded-xl border border-rose-900/50">
                    <h4 className="font-bold text-rose-400 border-b border-rose-900/50 pb-2 mb-4">
                      🔴 NOを選んだ理由 ({noCount}件)
                    </h4>
                    <ul className="space-y-3">
                      {answers.filter(a => a.choice === 'NO').map(a => (
                        <li key={a.id} className="bg-slate-900 p-3 rounded border border-slate-700 text-sm">
                          {a.reason || '（理由なし）'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-12 text-center text-slate-500">
                <span className="text-4xl block mb-2">🔒</span>
                結果はブラインドされています。「結果を一斉開示」ボタンを押すと全員の集計結果と理由が表示されます。
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}