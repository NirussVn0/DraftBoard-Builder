import type { GameState } from '../core/GameState';
import type { Tile } from '../core/MapBuilderState';
import type { MapSettings } from '../core/SettingsState';
import { MapShareService } from './MapShareService';

export interface SavedMapSlot {
  id: string;
  name: string;
  savedAt: number;
  path: Tile[];
  env: { id: string; x: number; y: number; emoji: string }[];
  mapSettings?: MapSettings;
}

export interface SavedGameSlot {
  id: string;
  name: string;
  savedAt: number;
  state: GameState;
  playerSummary: string; // e.g. "3 players, Turn 12"
}

const MAPS_KEY = 'draftboard_maps_v2';
const GAMES_KEY = 'draftboard_games_v2';

export const SaveManager = {
  // ── Maps ──

  getMaps(): SavedMapSlot[] {
    try {
      const raw = localStorage.getItem(MAPS_KEY);
      if (!raw) {
        // Migrate legacy single-slot
        const legacy = localStorage.getItem('draftboard_saved_map');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const slot: SavedMapSlot = {
            id: crypto.randomUUID?.() || `map-${Date.now()}`,
            name: 'Map 1',
            savedAt: Date.now(),
            path: parsed.path || parsed,
            env: parsed.env || [],
          };
          SaveManager.saveMaps([slot]);
          return [slot];
        }
        return [];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveMaps(maps: SavedMapSlot[]) {
    localStorage.setItem(MAPS_KEY, JSON.stringify(maps));
  },

  addMap(name: string, path: Tile[], env: { id: string; x: number; y: number; emoji: string }[] = [], mapSettings?: MapSettings): SavedMapSlot {
    const maps = SaveManager.getMaps();
    const slot: SavedMapSlot = {
      id: crypto.randomUUID?.() || `map-${Date.now()}`,
      name: name || `Map ${maps.length + 1}`,
      savedAt: Date.now(),
      path,
      env,
      mapSettings,
    };
    maps.push(slot);
    SaveManager.saveMaps(maps);
    return slot;
  },

  deleteMap(id: string) {
    const maps = SaveManager.getMaps().filter(m => m.id !== id);
    SaveManager.saveMaps(maps);
  },

  // ── Games ──

  getGames(): SavedGameSlot[] {
    try {
      const raw = localStorage.getItem(GAMES_KEY);
      if (!raw) {
        // Migrate legacy
        const legacy = localStorage.getItem('draftboard_saved_game');
        if (legacy) {
          const parsed = JSON.parse(legacy);
          const slot: SavedGameSlot = {
            id: crypto.randomUUID?.() || `game-${Date.now()}`,
            name: 'Ván 1',
            savedAt: Date.now(),
            state: parsed,
            playerSummary: `${parsed.players?.length || 0} người chơi`,
          };
          SaveManager.saveGames([slot]);
          return [slot];
        }
        return [];
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveGames(games: SavedGameSlot[]) {
    localStorage.setItem(GAMES_KEY, JSON.stringify(games));
  },

  addGame(name: string, state: GameState): SavedGameSlot {
    const games = SaveManager.getGames();
    const slot: SavedGameSlot = {
      id: crypto.randomUUID?.() || `game-${Date.now()}`,
      name: name || `Ván ${games.length + 1}`,
      savedAt: Date.now(),
      state,
      playerSummary: `${state.players.length} người chơi • Lượt ${state.activePlayerIndex + 1}`,
    };
    games.push(slot);
    SaveManager.saveGames(games);
    return slot;
  },

  updateGame(id: string, state: GameState) {
    const games = SaveManager.getGames();
    const idx = games.findIndex(g => g.id === id);
    if (idx !== -1) {
      games[idx] = {
        ...games[idx],
        savedAt: Date.now(),
        state,
        playerSummary: `${state.players.length} người chơi • Lượt ${state.activePlayerIndex + 1}`,
      };
      SaveManager.saveGames(games);
    }
  },

  deleteGame(id: string) {
    const games = SaveManager.getGames().filter(g => g.id !== id);
    SaveManager.saveGames(games);
  },

  // ── Export / Import ──

  exportGameAsJSON(game: SavedGameSlot): void {
    const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name.replace(/\s+/g, '_')}_${new Date(game.savedAt).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportMapAsJSON(map: SavedMapSlot): void {
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${map.name.replace(/\s+/g, '_')}_${new Date(map.savedAt).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importFromJSON(jsonStr: string): { type: 'map'; data: SavedMapSlot } | { type: 'game'; data: SavedGameSlot } | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.path) {
        return { type: 'map', data: parsed as SavedMapSlot };
      }
      if (parsed.state) {
        return { type: 'game', data: parsed as SavedGameSlot };
      }
      return null;
    } catch {
      return null;
    }
  },
};
