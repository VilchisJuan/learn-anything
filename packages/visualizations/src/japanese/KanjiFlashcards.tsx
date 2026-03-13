"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KanjiCard {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
  example: string;
  exReading: string;
  exMeaning: string;
  strokes: number;
  category: string;
}

const KANJI: KanjiCard[] = [
  // Numbers
  { kanji: "一", onyomi: "いち", kunyomi: "ひと(つ)", meaning: "one", example: "一つ", exReading: "ひとつ", exMeaning: "one thing", strokes: 1, category: "Numbers" },
  { kanji: "二", onyomi: "に", kunyomi: "ふた(つ)", meaning: "two", example: "二人", exReading: "ふたり", exMeaning: "two people", strokes: 2, category: "Numbers" },
  { kanji: "三", onyomi: "さん", kunyomi: "み(つ)", meaning: "three", example: "三月", exReading: "さんがつ", exMeaning: "March", strokes: 3, category: "Numbers" },
  { kanji: "四", onyomi: "し", kunyomi: "よ(つ)", meaning: "four", example: "四時", exReading: "よじ", exMeaning: "4 o'clock", strokes: 5, category: "Numbers" },
  { kanji: "五", onyomi: "ご", kunyomi: "いつ(つ)", meaning: "five", example: "五月", exReading: "ごがつ", exMeaning: "May", strokes: 4, category: "Numbers" },
  { kanji: "六", onyomi: "ろく", kunyomi: "む(つ)", meaning: "six", example: "六時", exReading: "ろくじ", exMeaning: "6 o'clock", strokes: 4, category: "Numbers" },
  { kanji: "七", onyomi: "しち", kunyomi: "なな(つ)", meaning: "seven", example: "七月", exReading: "しちがつ", exMeaning: "July", strokes: 2, category: "Numbers" },
  { kanji: "八", onyomi: "はち", kunyomi: "や(つ)", meaning: "eight", example: "八月", exReading: "はちがつ", exMeaning: "August", strokes: 2, category: "Numbers" },
  { kanji: "九", onyomi: "きゅう・く", kunyomi: "ここの(つ)", meaning: "nine", example: "九時", exReading: "くじ", exMeaning: "9 o'clock", strokes: 2, category: "Numbers" },
  { kanji: "十", onyomi: "じゅう", kunyomi: "とお", meaning: "ten", example: "十分", exReading: "じっぷん", exMeaning: "10 minutes", strokes: 2, category: "Numbers" },
  { kanji: "百", onyomi: "ひゃく", kunyomi: "—", meaning: "hundred", example: "百円", exReading: "ひゃくえん", exMeaning: "100 yen", strokes: 6, category: "Numbers" },
  { kanji: "千", onyomi: "せん", kunyomi: "ち", meaning: "thousand", example: "千円", exReading: "せんえん", exMeaning: "1000 yen", strokes: 3, category: "Numbers" },
  { kanji: "万", onyomi: "まん・ばん", kunyomi: "—", meaning: "ten-thousand", example: "一万円", exReading: "いちまんえん", exMeaning: "10,000 yen", strokes: 3, category: "Numbers" },
  // Time
  { kanji: "日", onyomi: "にち・じつ", kunyomi: "ひ・か", meaning: "day / sun", example: "今日", exReading: "きょう", exMeaning: "today", strokes: 4, category: "Time" },
  { kanji: "月", onyomi: "げつ・がつ", kunyomi: "つき", meaning: "month / moon", example: "今月", exReading: "こんげつ", exMeaning: "this month", strokes: 4, category: "Time" },
  { kanji: "年", onyomi: "ねん", kunyomi: "とし", meaning: "year", example: "今年", exReading: "ことし", exMeaning: "this year", strokes: 6, category: "Time" },
  { kanji: "時", onyomi: "じ", kunyomi: "とき", meaning: "time / o'clock", example: "何時", exReading: "なんじ", exMeaning: "what time", strokes: 10, category: "Time" },
  { kanji: "分", onyomi: "ふん・ぷん", kunyomi: "わ(かる)", meaning: "minute / part", example: "五分", exReading: "ごふん", exMeaning: "5 minutes", strokes: 4, category: "Time" },
  // People
  { kanji: "人", onyomi: "じん・にん", kunyomi: "ひと", meaning: "person", example: "日本人", exReading: "にほんじん", exMeaning: "Japanese person", strokes: 2, category: "People" },
  { kanji: "私", onyomi: "し", kunyomi: "わたし", meaning: "I / private", example: "私", exReading: "わたし", exMeaning: "I / me", strokes: 7, category: "People" },
  { kanji: "先", onyomi: "せん", kunyomi: "さき", meaning: "previous / ahead", example: "先生", exReading: "せんせい", exMeaning: "teacher", strokes: 6, category: "People" },
  { kanji: "生", onyomi: "せい・しょう", kunyomi: "い(きる)・う(まれる)", meaning: "life / birth / student", example: "学生", exReading: "がくせい", exMeaning: "student", strokes: 5, category: "People" },
  // Body
  { kanji: "口", onyomi: "こう・く", kunyomi: "くち", meaning: "mouth", example: "口", exReading: "くち", exMeaning: "mouth", strokes: 3, category: "Body" },
  { kanji: "手", onyomi: "しゅ", kunyomi: "て", meaning: "hand", example: "右手", exReading: "みぎて", exMeaning: "right hand", strokes: 4, category: "Body" },
  { kanji: "目", onyomi: "もく", kunyomi: "め", meaning: "eye", example: "目", exReading: "め", exMeaning: "eye", strokes: 5, category: "Body" },
  { kanji: "耳", onyomi: "じ", kunyomi: "みみ", meaning: "ear", example: "耳", exReading: "みみ", exMeaning: "ear", strokes: 6, category: "Body" },
  { kanji: "足", onyomi: "そく", kunyomi: "あし", meaning: "foot / leg", example: "足", exReading: "あし", exMeaning: "foot/leg", strokes: 7, category: "Body" },
  // Nature
  { kanji: "山", onyomi: "さん", kunyomi: "やま", meaning: "mountain", example: "富士山", exReading: "ふじさん", exMeaning: "Mt. Fuji", strokes: 3, category: "Nature" },
  { kanji: "川", onyomi: "せん", kunyomi: "かわ", meaning: "river", example: "川", exReading: "かわ", exMeaning: "river", strokes: 3, category: "Nature" },
  { kanji: "木", onyomi: "もく・ぼく", kunyomi: "き", meaning: "tree / wood", example: "木曜日", exReading: "もくようび", exMeaning: "Thursday", strokes: 4, category: "Nature" },
  { kanji: "田", onyomi: "でん", kunyomi: "た", meaning: "rice paddy / field", example: "田中", exReading: "たなか", exMeaning: "Tanaka (name)", strokes: 5, category: "Nature" },
  // Directions
  { kanji: "上", onyomi: "じょう", kunyomi: "うえ・あ(げる)", meaning: "up / above", example: "上手", exReading: "じょうず", exMeaning: "skilled", strokes: 3, category: "Directions" },
  { kanji: "下", onyomi: "か・げ", kunyomi: "した・さ(がる)", meaning: "down / below", example: "地下", exReading: "ちか", exMeaning: "underground", strokes: 3, category: "Directions" },
  { kanji: "左", onyomi: "さ", kunyomi: "ひだり", meaning: "left", example: "左", exReading: "ひだり", exMeaning: "left", strokes: 5, category: "Directions" },
  { kanji: "右", onyomi: "う・ゆう", kunyomi: "みぎ", meaning: "right", example: "右", exReading: "みぎ", exMeaning: "right", strokes: 5, category: "Directions" },
  { kanji: "中", onyomi: "ちゅう", kunyomi: "なか", meaning: "middle / inside", example: "中国", exReading: "ちゅうごく", exMeaning: "China", strokes: 4, category: "Directions" },
  { kanji: "東", onyomi: "とう", kunyomi: "ひがし", meaning: "east", example: "東京", exReading: "とうきょう", exMeaning: "Tokyo", strokes: 8, category: "Directions" },
  { kanji: "西", onyomi: "せい・さい", kunyomi: "にし", meaning: "west", example: "関西", exReading: "かんさい", exMeaning: "Kansai", strokes: 6, category: "Directions" },
  { kanji: "南", onyomi: "なん", kunyomi: "みなみ", meaning: "south", example: "南口", exReading: "みなみぐち", exMeaning: "south exit", strokes: 9, category: "Directions" },
  { kanji: "北", onyomi: "ほく", kunyomi: "きた", meaning: "north", example: "北口", exReading: "きたぐち", exMeaning: "north exit", strokes: 5, category: "Directions" },
  // Size / Quantity
  { kanji: "大", onyomi: "だい・たい", kunyomi: "おお(きい)", meaning: "big / large", example: "大学", exReading: "だいがく", exMeaning: "university", strokes: 3, category: "Size" },
  { kanji: "小", onyomi: "しょう", kunyomi: "ちい(さい)・こ", meaning: "small / little", example: "小学校", exReading: "しょうがっこう", exMeaning: "elementary school", strokes: 3, category: "Size" },
  { kanji: "半", onyomi: "はん", kunyomi: "なか(ば)", meaning: "half", example: "三時半", exReading: "さんじはん", exMeaning: "half past three", strokes: 5, category: "Size" },
  // School & Knowledge
  { kanji: "学", onyomi: "がく", kunyomi: "まな(ぶ)", meaning: "study / learn", example: "学校", exReading: "がっこう", exMeaning: "school", strokes: 8, category: "School" },
  { kanji: "校", onyomi: "こう", kunyomi: "—", meaning: "school", example: "高校", exReading: "こうこう", exMeaning: "high school", strokes: 10, category: "School" },
  { kanji: "語", onyomi: "ご", kunyomi: "かた(る)", meaning: "language / word", example: "日本語", exReading: "にほんご", exMeaning: "Japanese language", strokes: 14, category: "School" },
  { kanji: "本", onyomi: "ほん", kunyomi: "もと", meaning: "book / origin", example: "日本", exReading: "にほん", exMeaning: "Japan", strokes: 5, category: "School" },
  // Action Verbs
  { kanji: "行", onyomi: "こう", kunyomi: "い(く)・ゆ(く)", meaning: "go", example: "旅行", exReading: "りょこう", exMeaning: "travel", strokes: 6, category: "Verbs" },
  { kanji: "来", onyomi: "らい", kunyomi: "く(る)", meaning: "come", example: "来週", exReading: "らいしゅう", exMeaning: "next week", strokes: 7, category: "Verbs" },
  { kanji: "見", onyomi: "けん", kunyomi: "み(る)", meaning: "see / look", example: "見る", exReading: "みる", exMeaning: "to watch/see", strokes: 7, category: "Verbs" },
  { kanji: "聞", onyomi: "ぶん・もん", kunyomi: "き(く)・き(こえる)", meaning: "hear / listen / ask", example: "新聞", exReading: "しんぶん", exMeaning: "newspaper", strokes: 14, category: "Verbs" },
  { kanji: "読", onyomi: "どく", kunyomi: "よ(む)", meaning: "read", example: "読む", exReading: "よむ", exMeaning: "to read", strokes: 14, category: "Verbs" },
  { kanji: "書", onyomi: "しょ", kunyomi: "か(く)", meaning: "write", example: "書く", exReading: "かく", exMeaning: "to write", strokes: 10, category: "Verbs" },
  { kanji: "食", onyomi: "しょく", kunyomi: "た(べる)・く(う)", meaning: "eat / food", example: "食べる", exReading: "たべる", exMeaning: "to eat", strokes: 9, category: "Verbs" },
  { kanji: "飲", onyomi: "いん", kunyomi: "の(む)", meaning: "drink", example: "飲み物", exReading: "のみもの", exMeaning: "drink/beverage", strokes: 12, category: "Verbs" },
  // Country / Place
  { kanji: "国", onyomi: "こく", kunyomi: "くに", meaning: "country", example: "外国", exReading: "がいこく", exMeaning: "foreign country", strokes: 8, category: "Places" },
  { kanji: "電", onyomi: "でん", kunyomi: "—", meaning: "electricity", example: "電車", exReading: "でんしゃ", exMeaning: "train", strokes: 13, category: "Places" },
  { kanji: "車", onyomi: "しゃ", kunyomi: "くるま", meaning: "car / vehicle", example: "電車", exReading: "でんしゃ", exMeaning: "train", strokes: 7, category: "Places" },
  { kanji: "何", onyomi: "か", kunyomi: "なに・なん", meaning: "what", example: "何時", exReading: "なんじ", exMeaning: "what time", strokes: 7, category: "Question" },
  { kanji: "今", onyomi: "こん・きん", kunyomi: "いま", meaning: "now", example: "今日", exReading: "きょう", exMeaning: "today", strokes: 4, category: "Time" },
];

