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
    { kana: "ア", romaji: "a", example: "アメリカ", exMeaning: "America" },
    { kana: "イ", romaji: "i", example: "イギリス", exMeaning: "England" },
    { kana: "ウ", romaji: "u", example: "ウイスキー", exMeaning: "whisky" },
    { kana: "エ", romaji: "e", example: "エレベーター", exMeaning: "elevator" },
    { kana: "オ", romaji: "o", example: "オレンジ", exMeaning: "orange" },
  ]},
  { consonant: "k", color: "#3b82f6", cells: [
    { kana: "カ", romaji: "ka", example: "カメラ", exMeaning: "camera" },
    { kana: "キ", romaji: "ki", example: "キロ", exMeaning: "kilo" },
    { kana: "ク", romaji: "ku", example: "クラス", exMeaning: "class" },
    { kana: "ケ", romaji: "ke", example: "ケーキ", exMeaning: "cake" },
    { kana: "コ", romaji: "ko", example: "コーヒー", exMeaning: "coffee" },
  ]},
  { consonant: "s", color: "#8b5cf6", cells: [
    { kana: "サ", romaji: "sa", example: "サラダ", exMeaning: "salad" },
    { kana: "シ", romaji: "shi", example: "シャツ", exMeaning: "shirt" },
    { kana: "ス", romaji: "su", example: "スポーツ", exMeaning: "sports" },
    { kana: "セ", romaji: "se", example: "セーター", exMeaning: "sweater" },
    { kana: "ソ", romaji: "so", example: "ソファ", exMeaning: "sofa" },
  ]},
  { consonant: "t", color: "#10b981", cells: [
    { kana: "タ", romaji: "ta", example: "タクシー", exMeaning: "taxi" },
    { kana: "チ", romaji: "chi", example: "チーム", exMeaning: "team" },
    { kana: "ツ", romaji: "tsu", example: "ツアー", exMeaning: "tour" },
    { kana: "テ", romaji: "te", example: "テレビ", exMeaning: "TV" },
    { kana: "ト", romaji: "to", example: "トイレ", exMeaning: "toilet" },
  ]},
  { consonant: "n", color: "#f97316", cells: [
    { kana: "ナ", romaji: "na", example: "ナイフ", exMeaning: "knife" },
    { kana: "ニ", romaji: "ni", example: "ニュース", exMeaning: "news" },
    { kana: "ヌ", romaji: "nu", example: "ヌードル", exMeaning: "noodle" },
    { kana: "ネ", romaji: "ne", example: "ネクタイ", exMeaning: "necktie" },
    { kana: "ノ", romaji: "no", example: "ノート", exMeaning: "notebook" },
  ]},
  { consonant: "h", color: "#ec4899", cells: [
    { kana: "ハ", romaji: "ha", example: "ハンバーガー", exMeaning: "hamburger" },
    { kana: "ヒ", romaji: "hi", example: "ヒーター", exMeaning: "heater" },
    { kana: "フ", romaji: "fu", example: "フランス", exMeaning: "France" },
    { kana: "ヘ", romaji: "he", example: "ヘルメット", exMeaning: "helmet" },
    { kana: "ホ", romaji: "ho", example: "ホテル", exMeaning: "hotel" },
  ]},
  { consonant: "m", color: "#14b8a6", cells: [
    { kana: "マ", romaji: "ma", example: "マンション", exMeaning: "apartment" },
    { kana: "ミ", romaji: "mi", example: "ミルク", exMeaning: "milk" },
    { kana: "ム", romaji: "mu", example: "ムード", exMeaning: "mood" },
    { kana: "メ", romaji: "me", example: "メニュー", exMeaning: "menu" },
    { kana: "モ", romaji: "mo", example: "モデル", exMeaning: "model" },
  ]},
  { consonant: "y", color: "#a78bfa", cells: [
    { kana: "ヤ", romaji: "ya", example: "ヤード", exMeaning: "yard" },
    null,
    { kana: "ユ", romaji: "yu", example: "ユニフォーム", exMeaning: "uniform" },
    null,
    { kana: "ヨ", romaji: "yo", example: "ヨーロッパ", exMeaning: "Europe" },
  ]},
  { consonant: "r", color: "#fb7185", cells: [
    { kana: "ラ", romaji: "ra", example: "ラジオ", exMeaning: "radio" },
    { kana: "リ", romaji: "ri", example: "リモコン", exMeaning: "remote" },
    { kana: "ル", romaji: "ru", example: "ルーム", exMeaning: "room" },
    { kana: "レ", romaji: "re", example: "レストラン", exMeaning: "restaurant" },
    { kana: "ロ", romaji: "ro", example: "ロボット", exMeaning: "robot" },
  ]},
  { consonant: "w", color: "#fbbf24", cells: [
    { kana: "ワ", romaji: "wa", example: "ワイン", exMeaning: "wine" },
    null, null, null,
    { kana: "ヲ", romaji: "wo", example: "ヲ (particle)", exMeaning: "object marker" },
  ]},
  { consonant: "n", color: "#94a3b8", cells: [
    { kana: "ン", romaji: "n", example: "パン", exMeaning: "bread" },
    null, null, null, null,
  ]},
];

