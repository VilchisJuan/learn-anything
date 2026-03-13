"use client";
import { useState } from "react";

interface Verb {
  dictionary: string;
  reading: string;
  meaning: string;
  type: "ru-verb" | "u-verb" | "irregular";
  politePos: string;
  politeNeg: string;
  politePast: string;
  politePastNeg: string;
  plainPos: string;
  plainNeg: string;
  plainPast: string;
  plainPastNeg: string;
  teForm: string;
  potential: string;
}

const VERBS: Verb[] = [
  {
    dictionary: "食べる", reading: "たべる", meaning: "to eat", type: "ru-verb",
    politePos: "食べます", politeNeg: "食べません", politePast: "食べました", politePastNeg: "食べませんでした",
    plainPos: "食べる", plainNeg: "食べない", plainPast: "食べた", plainPastNeg: "食べなかった",
    teForm: "食べて", potential: "食べられる",
  },
  {
    dictionary: "飲む", reading: "のむ", meaning: "to drink", type: "u-verb",
    politePos: "飲みます", politeNeg: "飲みません", politePast: "飲みました", politePastNeg: "飲みませんでした",
    plainPos: "飲む", plainNeg: "飲まない", plainPast: "飲んだ", plainPastNeg: "飲まなかった",
    teForm: "飲んで", potential: "飲める",
  },
  {
    dictionary: "行く", reading: "いく", meaning: "to go", type: "u-verb",
    politePos: "行きます", politeNeg: "行きません", politePast: "行きました", politePastNeg: "行きませんでした",
    plainPos: "行く", plainNeg: "行かない", plainPast: "行った", plainPastNeg: "行かなかった",
    teForm: "行って", potential: "行ける",
  },
  {
    dictionary: "来る", reading: "くる", meaning: "to come", type: "irregular",
    politePos: "来ます", politeNeg: "来ません", politePast: "来ました", politePastNeg: "来ませんでした",
    plainPos: "来る", plainNeg: "来ない", plainPast: "来た", plainPastNeg: "来なかった",
    teForm: "来て", potential: "来られる",
  },
  {
    dictionary: "する", reading: "する", meaning: "to do", type: "irregular",
    politePos: "します", politeNeg: "しません", politePast: "しました", politePastNeg: "しませんでした",
    plainPos: "する", plainNeg: "しない", plainPast: "した", plainPastNeg: "しなかった",
    teForm: "して", potential: "できる",
  },
  {
    dictionary: "見る", reading: "みる", meaning: "to see / watch", type: "ru-verb",
    politePos: "見ます", politeNeg: "見ません", politePast: "見ました", politePastNeg: "見ませんでした",
    plainPos: "見る", plainNeg: "見ない", plainPast: "見た", plainPastNeg: "見なかった",
    teForm: "見て", potential: "見られる",
  },
  {
    dictionary: "聞く", reading: "きく", meaning: "to listen / ask", type: "u-verb",
    politePos: "聞きます", politeNeg: "聞きません", politePast: "聞きました", politePastNeg: "聞きませんでした",
    plainPos: "聞く", plainNeg: "聞かない", plainPast: "聞いた", plainPastNeg: "聞かなかった",
    teForm: "聞いて", potential: "聞ける",
  },
  {
    dictionary: "読む", reading: "よむ", meaning: "to read", type: "u-verb",
    politePos: "読みます", politeNeg: "読みません", politePast: "読みました", politePastNeg: "読みませんでした",
    plainPos: "読む", plainNeg: "読まない", plainPast: "読んだ", plainPastNeg: "読まなかった",
    teForm: "読んで", potential: "読める",
  },
  {
    dictionary: "書く", reading: "かく", meaning: "to write", type: "u-verb",
    politePos: "書きます", politeNeg: "書きません", politePast: "書きました", politePastNeg: "書きませんでした",
    plainPos: "書く", plainNeg: "書かない", plainPast: "書いた", plainPastNeg: "書かなかった",
    teForm: "書いて", potential: "書ける",
  },
  {
    dictionary: "話す", reading: "はなす", meaning: "to speak", type: "u-verb",
    politePos: "話します", politeNeg: "話しません", politePast: "話しました", politePastNeg: "話しませんでした",
    plainPos: "話す", plainNeg: "話さない", plainPast: "話した", plainPastNeg: "話さなかった",
    teForm: "話して", potential: "話せる",
  },
  {
    dictionary: "起きる", reading: "おきる", meaning: "to wake up", type: "ru-verb",
    politePos: "起きます", politeNeg: "起きません", politePast: "起きました", politePastNeg: "起きませんでした",
    plainPos: "起きる", plainNeg: "起きない", plainPast: "起きた", plainPastNeg: "起きなかった",
    teForm: "起きて", potential: "起きられる",
  },
  {
    dictionary: "寝る", reading: "ねる", meaning: "to sleep", type: "ru-verb",
    politePos: "寝ます", politeNeg: "寝ません", politePast: "寝ました", politePastNeg: "寝ませんでした",
    plainPos: "寝る", plainNeg: "寝ない", plainPast: "寝た", plainPastNeg: "寝なかった",
    teForm: "寝て", potential: "寝られる",
  },
  {
    dictionary: "買う", reading: "かう", meaning: "to buy", type: "u-verb",
    politePos: "買います", politeNeg: "買いません", politePast: "買いました", politePastNeg: "買いませんでした",
    plainPos: "買う", plainNeg: "買わない", plainPast: "買った", plainPastNeg: "買わなかった",
    teForm: "買って", potential: "買える",
  },
  {
    dictionary: "分かる", reading: "わかる", meaning: "to understand", type: "u-verb",
    politePos: "分かります", politeNeg: "分かりません", politePast: "分かりました", politePastNeg: "分かりませんでした",
    plainPos: "分かる", plainNeg: "分からない", plainPast: "分かった", plainPastNeg: "分からなかった",
    teForm: "分かって", potential: "—",
  },
];

