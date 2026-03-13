"use client";
import { useState } from "react";

interface Kana {
  kana: string;
  romaji: string;
  example: string;
  exMeaning: string;
}
type Cell = Kana | null;

const BASIC: { consonant: string; color: string; cells: Cell[] }[] = [
  { consonant: "∅", color: "#f59e0b", cells: [
    { kana: "あ", romaji: "a", example: "あめ", exMeaning: "rain" },
    { kana: "い", romaji: "i", example: "いぬ", exMeaning: "dog" },
    { kana: "う", romaji: "u", example: "うみ", exMeaning: "sea" },
    { kana: "え", romaji: "e", example: "えき", exMeaning: "station" },
    { kana: "お", romaji: "o", example: "おかね", exMeaning: "money" },
  ]},
  { consonant: "k", color: "#3b82f6", cells: [
    { kana: "か", romaji: "ka", example: "かさ", exMeaning: "umbrella" },
    { kana: "き", romaji: "ki", example: "きって", exMeaning: "stamp" },
    { kana: "く", romaji: "ku", example: "くるま", exMeaning: "car" },
    { kana: "け", romaji: "ke", example: "けむり", exMeaning: "smoke" },
    { kana: "こ", romaji: "ko", example: "こども", exMeaning: "child" },
  ]},
  { consonant: "s", color: "#8b5cf6", cells: [
    { kana: "さ", romaji: "sa", example: "さかな", exMeaning: "fish" },
    { kana: "し", romaji: "shi", example: "しろ", exMeaning: "white/castle" },
    { kana: "す", romaji: "su", example: "すし", exMeaning: "sushi" },
    { kana: "せ", romaji: "se", example: "せんせい", exMeaning: "teacher" },
    { kana: "そ", romaji: "so", example: "そら", exMeaning: "sky" },
  ]},
  { consonant: "t", color: "#10b981", cells: [
    { kana: "た", romaji: "ta", example: "たべる", exMeaning: "to eat" },
    { kana: "ち", romaji: "chi", example: "ちず", exMeaning: "map" },
    { kana: "つ", romaji: "tsu", example: "つき", exMeaning: "moon" },
    { kana: "て", romaji: "te", example: "てがみ", exMeaning: "letter" },
    { kana: "と", romaji: "to", example: "とり", exMeaning: "bird" },
  ]},
  { consonant: "n", color: "#f97316", cells: [
    { kana: "な", romaji: "na", example: "なまえ", exMeaning: "name" },
    { kana: "に", romaji: "ni", example: "にく", exMeaning: "meat" },
    { kana: "ぬ", romaji: "nu", example: "ぬの", exMeaning: "cloth" },
    { kana: "ね", romaji: "ne", example: "ねこ", exMeaning: "cat" },
    { kana: "の", romaji: "no", example: "のみもの", exMeaning: "drink" },
  ]},
  { consonant: "h", color: "#ec4899", cells: [
    { kana: "は", romaji: "ha", example: "はな", exMeaning: "flower" },
    { kana: "ひ", romaji: "hi", example: "ひと", exMeaning: "person" },
    { kana: "ふ", romaji: "fu", example: "ふゆ", exMeaning: "winter" },
    { kana: "へ", romaji: "he", example: "へや", exMeaning: "room" },
    { kana: "ほ", romaji: "ho", example: "ほん", exMeaning: "book" },
  ]},
  { consonant: "m", color: "#14b8a6", cells: [
    { kana: "ま", romaji: "ma", example: "まち", exMeaning: "town" },
    { kana: "み", romaji: "mi", example: "みず", exMeaning: "water" },
    { kana: "む", romaji: "mu", example: "むし", exMeaning: "insect" },
    { kana: "め", romaji: "me", example: "めがね", exMeaning: "glasses" },
    { kana: "も", romaji: "mo", example: "もり", exMeaning: "forest" },
  ]},
  { consonant: "y", color: "#a78bfa", cells: [
    { kana: "や", romaji: "ya", example: "やま", exMeaning: "mountain" },
    null,
    { kana: "ゆ", romaji: "yu", example: "ゆき", exMeaning: "snow" },
    null,
    { kana: "よ", romaji: "yo", example: "よる", exMeaning: "night" },
  ]},
  { consonant: "r", color: "#fb7185", cells: [
    { kana: "ら", romaji: "ra", example: "らいねん", exMeaning: "next year" },
    { kana: "り", romaji: "ri", example: "りんご", exMeaning: "apple" },
    { kana: "る", romaji: "ru", example: "るす", exMeaning: "absence" },
    { kana: "れ", romaji: "re", example: "れんしゅう", exMeaning: "practice" },
    { kana: "ろ", romaji: "ro", example: "ろうか", exMeaning: "corridor" },
  ]},
  { consonant: "w", color: "#fbbf24", cells: [
    { kana: "わ", romaji: "wa", example: "わたし", exMeaning: "I/me" },
    null, null, null,
    { kana: "を", romaji: "wo", example: "を (particle)", exMeaning: "object marker" },
  ]},
  { consonant: "n", color: "#94a3b8", cells: [
    { kana: "ん", romaji: "n", example: "ほん", exMeaning: "book" },
    null, null, null, null,
  ]},
];

