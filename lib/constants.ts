/** 클라이언트/서버가 함께 쓰는 상수. 서버 전용 의존성이 없어야 한다. */
export const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 12;