const VOICED: { consonant: string; color: string; cells: Cell[] }[] = [
  { consonant: "g", color: "#3b82f6", cells: [
    { kana: "ガ", romaji: "ga", example: "ガス", exMeaning: "gas" },
    { kana: "ギ", romaji: "gi", example: "ギター", exMeaning: "guitar" },
    { kana: "グ", romaji: "gu", example: "グループ", exMeaning: "group" },
    { kana: "ゲ", romaji: "ge", example: "ゲーム", exMeaning: "game" },
    { kana: "ゴ", romaji: "go", example: "ゴール", exMeaning: "goal" },
  ]},
  { consonant: "z", color: "#8b5cf6", cells: [
    { kana: "ザ", romaji: "za", example: "ザイル", exMeaning: "rope (climbing)" },
    { kana: "ジ", romaji: "ji", example: "ジュース", exMeaning: "juice" },
    { kana: "ズ", romaji: "zu", example: "ズボン", exMeaning: "trousers" },
    { kana: "ゼ", romaji: "ze", example: "ゼロ", exMeaning: "zero" },
    { kana: "ゾ", romaji: "zo", example: "ゾーン", exMeaning: "zone" },
  ]},
  { consonant: "d", color: "#10b981", cells: [
    { kana: "ダ", romaji: "da", example: "ダイヤ", exMeaning: "diamond" },
    { kana: "ヂ", romaji: "ji", example: "ヂ (rare)", exMeaning: "rare variant" },
    { kana: "ヅ", romaji: "zu", example: "ヅ (rare)", exMeaning: "rare variant" },
    { kana: "デ", romaji: "de", example: "デート", exMeaning: "date" },
    { kana: "ド", romaji: "do", example: "ドア", exMeaning: "door" },
  ]},
  { consonant: "b", color: "#f97316", cells: [
    { kana: "バ", romaji: "ba", example: "バス", exMeaning: "bus" },
    { kana: "ビ", romaji: "bi", example: "ビール", exMeaning: "beer" },
    { kana: "ブ", romaji: "bu", example: "ブラウス", exMeaning: "blouse" },
    { kana: "ベ", romaji: "be", example: "ベッド", exMeaning: "bed" },
    { kana: "ボ", romaji: "bo", example: "ボール", exMeaning: "ball" },
  ]},
  { consonant: "p", color: "#ec4899", cells: [
    { kana: "パ", romaji: "pa", example: "パーティー", exMeaning: "party" },
    { kana: "ピ", romaji: "pi", example: "ピアノ", exMeaning: "piano" },
    { kana: "プ", romaji: "pu", example: "プール", exMeaning: "pool" },
    { kana: "ペ", romaji: "pe", example: "ペン", exMeaning: "pen" },
    { kana: "ポ", romaji: "po", example: "ポスト", exMeaning: "mailbox" },
  ]},
];