const VOICED: { consonant: string; color: string; cells: Cell[] }[] = [
  { consonant: "g", color: "#3b82f6", cells: [
    { kana: "が", romaji: "ga", example: "がっこう", exMeaning: "school" },
    { kana: "ぎ", romaji: "gi", example: "ぎんこう", exMeaning: "bank" },
    { kana: "ぐ", romaji: "gu", example: "ぐうぜん", exMeaning: "by chance" },
    { kana: "げ", romaji: "ge", example: "げんき", exMeaning: "healthy" },
    { kana: "ご", romaji: "go", example: "ごはん", exMeaning: "rice/meal" },
  ]},
  { consonant: "z", color: "#8b5cf6", cells: [
    { kana: "ざ", romaji: "za", example: "ざっし", exMeaning: "magazine" },
    { kana: "じ", romaji: "ji", example: "じかん", exMeaning: "time" },
    { kana: "ず", romaji: "zu", example: "ずっと", exMeaning: "always" },
    { kana: "ぜ", romaji: "ze", example: "ぜんぶ", exMeaning: "everything" },
    { kana: "ぞ", romaji: "zo", example: "ぞう", exMeaning: "elephant" },
  ]},
  { consonant: "d", color: "#10b981", cells: [
    { kana: "だ", romaji: "da", example: "だいがく", exMeaning: "university" },
    { kana: "ぢ", romaji: "ji", example: "はなぢ", exMeaning: "nosebleed" },
    { kana: "づ", romaji: "zu", example: "つづく", exMeaning: "to continue" },
    { kana: "で", romaji: "de", example: "でんしゃ", exMeaning: "train" },
    { kana: "ど", romaji: "do", example: "どこ", exMeaning: "where" },
  ]},
  { consonant: "b", color: "#f97316", cells: [
    { kana: "ば", romaji: "ba", example: "ばす", exMeaning: "bus" },
    { kana: "び", romaji: "bi", example: "びょういん", exMeaning: "hospital" },
    { kana: "ぶ", romaji: "bu", example: "ぶた", exMeaning: "pig" },
    { kana: "べ", romaji: "be", example: "べんきょう", exMeaning: "study" },
    { kana: "ぼ", romaji: "bo", example: "ぼうし", exMeaning: "hat" },
  ]},
  { consonant: "p", color: "#ec4899", cells: [
    { kana: "ぱ", romaji: "pa", example: "ぱーてぃー", exMeaning: "party" },
    { kana: "ぴ", romaji: "pi", example: "ぴかぴか", exMeaning: "sparkling" },
    { kana: "ぷ", romaji: "pu", example: "ぷーる", exMeaning: "pool" },
    { kana: "ぺ", romaji: "pe", example: "ぺん", exMeaning: "pen" },
    { kana: "ぽ", romaji: "po", example: "ぽすと", exMeaning: "mailbox" },
  ]},
];

