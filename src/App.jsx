import React, { useEffect, useMemo, useState } from "react";

/** ===== 카드 앞면 아이콘들 (매칭 대상만!) ===== */
const ICONS = [
  { key: "dog_happy", label: "강아지-웃음", src: "icons/dog-smile.png" },
  { key: "dog_wink", label: "강아지-윙크", src: "icons/dog-wink.png" },
  { key: "dog_surprise", label: "강아지-놀람", src: "icons/dog-suprise.png" },

  { key: "cat_happy", label: "고양이-웃음", src: "icons/cat-smile.png" },
  { key: "cat_wink", label: "고양이-윙크", src: "icons/cat-wink.png" },
  { key: "cat_surprise", label: "고양이-놀람", src: "icons/cat-suprise.png" },

  { key: "panda_happy", label: "팬더-웃음", src: "icons/pander-smile.png" },
  { key: "panda_wink", label: "팬더-윙크", src: "icons/pander-wink.png" },
  { key: "panda_surprise", label: "팬더-놀람", src: "icons/pander-suprise.png" },

  { key: "frog_happy", label: "개구리-웃음", src: "icons/frog-smile.png" },
  { key: "frog_wink", label: "개구리-윙크", src: "icons/frog-wink.png" },
  { key: "frog_surprise", label: "개구리-놀람", src: "icons/frog-suprise.png" },
];

/** ===== 카드 뒷면 이미지 ===== */
const HIDDEN_CARD_SRC = "icons/hidden_card.png";

/** ===== 유틸 ===== */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const cryptoRandomId = () =>
  crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const buildDeck = () =>
  shuffle(
    ICONS.flatMap((x) => [
      {
        id: cryptoRandomId(),
        matchKey: x.key,
        src: x.src,
        label: x.label,
        isFaceUp: false,
        isMatched: false,
      },
      {
        id: cryptoRandomId(),
        matchKey: x.key,
        src: x.src,
        label: x.label,
        isFaceUp: false,
        isMatched: false,
      },
    ])
  );

export default function MemoryGame24_PlayerVsPlayer() {
  const [cards, setCards] = useState(buildDeck);
  const [turn, setTurn] = useState("p1");
  const [flipped, setFlipped] = useState([]);
  const [lock, setLock] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [status, setStatus] = useState(
    "플레이어 1 차례: 카드 2장을 뒤집어 보세요!"
  );

  const totalPairs = ICONS.length;
  const finished = useMemo(
    () => cards.every((c) => c.isMatched),
    [cards]
  );

  const reset = () => {
    setCards(buildDeck());
    setTurn("p1");
    setFlipped([]);
    setLock(false);
    setScores({ p1: 0, p2: 0 });
    setStatus("플레이어 1 차례: 카드 2장을 뒤집어 보세요!");
  };

  const reveal = (i) =>
    setCards((p) =>
      p.map((c, idx) => (idx === i ? { ...c, isFaceUp: true } : c))
    );

  const hide = (i) =>
    setCards((p) =>
      p.map((c, idx) => (idx === i ? { ...c, isFaceUp: false } : c))
    );

  const markMatched = (i1, i2) =>
    setCards((p) =>
      p.map((c, i) =>
        i === i1 || i === i2
          ? { ...c, isMatched: true, isFaceUp: true }
          : c
      )
    );

  const nextTurnLabel = (t) => (t === "p1" ? "플레이어 1" : "플레이어 2");

  const resolveTurn = async ([i1, i2]) => {
    setLock(true);
    const isMatch = cards[i1].matchKey === cards[i2].matchKey;

    if (isMatch) {
      markMatched(i1, i2);
      setScores((s) => ({ ...s, [turn]: s[turn] + 1 }));
      setFlipped([]);
      setStatus(`${nextTurnLabel(turn)} 정답! 턴 유지`);
      setLock(false);
      return;
    }

    setStatus("틀렸어요. 다시 뒤집습니다...");
    await sleep(800);
    hide(i1);
    hide(i2);
    setFlipped([]);
    setLock(false);
    setTurn((t) => (t === "p1" ? "p2" : "p1"));
    setStatus(`${nextTurnLabel(turn === "p1" ? "p2" : "p1")} 차례`);
  };

  const onCardClick = async (i) => {
    if (lock || finished) return;
    if (cards[i].isFaceUp || cards[i].isMatched) return;
    if (flipped.length === 2) return;

    reveal(i);
    const nf = [...flipped, i];
    setFlipped(nf);
    if (nf.length === 2) await resolveTurn(nf);
  };

  useEffect(() => {
    if (!finished) return;
    if (scores.p1 > scores.p2)
      setStatus("게임 종료! 🎉 플레이어 1 승리!");
    else if (scores.p1 < scores.p2)
      setStatus("게임 종료! 🎉 플레이어 2 승리!");
    else setStatus("게임 종료! 무승부!");
  }, [finished, scores]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            메모리 게임 (플레이어 1 vs 플레이어 2)
          </h1>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
          >
            새 게임
          </button>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-emerald-300">플레이어 1: {scores.p1}</div>
          <div className="text-sky-300">플레이어 2: {scores.p2}</div>
        </div>

        <div className="text-sm text-neutral-300">
          {status} · 남은 쌍: {totalPairs - scores.p1 - scores.p2}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onCardClick(i)}
              disabled={lock || c.isMatched}
              className={`aspect-[284/226] rounded-2xl border ${
                c.isMatched || c.isFaceUp
                  ? "bg-neutral-800 border-neutral-700"
                  : "bg-neutral-950 border-neutral-800 hover:bg-neutral-900"
              }`}
            >
              {c.isFaceUp || c.isMatched ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <img
                    src={c.src}
                    alt={c.label}
                    className="w-16 h-16 object-contain"
                    draggable={false}
                  />
                  <div className="text-[10px] text-neutral-300 mt-2">
                    {c.label}
                  </div>
                </div>
              ) : (
                <img
                  src={HIDDEN_CARD_SRC}
                  alt="hidden card"
                  className="w-full h-full object-contain p-3"
                  draggable={false}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
