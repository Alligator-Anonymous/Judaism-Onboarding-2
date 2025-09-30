import rawVerses from "./genesis-1.json";
import type { Verse } from "@/types";

export const genesisOne = (rawVerses as Verse[]).map((verse) => ({
  ...verse,
  audio: verse.audio
    ? {
        ...verse.audio,
        url: new URL(verse.audio.url, import.meta.url).href
      }
    : undefined
}));
