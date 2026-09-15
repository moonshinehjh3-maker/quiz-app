"use client";

import { useEffect, useState } from "react";
import Plant from "@/components/plant";

const TOTAL = 5;
const STEP_MS = 900;
const HOLD_MS = 1800;

/**
 * 홈 히어로에서 씨앗 → 만개까지 반복 재생하며
 * "맞히면 자란다"는 규칙을 한눈에 보여준다.
 */
export default function HeroPlant() {
  const [correct, setCorrect] = useState(0);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    // 모션 최소화를 선호하면 애니메이션 없이 만개 상태로 둔다.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCorrect(TOTAL);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const tick = (value: number) => {
      setCorrect(value);
      if (value > 0) {
        setPop(true);
        setTimeout(() => setPop(false), 600);
      }
      const next = value >= TOTAL ? 0 : value + 1;
      timer = setTimeout(() => tick(next), value >= TOTAL ? HOLD_MS : STEP_MS);
    };

    timer = setTimeout(() => tick(1), STEP_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      {/* 뒤쪽 후광 */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/25 blur-2xl transition-all duration-700"
        style={{ scale: `${0.6 + (correct / TOTAL) * 0.7}` }}
      />
      <Plant
        correct={correct}
        total={TOTAL}
        celebrate={pop}
        className="relative h-48 w-48 sm:h-56 sm:w-56"
        label="정답을 맞힐수록 자라는 식물"
      />
    </div>
  );
}
