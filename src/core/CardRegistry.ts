import type { CardDefinition, CardId } from './CardTypes';


export const CARD_DEFINITIONS: Map<CardId, CardDefinition> = new Map([
  ['EUREKA', {
    id: 'EUREKA', tier: 'GREEN', icon: '💡',
    name: 'Eureka! Sáng Kiến',
    description: 'Có ý tưởng hay. Tiến thẳng về phía trước!',
    resolve: (ctx) => {
      const [min, max] = ctx.deckConfig.eurekaRange;
      const steps = Math.floor(Math.random() * (max - min + 1)) + min;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps };
    },
  }],

  ['LIFEBUOY', {
    id: 'LIFEBUOY', tier: 'GREEN', icon: '🛟',
    name: 'Phao Cứu Sinh',
    description: 'Miễn nhiễm 1 lần điểm kém/phạt. Bị phạt sẽ vỡ phao.',
    resolve: (ctx) => ({
      type: 'BUFF',
      targetPlayerIds: [ctx.activePlayer.id],
      buff: { id: 'LIFEBUOY', turnsRemaining: -1, sourcePlayerId: ctx.activePlayer.id },
    }),
  }],

  ['COUNTER_ARGUMENT', {
    id: 'COUNTER_ARGUMENT', tier: 'GREEN', icon: '💬',
    name: 'Phản Biện (Counter)',
    description: `Bật thầy bật bạn! Kẻ tấn công nhận lại TOÀN BỘ sát thương trong ${3} lượt.`,
    resolve: (ctx) => ({
      type: 'BUFF',
      targetPlayerIds: [ctx.activePlayer.id],
      buff: { id: 'COUNTER_ARGUMENT', turnsRemaining: ctx.deckConfig.counterTurns, sourcePlayerId: ctx.activePlayer.id },
    }),
  }],

  ['PARASITE', {
    id: 'PARASITE', tier: 'GREEN', icon: '🦠',
    name: 'Ăn Bám (Parasite)',
    description: 'Lượt sau, người kế tiếp bị chia đôi số bước, phần đó cộng cho bạn.',
    resolve: (ctx) => ({
      type: 'BUFF',
      targetPlayerIds: [ctx.activePlayer.id],
      buff: { id: 'PARASITE', turnsRemaining: 1, sourcePlayerId: ctx.activePlayer.id },
    }),
  }],

  ['MIND_BLANK', {
    id: 'MIND_BLANK', tier: 'RED', icon: '😶‍🌫️',
    name: 'Mất Não (Blank)',
    description: 'Quên sạch kiến thức đã học. Đi lùi!',
    resolve: (ctx) => {
      const [min, max] = ctx.deckConfig.mindBlankRange;
      const steps = Math.floor(Math.random() * (max - min + 1)) + min;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps: -steps };
    },
  }],

  ['DEADLINE_BOMB', {
    id: 'DEADLINE_BOMB', tier: 'RED', icon: '💣',
    name: 'Bom Deadline',
    description: 'Kéo đứa đầu bảng chết chung! Cả hai lùi về cùng điểm!',
    resolve: (ctx) => {
      let top1 = ctx.allPlayers[0];
      for (const p of ctx.allPlayers) if (p.position > top1.position) top1 = p;
      if (ctx.deckConfig.deadlineBombMode === 'RESET_ZERO') {
        return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id, top1.id], newPosition: 0 };
      }
      return { type: 'TELEPORT', targetPlayerIds: [top1.id], newPosition: ctx.activePlayer.position };
    },
  }],

  ['BLACKOUT', {
    id: 'BLACKOUT', tier: 'RED', icon: '🔌',
    name: 'Cúp Điện (Blackout)',
    description: 'Bạn an toàn. Tất cả những đứa khác bị lùi lại!',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id).map(p => p.id);
      return { type: 'MOVE', targetPlayerIds: others, steps: -ctx.deckConfig.blackoutSteps };
    },
  }],

  ['DETENTION', {
    id: 'DETENTION', tier: 'RED', icon: '⛓️',
    name: 'Cấm Túc (Detention)',
    description: 'Bị giám thị bắt! Phải lắc ra đúng số 6 mới được thả.',
    resolve: (ctx) => ({
      type: 'DETENTION',
      targetPlayerIds: [ctx.activePlayer.id],
    }),
  }],

  ['POP_QUIZ', {
    id: 'POP_QUIZ', tier: 'PURPLE', icon: '📝',
    name: 'Kiểm Tra Miệng',
    description: 'Solo 1v1 với một đứa random! Quản trò phân xử.',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
      const opponent = others[Math.floor(Math.random() * others.length)];
      return { type: 'QUIZ', targetPlayerIds: [ctx.activePlayer.id], quizOpponentId: opponent?.id || ctx.activePlayer.id };
    },
  }],

  ['SUPERVISOR_HAND', {
    id: 'SUPERVISOR_HAND', tier: 'PURPLE', icon: '🖐️',
    name: 'Bàn Tay Giám Thị',
    description: 'Giám thị tóm cổ một đứa ngẫu nhiên ném về bét bảng!',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
      const target = others[Math.floor(Math.random() * others.length)];
      let last = ctx.allPlayers[0];
      for (const p of ctx.allPlayers) if (p.position < last.position) last = p;
      return { type: 'TELEPORT', targetPlayerIds: [target?.id || ctx.activePlayer.id], newPosition: last.position };
    },
  }],

  ['NINJA_COPY', {
    id: 'NINJA_COPY', tier: 'PURPLE', icon: '🥷',
    name: 'Ninja Copy',
    description: 'Copy bài đứa đứng đầu, bay lên ngay sau nó!',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
      let target = others[0];
      if (ctx.deckConfig.ninjaCopyTarget === 'TOP1') {
        for (const p of others) if (p.position > (target?.position ?? 0)) target = p;
      } else {
        target = others[Math.floor(Math.random() * others.length)];
      }
      return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id], newPosition: Math.max(0, (target?.position ?? 0) - 1) };
    },
  }],

  ['AMENOTEJIKARA', {
    id: 'AMENOTEJIKARA', tier: 'PURPLE', icon: '🔄',
    name: 'Chuyển Sinh',
    description: 'Tráo đổi hoàn toàn vị trí với một người chơi random!',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id);
      const target = others[Math.floor(Math.random() * others.length)];
      return { type: 'SWAP', targetPlayerIds: [ctx.activePlayer.id], swapTargetId: target?.id || ctx.activePlayer.id };
    },
  }],

  ['ZA_WARUDO', {
    id: 'ZA_WARUDO', tier: 'PURPLE', icon: '⏱️',
    name: 'The World — Za Warudo!',
    description: 'Đóng băng thời gian. Kẻ bị nhắm mục tiêu mất lượt!',
    resolve: (ctx) => {
      const others = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id).map(p => p.id);
      if (ctx.deckConfig.zaWarudoMode === 'FREEZE_ONE') {
        const target = others[Math.floor(Math.random() * others.length)];
        return { type: 'FREEZE', targetPlayerIds: [target ?? ctx.activePlayer.id], freezeTurns: 1 };
      }
      return { type: 'FREEZE', targetPlayerIds: others, freezeTurns: 1 };
    },
  }],

  ['MYSTERY', {
    id: 'MYSTERY', tier: 'PURPLE', icon: '❓',
    name: 'Mystery Box',
    description: 'Hộp bí ẩn. Hên xui lùi hoặc tiến từ 3 đến 6 bước!',
    resolve: (ctx) => {
      // random +3 to +6 OR -3 to -6
      const steps = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6
      const sign = Math.random() > 0.5 ? 1 : -1;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps: steps * sign };
    },
  }]
]);
