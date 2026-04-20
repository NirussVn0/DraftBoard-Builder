import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import type { QuizState } from '../../core/GameState';
import type { Player } from '../../core/GameState';
import { gameEngine } from '../../core/GameEngine';

interface PopQuizOverlayProps {
  quizState: QuizState;
  players: Player[];
}

export const PopQuizOverlay: React.FC<PopQuizOverlayProps> = ({ quizState, players }) => {
  const vsRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const challenger = players.find(p => p.id === quizState.challengerId);
  const opponent = players.find(p => p.id === quizState.opponentId);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    anime.timeline()
      .add({
        targets: card1Ref.current,
        translateX: [-window.innerWidth, 0],
        rotate: [-15, 0],
        duration: 700,
        easing: 'easeOutElastic(1, .7)',
      })
      .add({
        targets: card2Ref.current,
        translateX: [window.innerWidth, 0],
        rotate: [15, 0],
        duration: 700,
        easing: 'easeOutElastic(1, .7)',
      }, '-=500')
      .add({
        targets: vsRef.current,
        scale: [0, 1.3, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .8)',
      }, '-=300');
  }, []);

  const handleWinner = (winnerId: string) => {
    const loserId = winnerId === challenger?.id ? opponent?.id : challenger?.id;
    if (!loserId) return;
    gameEngine.pushQuizResult(winnerId, loserId);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      {/* Ink splatter background effect */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 30% 40%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 70% 60%, #dc2626 0%, transparent 50%)',
      }} />

      <p className="text-white/60 text-sm font-bold tracking-[0.3em] uppercase mb-6 z-10">📝 Kiểm Tra Miệng Khẩn Cấp 📝</p>

      <div className="flex items-center gap-8 z-10 w-full max-w-2xl px-4">
        {/* Challenger card */}
        <div ref={card1Ref} className="flex-1 flex flex-col items-center gap-4">
          <div className="w-full game-card border-4 p-6 text-center" style={{ borderColor: challenger?.color, background: (challenger?.color ?? '#fff') + '22' }}>
            <div className="text-6xl mb-3">{challenger?.emoji}</div>
            <div className="text-2xl font-black text-white drop-shadow">{challenger?.name}</div>
          </div>
          {quizState.phase === 'WAITING_HOST' && (
            <button
              onClick={() => challenger && handleWinner(challenger.id)}
              className="w-full py-3 font-black text-white game-card text-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: challenger?.color }}
            >
              🏆 THẮNG
            </button>
          )}
        </div>

        {/* VS badge */}
        <div ref={vsRef} className="shrink-0 opacity-0 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.6)] z-10 relative">
            <span className="text-white font-black text-2xl">VS</span>
          </div>
        </div>

        {/* Opponent card */}
        <div ref={card2Ref} className="flex-1 flex flex-col items-center gap-4">
          <div className="w-full game-card border-4 p-6 text-center" style={{ borderColor: opponent?.color, background: (opponent?.color ?? '#fff') + '22' }}>
            <div className="text-6xl mb-3">{opponent?.emoji}</div>
            <div className="text-2xl font-black text-white drop-shadow">{opponent?.name}</div>
          </div>
          {quizState.phase === 'WAITING_HOST' && (
            <button
              onClick={() => opponent && handleWinner(opponent.id)}
              className="w-full py-3 font-black text-white game-card text-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: opponent?.color }}
            >
              🏆 THẮNG
            </button>
          )}
        </div>
      </div>

      {quizState.phase === 'VS_SCREEN' && (
        <button
          onClick={() => gameEngine.advanceQuizPhase()}
          className="mt-8 z-10 px-8 py-3 game-card bg-yellow-400 text-black font-black text-lg hover:scale-105 active:scale-95 transition-all"
        >
          📋 Bắt Đầu Câu Hỏi
        </button>
      )}

      {quizState.phase === 'QUESTION' && (
        <div className="mt-8 z-10 text-center">
          <p className="text-yellow-300 font-black text-3xl animate-pulse mb-4">QUESTION</p>
          <p className="text-white/70 text-sm">Quản trò đọc câu hỏi. Ai trả lời đúng trước thì bấm nút THẮNG.</p>
          <button
            onClick={() => gameEngine.advanceQuizPhase()}
            className="mt-4 px-6 py-2 game-card bg-white/10 text-white font-bold hover:bg-white/20 transition-all"
          >
            Sẵn sàng →
          </button>
        </div>
      )}

      {quizState.phase === 'WAITING_HOST' && (
        <button
          onClick={() => gameEngine.pushQuizDraw()}
          className="mt-6 z-10 px-8 py-3 game-card bg-slate-600 hover:bg-slate-500 text-white font-black text-base transition-all hover:scale-105 active:scale-95 border-2 border-slate-400/30"
        >
          🤝 Hoà — Không ai trả lời được
        </button>
      )}
    </div>
  );
};