const COMBOS: { consonant: string; color: string; cells: Cell[] }[] = [
  { consonant: "ky", color: "#3b82f6", cells: [{ kana: "きゃ", romaji: "kya", example: "きゃく", exMeaning: "guest" }, null, { kana: "きゅ", romaji: "kyu", example: "きゅうり", exMeaning: "cucumber" }, null, { kana: "きょ", romaji: "kyo", example: "きょう", exMeaning: "today" }] },
  { consonant: "sh", color: "#8b5cf6", cells: [{ kana: "しゃ", romaji: "sha", example: "しゃしん", exMeaning: "photo" }, null, { kana: "しゅ", romaji: "shu", example: "しゅじん", exMeaning: "husband" }, null, { kana: "しょ", romaji: "sho", example: "しょくじ", exMeaning: "meal" }] },
  { consonant: "ch", color: "#10b981", cells: [{ kana: "ちゃ", romaji: "cha", example: "おちゃ", exMeaning: "green tea" }, null, { kana: "ちゅ", romaji: "chu", example: "ちゅうごく", exMeaning: "China" }, null, { kana: "ちょ", romaji: "cho", example: "ちょっと", exMeaning: "a little" }] },
  { consonant: "ny", color: "#f97316", cells: [{ kana: "にゃ", romaji: "nya", example: "にゃー", exMeaning: "meow" }, null, { kana: "にゅ", romaji: "nyu", example: "にゅうがく", exMeaning: "enrollment" }, null, { kana: "にょ", romaji: "nyo", example: "にょろ", exMeaning: "wriggling" }] },
  { consonant: "hy", color: "#ec4899", cells: [{ kana: "ひゃ", romaji: "hya", example: "ひゃく", exMeaning: "100" }, null, { kana: "ひゅ", romaji: "hyu", example: "ひゅー", exMeaning: "swoosh" }, null, { kana: "ひょ", romaji: "hyo", example: "ひょう", exMeaning: "hail" }] },
  { consonant: "my", color: "#14b8a6", cells: [{ kana: "みゃ", romaji: "mya", example: "みゃくはく", exMeaning: "pulse" }, null, { kana: "みゅ", romaji: "myu", example: "みゅーじっく", exMeaning: "music" }, null, { kana: "みょ", romaji: "myo", example: "みょうが", exMeaning: "ginger" }] },
  { consonant: "ry", color: "#fb7185", cells: [{ kana: "りゃ", romaji: "rya", example: "りゃくご", exMeaning: "abbreviation" }, null, { kana: "りゅ", romaji: "ryu", example: "りゅうがく", exMeaning: "study abroad" }, null, { kana: "りょ", romaji: "ryo", example: "りょこう", exMeaning: "travel" }] },
  { consonant: "gy", color: "#3b82f6", cells: [{ kana: "ぎゃ", romaji: "gya", example: "ぎゃく", exMeaning: "reverse" }, null, { kana: "ぎゅ", romaji: "gyu", example: "ぎゅうにく", exMeaning: "beef" }, null, { kana: "ぎょ", romaji: "gyo", example: "ぎょうざ", exMeaning: "dumplings" }] },
  { consonant: "j", color: "#8b5cf6", cells: [{ kana: "じゃ", romaji: "ja", example: "じゃあ", exMeaning: "well then" }, null, { kana: "じゅ", romaji: "ju", example: "じゅうしょ", exMeaning: "address" }, null, { kana: "じょ", romaji: "jo", example: "じょうず", exMeaning: "skilled" }] },
  { consonant: "by", color: "#f97316", cells: [{ kana: "びゃ", romaji: "bya", example: "びゃくや", exMeaning: "white night" }, null, { kana: "びゅ", romaji: "byu", example: "びゅー", exMeaning: "whoosh" }, null, { kana: "びょ", romaji: "byo", example: "びょうき", exMeaning: "illness" }] },
  { consonant: "py", color: "#ec4899", cells: [{ kana: "ぴゃ", romaji: "pya", example: "ぴゃーっと", exMeaning: "quickly" }, null, { kana: "ぴゅ", romaji: "pyu", example: "ぴゅー", exMeaning: "whirring" }, null, { kana: "ぴょ", romaji: "pyo", example: "ぴょんぴょん", exMeaning: "hopping" }] },
];

const TABS = [
  { key: "basic", label: "Basic (46)", data: BASIC },
  { key: "voiced", label: "Voiced/P (25)", data: VOICED },
  { key: "combos", label: "Combos (33)", data: COMBOS },
] as const;

type TabKey = "basic" | "voiced" | "combos";

const COLUMNS = ["a", "i", "u", "e", "o"];

export function HiraganaChart() {
  const [tab, setTab] = useState<TabKey>("basic");
  const [selected, setSelected] = useState<Kana | null>(null);

  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Hiragana Chart</h3>
        <div className="ml-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelected(null); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                tab === t.key
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Column headers */}
        <div className="grid mb-1" style={{ gridTemplateColumns: "2.5rem repeat(5, 1fr)" }}>
          <div />
          {COLUMNS.map((c) => (
            <div key={c} className="text-center text-[10px] text-muted-foreground font-mono pb-1">{c}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-1">
          {current.data.map((row, ri) => (
            <div key={ri} className="grid items-center" style={{ gridTemplateColumns: "2.5rem repeat(5, 1fr)" }}>
              <div
                className="text-[10px] font-mono text-center pr-1"
                style={{ color: row.color }}
              >
                {row.consonant}
              </div>
              {row.cells.map((cell, ci) =>
                cell ? (
                  <button
                    key={ci}
                    onClick={() => setSelected(selected?.kana === cell.kana ? null : cell)}
                    className={`rounded-lg py-2 mx-0.5 flex flex-col items-center transition-all border text-center ${
                      selected?.kana === cell.kana
                        ? "border-blue-500/60 bg-blue-500/15"
                        : "border-border/40 hover:border-border hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xl leading-none" style={{ color: selected?.kana === cell.kana ? "#60a5fa" : "inherit" }}>{cell.kana}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 font-mono">{cell.romaji}</span>
                  </button>
                ) : (
                  <div key={ci} className="mx-0.5" />
                )
              )}
            </div>
          ))}
        </div>

        {/* Selected character detail panel */}
        {selected && (
          <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/8 p-4 flex items-center gap-6">
            <div className="text-6xl leading-none text-blue-400 font-bold shrink-0">{selected.kana}</div>
            <div className="flex flex-col gap-1">
              <div className="text-lg font-bold text-foreground font-mono">{selected.romaji}</div>
              <div className="text-sm text-muted-foreground">
                Example: <span className="text-foreground font-medium">{selected.example}</span>
                {" "}— {selected.exMeaning}
              </div>
            </div>
          </div>
        )}
        {!selected && (
          <p className="mt-3 text-[11px] text-muted-foreground text-center">Click any character to see details</p>
        )}
      </div>
    </div>
  );
}
