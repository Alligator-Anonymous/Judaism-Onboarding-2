import React, { useState } from "react";

const LETTERS = ["ב", "מ", "ש", "ת", "א"];
const VOWELS = [
  { symbol: "ַ", label: "Patach" },
  { symbol: "ָ", label: "Kamatz" },
  { symbol: "ֵ", label: "Tzeirei" },
  { symbol: "ִ", label: "Chirik" },
  { symbol: "ֹ", label: "Cholam" }
];

function composeSyllable(letter: string, vowel: string) {
  return `${letter}${vowel}`;
}

export const NiqqudBuilder: React.FC = () => {
  const [letter, setLetter] = useState(LETTERS[0]);
  const [vowel, setVowel] = useState(VOWELS[0].symbol);
  const syllable = composeSyllable(letter, vowel);

  return (
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Compose a syllable</h3>
      <p className="text-sm text-slate-600">Choose a letter and vowel—your syllable updates instantly.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold uppercase text-slate-500">Letter</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {LETTERS.map((char) => (
              <button
                key={char}
                type="button"
                className={`rounded-full border px-4 py-2 text-xl ${
                  char === letter
                    ? "border-pomegranate bg-pomegranate/10 text-pomegranate"
                    : "border-slate-300 text-slate-700"
                }`}
                onClick={() => setLetter(char)}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase text-slate-500">Vowel</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {VOWELS.map((mark) => (
              <button
                key={mark.symbol}
                type="button"
                className={`rounded-full border px-4 py-2 text-xl ${
                  mark.symbol === vowel
                    ? "border-pomegranate bg-pomegranate/10 text-pomegranate"
                    : "border-slate-300 text-slate-700"
                }`}
                onClick={() => setVowel(mark.symbol)}
              >
                {mark.symbol}
                <span className="ml-2 text-xs">{mark.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-center text-3xl font-bold text-pomegranate dark:bg-slate-900">
        {syllable}
      </div>
      <p className="text-xs text-slate-500">Try pronouncing it aloud. Celebrate small wins!</p>
    </div>
  );
};
