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
  };
}

export type LocaleKey = 'vi' | 'en';