const COMBOS: { consonant: string; color: string; cells: Cell[] }[] = [
  { consonant: "ky", color: "#3b82f6", cells: [{ kana: "キャ", romaji: "kya", example: "キャンプ", exMeaning: "camping" }, null, { kana: "キュ", romaji: "kyu", example: "キュート", exMeaning: "cute" }, null, { kana: "キョ", romaji: "kyo", example: "キョーレツ", exMeaning: "intense" }] },
  { consonant: "sh", color: "#8b5cf6", cells: [{ kana: "シャ", romaji: "sha", example: "シャワー", exMeaning: "shower" }, null, { kana: "シュ", romaji: "shu", example: "シュークリーム", exMeaning: "cream puff" }, null, { kana: "ショ", romaji: "sho", example: "ショッピング", exMeaning: "shopping" }] },
  { consonant: "ch", color: "#10b981", cells: [{ kana: "チャ", romaji: "cha", example: "チャンス", exMeaning: "chance" }, null, { kana: "チュ", romaji: "chu", example: "チューリップ", exMeaning: "tulip" }, null, { kana: "チョ", romaji: "cho", example: "チョコレート", exMeaning: "chocolate" }] },
  { consonant: "ny", color: "#f97316", cells: [{ kana: "ニャ", romaji: "nya", example: "ニャー", exMeaning: "meow" }, null, { kana: "ニュ", romaji: "nyu", example: "ニュース", exMeaning: "news" }, null, { kana: "ニョ", romaji: "nyo", example: "ニョロ", exMeaning: "wriggling" }] },
  { consonant: "hy", color: "#ec4899", cells: [{ kana: "ヒャ", romaji: "hya", example: "ヒャク", exMeaning: "hundred" }, null, { kana: "ヒュ", romaji: "hyu", example: "ヒューズ", exMeaning: "fuse" }, null, { kana: "ヒョ", romaji: "hyo", example: "ヒョウ", exMeaning: "leopard" }] },
  { consonant: "my", color: "#14b8a6", cells: [{ kana: "ミャ", romaji: "mya", example: "ミャンマー", exMeaning: "Myanmar" }, null, { kana: "ミュ", romaji: "myu", example: "ミュージック", exMeaning: "music" }, null, { kana: "ミョ", romaji: "myo", example: "ミョウガ", exMeaning: "ginger" }] },
  { consonant: "ry", color: "#fb7185", cells: [{ kana: "リャ", romaji: "rya", example: "リャクゴ", exMeaning: "abbreviation" }, null, { kana: "リュ", romaji: "ryu", example: "リュック", exMeaning: "backpack" }, null, { kana: "リョ", romaji: "ryo", example: "リョコウ", exMeaning: "travel" }] },
  { consonant: "gy", color: "#3b82f6", cells: [{ kana: "ギャ", romaji: "gya", example: "ギャップ", exMeaning: "gap" }, null, { kana: "ギュ", romaji: "gyu", example: "ギュッと", exMeaning: "tightly" }, null, { kana: "ギョ", romaji: "gyo", example: "ギョーザ", exMeaning: "dumplings" }] },
  { consonant: "j", color: "#8b5cf6", cells: [{ kana: "ジャ", romaji: "ja", example: "ジャズ", exMeaning: "jazz" }, null, { kana: "ジュ", romaji: "ju", example: "ジュース", exMeaning: "juice" }, null, { kana: "ジョ", romaji: "jo", example: "ジョギング", exMeaning: "jogging" }] },
  { consonant: "by", color: "#f97316", cells: [{ kana: "ビャ", romaji: "bya", example: "ビャクヤ", exMeaning: "white night" }, null, { kana: "ビュ", romaji: "byu", example: "ビュッフェ", exMeaning: "buffet" }, null, { kana: "ビョ", romaji: "byo", example: "ビョウイン", exMeaning: "hospital" }] },
  { consonant: "py", color: "#ec4899", cells: [{ kana: "ピャ", romaji: "pya", example: "ピャノ", exMeaning: "piano (alt)" }, null, { kana: "ピュ", romaji: "pyu", example: "ピューマ", exMeaning: "puma" }, null, { kana: "ピョ", romaji: "pyo", example: "ピョン", exMeaning: "hop" }] },
];

const TABS = [
  { key: "basic", label: "Basic (46)", data: BASIC },
  { key: "voiced", label: "Voiced/P (25)", data: VOICED },
  { key: "combos", label: "Combos (33)", data: COMBOS },
] as const;

type TabKey = "basic" | "voiced" | "combos";
const COLUMNS = ["a", "i", "u", "e", "o"];

export function KatakanaChart() {
  const [tab, setTab] = useState<TabKey>("basic");
  const [selected, setSelected] = useState<Kana | null>(null);
  const current = TABS.find((t) => t.key === tab)!;

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Katakana Chart</h3>
        <div className="ml-auto flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSelected(null); }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors border ${
                tab === t.key
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-400"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid mb-1" style={{ gridTemplateColumns: "2.5rem repeat(5, 1fr)" }}>
          <div />
          {COLUMNS.map((c) => (
            <div key={c} className="text-center text-[10px] text-muted-foreground font-mono pb-1">{c}</div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {current.data.map((row, ri) => (
            <div key={ri} className="grid items-center" style={{ gridTemplateColumns: "2.5rem repeat(5, 1fr)" }}>
              <div className="text-[10px] font-mono text-center pr-1" style={{ color: row.color }}>
                {row.consonant}
              </div>
              {row.cells.map((cell, ci) =>
                cell ? (
                  <button
                    key={ci}
                    onClick={() => setSelected(selected?.kana === cell.kana ? null : cell)}
                    className={`rounded-lg py-2 mx-0.5 flex flex-col items-center transition-all border ${
                      selected?.kana === cell.kana
                        ? "border-violet-500/60 bg-violet-500/15"
                        : "border-border/40 hover:border-border hover:bg-white/5"
                    }`}
                  >
                    <span className="text-xl leading-none" style={{ color: selected?.kana === cell.kana ? "#a78bfa" : "inherit" }}>{cell.kana}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 font-mono">{cell.romaji}</span>
                  </button>
                ) : (
                  <div key={ci} className="mx-0.5" />
                )
              )}
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-4 rounded-lg border border-violet-500/30 bg-violet-500/8 p-4 flex items-center gap-6">
            <div className="text-6xl leading-none text-violet-400 font-bold shrink-0">{selected.kana}</div>
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
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Katakana is used mainly for foreign loanwords — click any character to see details
          </p>
        )}
      </div>
    </div>
  );
}
