import type { LocaleStrings } from './types';

export const vi: LocaleStrings = {
  welcome: {
    title: 'DraftBoard',
    subtitle: 'Chọn chế độ chơi',
    playDefault: 'Chơi Map Mặc Định',
    playSaved: 'Chơi Map Đã Lưu',
    resumeGame: 'Chơi Tiếp Ván Cũ',
    createBuilder: 'Tạo Map Mới',
  },
  home: {
    title: 'DraftBoard',
    numPlayers: 'Số người chơi',
    playerSetup: 'Cài đặt người chơi',
    startGame: 'Bắt Đầu',
    playerDefault: (n) => `Người chơi ${n}`,
  },
  board: {
    tileIn: 'IN',
    tileOut: 'OUT',
  },
  stats: {
    heading: 'Người chơi',
    cardPosition: (current, max) => `Ô ${current} / ${max}`,
    turnBadge: 'Lượt',
  },
  dice: {
    rollButton: 'Tung Xúc Xắc',
    skipButton: 'Bỏ Lượt',
    undoButton: 'Lùi Lại',
  },
  mystery: {
    title: 'Mystery Card',
    backLabel: 'MYSTERY',
    stepsLabel: (n) => n > 0 ? `+${n} BƯỚC` : `${n} BƯỚC`,
  },
  mapSettings: {
    title: 'Cài Đặt Game',
    diceCount: 'Số Xúc Xắc',
    mysteryRange: 'Biên Độ Mystery Card',
    enableKick: 'Tính Năng Đá (Kick)',
    on: 'Bật',
    off: 'Tắt',
  },
  victory: {
    title: 'CHIẾN THẮNG!',
    winMessage: (name) => `${name} đã thắng!`,
    playAgain: 'Chơi Lại',
  },
  kick: {
    message: (kicker, kicked, steps) => `${kicker} đã đá ${kicked} lùi ${steps} bước!`,
  },
  builder: {
    title: 'Xây Dựng Map',
    tools: 'Công Cụ',
    drawPath: 'Vẽ Đường',
    eraser: 'Xóa',
    mysteryCard: 'Mystery Card',
    clearMap: 'Xóa Map',
    savePlay: 'Lưu & Chơi',
    saveLocal: 'Lưu Map',
    cancel: 'Hủy',
    savedSuccess: 'Map đã được lưu thành công!',
    tooShort: 'Map quá ngắn để lưu.',
    invalidMap: 'Map quá ngắn hoặc không hợp lệ.',
  },
  settings: {
    title: 'Cài Đặt',
    language: 'Ngôn ngữ',
    sound: 'Âm thanh',
    animations: 'Hiệu ứng',
    cameraTrack: 'Camera tự động',
    diceCount: 'Số xúc xắc',
    kickDistance: 'Khoảng cách đá',
    exactLanding: 'Phải đúng ô cuối',
  },
  common: {
    confirmExit: 'Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.',
    savedMapError: 'Map đã lưu bị lỗi. Đang dùng map mặc định.',
  },
};
