import LZString from 'lz-string';
import type { Tile } from '../core/MapBuilderState';

const URL_PARAM = 'map';

export const MapShareService = {
  encode(mapData: any): string {
    return LZString.compressToEncodedURIComponent(JSON.stringify(mapData));
  },

  decode(encoded: string): any | null {
    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return null;
      return JSON.parse(json);
    } catch {
      return null;
    }
  },

  copyShareURL(mapData: any): void {
    const encoded = MapShareService.encode(mapData);
    const url = `${window.location.origin}${window.location.pathname}?${URL_PARAM}=${encoded}`;
    navigator.clipboard.writeText(url).catch(() => {
      prompt('Copy link này:', url);
    });
  },

  readFromURL(): any | null {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_PARAM);
    if (!encoded) return null;
    return MapShareService.decode(encoded);
  },

  clearURLParam(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete(URL_PARAM);
    window.history.replaceState({}, '', url.toString());
  },
};
