export interface LocaleStrings {
  welcome: {
    title: string;
    subtitle: string;
    playDefault: string;
    playSaved: string;
    resumeGame: string;
    createBuilder: string;
  };
  home: {
    title: string;
    numPlayers: string;
    playerSetup: string;
    startGame: string;
    playerDefault: (n: number) => string;
  };
  board: {
    tileIn: string;
    tileOut: string;
  };
  stats: {
    heading: string;
    cardPosition: (current: number, max: number) => string;
    turnBadge: string;
  };
  dice: {
    rollButton: string;
    skipButton: string;
    undoButton: string;
  };
  mystery: {
    title: string;
    backLabel: string;
    stepsLabel: (n: number) => string;
  };
  mapSettings: {
    title: string;
    diceCount: string;
    mysteryRange: string;
    enableKick: string;
    on: string;
    off: string;
  };
  victory: {
    title: string;
    winMessage: (name: string) => string;
    playAgain: string;
  };
  kick: {
    message: (kicker: string, kicked: string, steps: number) => string;
  };
  builder: {
    title: string;
    tools: string;
    drawPath: string;
    eraser: string;
    mysteryCard: string;
    clearMap: string;
    savePlay: string;
    saveLocal: string;
    cancel: string;
    savedSuccess: string;
    tooShort: string;
    invalidMap: string;
  };
  settings: {
    title: string;
    language: string;
    sound: string;
    animations: string;
    cameraTrack: string;
    diceCount: string;
    kickDistance: string;
    exactLanding: string;
  };
  common: {
    confirmExit: string;
    savedMapError: string;
    sharedMapPrompt: string;
  };
  cards: {
    eureka: { name: string; desc: string };
    lifebuoy: { name: string; desc: string };
    counter: { name: string; desc: string };
    parasite: { name: string; desc: string };
    mindBlank: { name: string; desc: string };
    deadlineBomb: { name: string; desc: string };
    blackout: { name: string; desc: string };
    detention: { name: string; desc: string };
    popQuiz: { name: string; desc: string };
    supervisorHand: { name: string; desc: string };
    ninjaCopy: { name: string; desc: string };
    amenotejikara: { name: string; desc: string };
    zaWarudo: { name: string; desc: string };
    mystery: { name: string; desc: string };
  };
  deckConfig: {
    title: string;
    basic: string;
    skill: string;
    chaos: string;
    rarityBias: string;
    rarityHelp: string;
  };
  systemUI: {
    title: string;
    camera: string;
    sfx: string;
    volume: string;
    biome: string;
    biomeOptions: {
      off: string;
      forest: string;
      ice: string;
      desert: string;
      temptation: string;
      forge: string;
      summit: string;
    };
  };
  tabs: {
    board: string;
    deck: string;
    system: string;
  };
}

export type LocaleKey = 'vi' | 'en';
