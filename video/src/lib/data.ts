/**
 * 영상에 나오는 퀴즈 내용.
 * 실제로 앱이 생성했던 「태양계 행성」 퀴즈를 그대로 옮겨 왔다
 * (docs/screenshots/result.png 에 찍힌 것과 동일).
 */

export const TOPIC = "태양계 행성";
export const QUIZ_TITLE = "태양계 행성 퀴즈";
export const QUIZ_META = "태양계 행성 · 보통 · 5문항";
export const DIFFICULTY = "보통";
export const COUNT = 5;

export type Question = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  /** 영상에서 커서가 실제로 고를 보기. 2번 문항만 일부러 틀린다. */
  pickIndex: number;
  explanation: string;
};

export const QUESTIONS: Question[] = [
  {
    prompt: "태양계에서 태양에 가장 가까운 행성은 무엇인가?",
    choices: ["금성", "수성", "지구", "화성"],
    answerIndex: 1,
    pickIndex: 1,
    explanation: "태양에 가장 가까운 행성은 수성이다. 공전 궤도가 가장 안쪽에 있다.",
  },
  {
    prompt: "태양계에서 가장 큰 행성은 무엇인가?",
    choices: ["토성", "목성", "천왕성", "해왕성"],
    answerIndex: 1,
    pickIndex: 0, // 일부러 오답 — answer-shake 와 "정답을 안 알려준다"를 보여주기 위해
    explanation: "목성은 태양계에서 지름과 질량이 가장 큰 행성이다.",
  },
  {
    prompt: "다음 행성들 중 고리가 가장 뚜렷하게 발달한 행성은?",
    choices: ["금성", "수성", "토성", "화성"],
    answerIndex: 2,
    pickIndex: 2,
    explanation: "토성은 매우 뚜렷하고 발달한 고리로 유명하다.",
  },
  {
    prompt: "지구의 바로 바깥쪽 궤도를 공전하는 행성은?",
    choices: ["목성", "수성", "금성", "화성"],
    answerIndex: 3,
    pickIndex: 3,
    explanation: "지구의 바로 바깥쪽에 있는 행성은 화성이다. 태양에서 네 번째 행성이다.",
  },
  {
    prompt: "자전축이 거의 옆으로 누운 것처럼 기울어진 행성은?",
    choices: ["목성", "화성", "금성", "천왕성"],
    answerIndex: 3,
    pickIndex: 3,
    explanation: "천왕성은 자전축 기울기가 매우 커서 거의 옆으로 누운 것처럼 보인다.",
  },
];

/** 앱 홈의 예시 칩 (app/create-quiz-form.tsx 의 EXAMPLES). */
export const EXAMPLES = ["태양계 행성", "한국사 조선시대", "자바스크립트 기초", "세계 축구 월드컵"];

export const DIFFICULTIES = ["쉬움", "보통", "어려움"];

/** 결과 화면 랭킹 */
export const RANKING = [
  { rank: 1, nickname: "데모", score: "5/5", time: "10.5초" },
  { rank: 2, nickname: "행성덕후", score: "4/5", time: "18.3초" },
  { rank: 3, nickname: "익명", score: "3/5", time: "22.1초" },
];

export const APP_URL = "ai-quiz-eight-umber.vercel.app";
export const REPO_URL = "github.com/moonshinehjh3-maker/quiz-app";
