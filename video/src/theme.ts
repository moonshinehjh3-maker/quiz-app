/**
 * 앱의 디자인 토큰을 영상용으로 복제한 것.
 * 원본은 app/globals.css 의 :root (라이트 모드) 와 Tailwind 팔레트.
 * 영상은 라이트 모드 기준으로만 만든다.
 */
export const C = {
  background: "#f7f7f8",
  foreground: "#16161a",
  card: "#ffffff",
  border: "#e4e4e7",
  muted: "#6b7280",
  accent: "#4f46e5",

  // 식물 SVG 가 쓰는 Tailwind 색을 hex 로 고정
  potBody: "#ca3500", // orange-700
  potRim: "#f54900", // orange-600
  soil: "#7b3306", // amber-900
  stem: "#009966", // emerald-600
  leaf: "#00bc7d", // emerald-500
  petal: "#fb64b6", // pink-400
  flowerCenter: "#ffd230", // amber-300
  seed: "#fe9a00", // amber-500
  seedHighlight: "#fee685", // amber-200

  emerald500: "#00bc7d",
  emerald600: "#009966",
  red400: "#ff6467",
  red500: "#fb2c36",
} as const;

/** 앱 본문 폭 (max-w-3xl). 영상은 1920 폭이라 확대해서 쓴다. */
export const APP_WIDTH = 768;

/** 1920×1080 안에서 앱 화면을 이 배율로 키워 보여준다. */
export const APP_SCALE = 1.45;

/** app/quiz/[id]/quiz-player.tsx 의 growthMessage() 와 동일한 문구 사다리. */
export function growthMessage(ratio: number): string {
  if (ratio >= 1) return "꽃이 활짝 피었습니다!";
  if (ratio >= 0.7) return "꽃봉오리가 맺혔어요.";
  if (ratio >= 0.4) return "잎이 무성해졌어요.";
  if (ratio > 0) return "싹이 텄어요.";
  return "아직 씨앗이에요. 한 문제만 맞혀도 싹이 납니다.";
}

/** 앱 홈 히어로의 배경 그라디언트 (app/page.tsx:30). */
export const HERO_GRADIENT =
  "radial-gradient(120% 120% at 0% 0%, rgba(79,70,229,0.16), transparent 58%)," +
  "radial-gradient(110% 110% at 100% 100%, rgba(16,185,129,0.20), transparent 55%)";
