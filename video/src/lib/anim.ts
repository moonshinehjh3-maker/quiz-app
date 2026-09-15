import { Easing, interpolate } from "remotion";
import { GROWTH_FRAMES } from "../timeline";

/** Tailwind `ease-out` = cubic-bezier(0, 0, 0.2, 1). 앱의 transition 과 동일. */
export const EASE_OUT = Easing.bezier(0, 0, 0.2, 1);
/** Tailwind 기본 `transition` = cubic-bezier(0.4, 0, 0.2, 1). */
export const EASE_IN_OUT = Easing.bezier(0.4, 0, 0.2, 1);
/** 커서 이동용 — 빠르게 출발해 부드럽게 멈춘다. */
export const EASE_POINTER = Easing.bezier(0.33, 0, 0.1, 1);

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 구간 [a,b] 동안 0→1. */
export function ramp(
  frame: number,
  [a, b]: readonly [number, number] | readonly number[],
  easing = EASE_OUT,
) {
  return interpolate(frame, [a as number, b as number], [0, 1], { easing, ...CLAMP });
}

/** 아래에서 올라오며 나타나는 공통 연출. */
export function fadeUp(
  frame: number,
  range: readonly number[],
  distance = 24,
  easing = EASE_OUT,
) {
  const t = ramp(frame, range, easing);
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * distance}px)`,
  };
}

/** 구간 안에서만 보이는 자막용 페이드 (앞뒤 10프레임). */
export function fadeInOut(frame: number, [a, b]: readonly number[], pad = 10) {
  return interpolate(frame, [a, a + pad, b - pad, b], [0, 1, 1, 0], CLAMP);
}

/**
 * 앱의 `correct` 정수 변화 + `transition-all duration-700 ease-out` 을
 * 하나의 연속 함수로 재현한다.
 *
 * 앱에서 correct 가 2→3 으로 바뀌면 브라우저가 700ms 동안 ease-out 으로 보간한다.
 * 그건 progress 를 2/N 에서 3/N 으로 21프레임에 걸쳐 ease-out 하는 것과 수학적으로 같다.
 *
 * 성장 이력 전체를 interpolate 한 번으로 표현하므로, 진행바·정답 카운터·문구 사다리가
 * 전부 이 함수 하나를 쓰면 절대 어긋날 수 없다.
 */
export function growthAt(
  frame: number,
  events: readonly { grow: number | null; correct: boolean }[],
  total: number,
): number {
  const input: number[] = [0];
  const output: number[] = [0];
  let correctSoFar = 0;

  for (const e of events) {
    if (e.grow === null || !e.correct) continue;
    correctSoFar += 1;
    // 성장 시작 직전까지는 이전 값을 유지 (평평한 구간)
    input.push(e.grow);
    output.push(output[output.length - 1]);
    // 램프 구간
    input.push(e.grow + GROWTH_FRAMES);
    output.push(correctSoFar / total);
  }

  if (input.length === 1) return 0;
  return interpolate(frame, input, output, { easing: EASE_OUT, ...CLAMP });
}

/**
 * answer-shake 키프레임의 프레임 기반 구현.
 * 원본 CSS: 0%,100% translateX(0) / 25% -5px / 75% +5px, 400ms ease-in-out.
 * 12프레임 기준 키프레임 위치는 0 / 3 / 9 / 12.
 */
export function shakeX(framesSinceShake: number) {
  if (framesSinceShake < 0 || framesSinceShake > 12) return 0;
  return interpolate(framesSinceShake, [0, 3, 9, 12], [0, -5, 5, 0], {
    easing: EASE_IN_OUT,
    ...CLAMP,
  });
}

/** 결정론적인 무한 시머 — 프레임 나머지 연산만 쓴다 (Math.random 금지). */
export function shimmerX(frame: number, period: number) {
  return interpolate(frame % period, [0, period], [-30, 130]);
}
