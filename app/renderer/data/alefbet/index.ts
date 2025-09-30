import letters from "./letters.json";
import words from "./words.json";

export interface LetterCard {
  letter: string;
  name: string;
  sound: string;
  finalForm: string | null;
  confusions: string[];
  svg: string;
}

export interface CommonWord {
  hebrew: string;
  translation: string;
}

export const letterCards = (letters as LetterCard[]).map((letter) => ({
  ...letter,
  svg: new URL(letter.svg, import.meta.url).href
}));
export const commonWords = words as CommonWord[];
