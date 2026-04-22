import type { CardDefinition, CardId } from './CardTypes';


export const CARD_DEFINITIONS: Map<CardId, CardDefinition> = new Map([
  ['EUREKA', {
    id: 'EUREKA', tier: 'GREEN', icon: '💡',
    name: 'Eureka! Sáng Kiến',
    description: 'Bộ óc bùng cháy! Tiến lên ngẫu nhiên từ 1 đến 6 bước!',
    resolve: (ctx) => {
      const [min, max] = ctx.deckConfig.eurekaRange;
      const steps = Math.floor(Math.random() * (max - min + 1)) + min;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps };
    },
  }],

  ['LIFEBUOY', {
    id: 'LIFEBUOY', tier: 'GREEN', icon: '🛟',
    name: 'Phao Cứu Sinh',
    description: 'Miễn nhiễm 1 lần bị tấn công hoặc phạt lùi. Phao vỡ sau 1 lần kích hoạt!',
    resolve: (ctx) => ({
      type: 'BUFF',
      targetPlayerIds: [ctx.activePlayer.id],
      buff: { id: 'LIFEBUOY', turnsRemaining: ctx.deckConfig.lifebuoyTurns, sourcePlayerId: ctx.activePlayer.id },
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
    id: 'PARASITE', tier: 'GREEN', icon: '🐔',
    name: 'Ăn Trực (Khô Gà)',
    description: 'Lượt sau, người kế tiếp bị chia đôi số bước, phần đó cộng cho bạn.',
    resolve: (ctx) => ({
      type: 'BUFF',
      targetPlayerIds: [ctx.activePlayer.id],
      buff: { id: 'PARASITE', turnsRemaining: 1, sourcePlayerId: ctx.activePlayer.id },
    }),
  }],

  ['MIND_BLANK', {
    id: 'MIND_BLANK', tier: 'RED', icon: '📱',
    name: 'Cám Dỗ',
    description: 'Tất cả là do cái điện thoại 😡! Lùi xuống ngẫu nhiên!',
    resolve: (ctx) => {
      const [min, max] = ctx.deckConfig.mindBlankRange;
      const steps = Math.floor(Math.random() * (max - min + 1)) + min;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps: -steps };
    },
  }],

  ['DEADLINE_BOMB', {
    id: 'DEADLINE_BOMB', tier: 'RED', icon: '💣',
    name: 'Bom Deadline',
    description: 'Kéo đứa đầu bảng chết chung! Cả hai lùi về cùng điểm thấp hơn!',
    resolve: (ctx) => {
      const aheadPlayers = ctx.allPlayers.filter(p => p.id !== ctx.activePlayer.id && p.position > ctx.activePlayer.position);
      
      const newPosMatchSteps = Math.max(0, ctx.activePlayer.position - Math.abs(ctx.diceValue));

      if (aheadPlayers.length === 0) {
        if (ctx.deckConfig.deadlineBombMode === 'RESET_ZERO') {
           return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id], newPosition: 0 };
        }
        return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id], newPosition: newPosMatchSteps };
      }
      
      const targetIds = aheadPlayers.map(p => p.id);
      
      if (ctx.deckConfig.deadlineBombMode === 'RESET_ZERO') {
        return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id, ...targetIds], newPosition: 0 };
      }
      
      return { type: 'TELEPORT', targetPlayerIds: [ctx.activePlayer.id, ...targetIds], newPosition: newPosMatchSteps };
    },
  }],

  ['BLACKOUT', {
    id: 'BLACKOUT', tier: 'RED', icon: '🔌',
    name: 'Cúp Điện (Blackout)',
    description: 'Bạn an toàn! Tất cả những đứa khác bị lùi 3 bước!',
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
    description: 'Bàn tay tàn nhẫn của giám thị, kéo người chơi về đúng vị trí!',
    resolve: (ctx) => {
      if (ctx.deckConfig.supervisorHandMode === 'PULL_TOP_TO_ME') {
        let top = ctx.allPlayers[0];
        for (const p of ctx.allPlayers) if (p.position > top.position) top = p;
        return { type: 'TELEPORT', targetPlayerIds: [top.id], newPosition: ctx.activePlayer.position };
      } else {
        let last = ctx.allPlayers[0];
        for (const p of ctx.allPlayers) if (p.position < last.position) last = p;
        return { type: 'TELEPORT', targetPlayerIds: ctx.allPlayers.map(p => p.id), newPosition: last.position };
      }
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
    id: 'AMENOTEJIKARA', tier: 'PURPLE', icon: '🌀',
    name: 'Isekai',
    description: 'Bị hút vào cổng không gian! Tráo đổi hoàn toàn vị trí với một người chơi random!',
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
    name: 'Ôn Tủ',
    description: 'Hộp bí ẩn. Hên xui lùi hoặc tiến!',
    resolve: (ctx) => {
      const [min, max] = ctx.deckConfig.mysteryRange;
      const steps = Math.floor(Math.random() * (max - min + 1)) + min;
      return { type: 'MOVE', targetPlayerIds: [ctx.activePlayer.id], steps };
    },
  }]
]);