const TYPE_COLOR: Record<Verb["type"], { color: string; label: string }> = {
  "ru-verb": { color: "#3b82f6", label: "Ru-verb (Group 2)" },
  "u-verb": { color: "#f59e0b", label: "U-verb (Group 1)" },
  "irregular": { color: "#ec4899", label: "Irregular (Group 3)" },
};

const ROWS: { label: string; politeKey: keyof Verb; plainKey: keyof Verb; note?: string }[] = [
  { label: "Present / Future", politeKey: "politePos", plainKey: "plainPos", note: "～ます / dictionary form" },
  { label: "Present Negative", politeKey: "politeNeg", plainKey: "plainNeg", note: "～ません / ～ない" },
  { label: "Past", politeKey: "politePast", plainKey: "plainPast", note: "～ました / ～た" },
  { label: "Past Negative", politeKey: "politePastNeg", plainKey: "plainPastNeg", note: "～ませんでした / ～なかった" },
];

export function ConjugationTable() {
  const [verbIdx, setVerbIdx] = useState(0);
  const [style, setStyle] = useState<"polite" | "plain" | "both">("both");

  const verb = VERBS[verbIdx];
  const tc = TYPE_COLOR[verb.type];

  return (
    <div className="my-8 rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Verb Conjugation</h3>
        <div className="flex gap-1 ml-auto">
          {(["polite", "plain", "both"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors capitalize ${
                style === s
                  ? "bg-[#222] border-border text-foreground"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Verb selector */}
      <div className="px-4 py-3 border-b border-border flex flex-wrap gap-1.5">
        {VERBS.map((v, i) => (
          <button
            key={v.dictionary}
            onClick={() => setVerbIdx(i)}
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
              i === verbIdx ? "bg-[#222] border-border text-foreground" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {v.dictionary}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Verb header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="text-4xl font-bold" style={{ color: tc.color }}>{verb.dictionary}</div>
          <div>
            <div className="text-sm text-foreground font-medium">{verb.reading}</div>
            <div className="text-sm text-muted-foreground">{verb.meaning}</div>
            <div
              className="text-[10px] mt-1 px-2 py-0.5 rounded border inline-block"
              style={{ color: tc.color, borderColor: tc.color + "40", backgroundColor: tc.color + "10" }}
            >
              {tc.label}
            </div>
          </div>
        </div>

        {/* Conjugation table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[#111]">
                <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium w-32">Form</th>
                {(style === "both" || style === "polite") && (
                  <th className="text-left px-3 py-2 text-xs font-medium" style={{ color: "#3b82f6" }}>
                    Polite (ていねい)
                  </th>
                )}
                {(style === "both" || style === "plain") && (
                  <th className="text-left px-3 py-2 text-xs font-medium" style={{ color: "#f59e0b" }}>
                    Plain (ふつう)
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-[#0d0d0d]" : "bg-[#111]"}`}>
                  <td className="px-3 py-3">
                    <div className="text-xs text-foreground font-medium">{row.label}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{row.note}</div>
                  </td>
                  {(style === "both" || style === "polite") && (
                    <td className="px-3 py-3 text-base font-medium text-foreground">
                      {verb[row.politeKey] as string}
                    </td>
                  )}
                  {(style === "both" || style === "plain") && (
                    <td className="px-3 py-3 text-base font-medium text-foreground">
                      {verb[row.plainKey] as string}
                    </td>
                  )}
                </tr>
              ))}
              {/* Te-form */}
              <tr className="border-b border-border/50 bg-[#0d0d0d]">
                <td className="px-3 py-3">
                  <div className="text-xs text-foreground font-medium">Te-form</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">～て (connecting / requests)</div>
                </td>
                {(style === "both" || style === "polite") && (
                  <td className="px-3 py-3 text-base font-medium text-foreground">{verb.teForm}</td>
                )}
                {(style === "both" || style === "plain") && (
                  <td className="px-3 py-3 text-base font-medium text-foreground">{verb.teForm}</td>
                )}
              </tr>
              {/* Potential */}
              <tr className="bg-[#111]">
                <td className="px-3 py-3">
                  <div className="text-xs text-foreground font-medium">Potential</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">can / be able to</div>
                </td>
                {(style === "both" || style === "polite") && (
                  <td className="px-3 py-3 text-base font-medium text-foreground">{verb.potential}</td>
                )}
                {(style === "both" || style === "plain") && (
                  <td className="px-3 py-3 text-base font-medium text-foreground">{verb.potential}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pattern hint */}
        <div className="mt-4 rounded-lg bg-[#111] border border-border p-3 text-xs text-muted-foreground">
          {verb.type === "ru-verb" && (
            <><span className="text-blue-400 font-semibold">Ru-verb pattern:</span> Drop る, add ending. Stem: <strong className="text-foreground">{verb.dictionary.replace("る", "")}</strong> → + ます, + て, + ない, + た</>
          )}
          {verb.type === "u-verb" && (
            <><span className="text-amber-400 font-semibold">U-verb pattern:</span> The final う-row sound changes per form. Each form follows its own vowel shift rule.</>
          )}
          {verb.type === "irregular" && (
            <><span className="text-pink-400 font-semibold">Irregular verb:</span> する and 来る are the only two irregular verbs in Japanese. They must be memorized separately.</>
          )}
        </div>
      </div>
    </div>
  );
}