const CATEGORIES = ["All", ...Array.from(new Set(KANJI.map((k) => k.category)))];

const CATEGORY_COLORS: Record<string, string> = {
  Numbers: "#f59e0b", Time: "#3b82f6", People: "#10b981", Body: "#ec4899",
  Nature: "#22d3ee", Directions: "#a78bfa", Size: "#fb7185", School: "#fbbf24",
  Verbs: "#f97316", Places: "#14b8a6", Question: "#94a3b8",
};

export function KanjiFlashcards() {
  const [category, setCategory] = useState("All");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());

  const filtered = category === "All" ? KANJI : KANJI.filter((k) => k.category === category);
  const card = filtered[index] ?? filtered[0];

  function handleCategory(cat: string) {
    setCategory(cat);
    setIndex(0);
    setFlipped(false);
  }

  function handleNav(dir: -1 | 1) {
    setIndex((i) => (i + dir + filtered.length) % filtered.length);
    setFlipped(false);
  }

  function toggleKnown() {
    const next = new Set(known);
    if (next.has(card.kanji)) next.delete(card.kanji);
    else next.add(card.kanji);
    setKnown(next);
  }

  if (!card) return null;

  const catColor = CATEGORY_COLORS[card.category] ?? "#94a3b8";

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">N5 Kanji Flashcards</h3>
        <span className="text-xs text-muted-foreground">{index + 1}/{filtered.length}</span>
        <span className="text-xs text-emerald-400 ml-auto">{known.size} known</span>
      </div>

      {/* Category filter */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium border transition-colors ${
              category === cat ? "bg-[#222] border-border text-foreground" : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
            style={category === cat && cat !== "All" ? { color: CATEGORY_COLORS[cat] ?? "inherit" } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-5 flex flex-col items-center gap-4">
        {/* Flashcard */}
        <div
          className="w-full max-w-sm cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border-2 border-border bg-[#111] p-8 flex flex-col items-center gap-3"
              >
                <div className="text-8xl font-bold" style={{ color: catColor }}>{card.kanji}</div>
                <div className="text-xs text-muted-foreground">{card.strokes} strokes</div>
                <div
                  className="text-[10px] px-2 py-0.5 rounded border"
                  style={{ color: catColor, borderColor: catColor + "40", backgroundColor: catColor + "10" }}
                >
                  {card.category}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Tap to reveal</p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border-2 bg-[#111] p-6 flex flex-col gap-3"
                style={{ borderColor: catColor + "40" }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-5xl font-bold" style={{ color: catColor }}>{card.kanji}</div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{card.meaning}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{card.strokes} strokes · {card.category}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg bg-[#1a1a1a] border border-border p-2">
                    <div className="text-[9px] text-muted-foreground mb-1">ON reading</div>
                    <div className="text-sm font-medium text-foreground">{card.onyomi}</div>
                  </div>
                  <div className="rounded-lg bg-[#1a1a1a] border border-border p-2">
                    <div className="text-[9px] text-muted-foreground mb-1">KUN reading</div>
                    <div className="text-sm font-medium text-foreground">{card.kunyomi}</div>
                  </div>
                </div>
                <div className="rounded-lg bg-[#1a1a1a] border border-border p-3 mt-1">
                  <div className="text-[9px] text-muted-foreground mb-1">Example</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-foreground">{card.example}</span>
                    <span className="text-xs text-muted-foreground">（{card.exReading}）</span>
                    <span className="text-xs text-muted-foreground">— {card.exMeaning}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav(-1)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={toggleKnown}
            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              known.has(card.kanji)
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {known.has(card.kanji) ? "✓ Known" : "Mark Known"}
          </button>
          <button
            onClick={() => handleNav(1)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 flex-wrap justify-center max-w-xs">
          {filtered.map((k, i) => (
            <div
              key={k.kanji}
              onClick={() => { setIndex(i); setFlipped(false); }}
              className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                known.has(k.kanji) ? "bg-emerald-500" : i === index ? "bg-blue-400" : "bg-[#333]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
