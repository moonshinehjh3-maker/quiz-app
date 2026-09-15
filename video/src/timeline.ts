/**
 * 영상의 모든 프레임 숫자가 모이는 단일 출처.
 * 씬 파일에는 매직 넘버를 두지 않는다.
 */

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const sec = (s: number) => Math.round(s * FPS);

/**
 * 씬 길이 (전환 겹침을 적용하기 전의 각 씬 자체 길이).
 *
 * 주제 입력 → 옵션 선택 → 생성 중은 **같은 폼 카드가 계속 떠 있는** 한 흐름이다.
 * TransitionSeries 로 나누면 경계에서 subtree 가 remount 되어 카드가 깜빡이므로,
 * 하나의 씬(S2Form) 안에서 내부 Sequence 로 처리한다.
 */
export const SCENES = [
  { id: "S1Hook", title: "훅", durationInFrames: sec(5.5) }, // 165
  { id: "S2Form", title: "주제 입력·옵션·생성", durationInFrames: sec(14.0) }, // 420
  { id: "S5Answer", title: "풀이·성장", durationInFrames: sec(20.0) }, // 600
  { id: "S6Bloom", title: "결과", durationInFrames: sec(9.0) }, // 270
  { id: "S7Outro", title: "아웃로", durationInFrames: sec(7.0) }, // 210
] as const;

/** 씬 사이 전환 길이. SCENES.length - 1 개여야 한다. */
export const TRANSITIONS = [12, 15, 12, 18] as const;

/** S2Form 안에서 각 단계가 시작하는 로컬 프레임. */
export const S2_PHASE = { topic: 0, options: 150, generating: 300 } as const;

/**
 * TransitionSeries 는 이웃 씬을 **겹친다**. 단순 합을 쓰면 끝에 검은 프레임이 남는다.
 * 총 길이 = 씬 합 - 전환 합.
 */
export const TOTAL =
  SCENES.reduce((a, s) => a + s.durationInFrames, 0) -
  TRANSITIONS.reduce((a: number, t) => a + t, 0);

// ---------------------------------------------------------------------------
// 씬 내부 비트 (각 씬의 로컬 프레임 기준)
// ---------------------------------------------------------------------------

export const S1 = {
  gradientIn: [0, 12],
  plantIn: [8, 30],
  badgeIn: [14, 30],
  titleLine1: [20, 45],
  titleLine2: [28, 53],
  /** 이 영상의 핵심 — 씨앗에서 만개까지 */
  grow: [45, 78],
  pops: [50, 58, 66, 74],
} as const;

export const S2 = {
  windowIn: [0, 15],
  cardStagger: [12, 32],
  cursorToInput: [30, 46],
  clickInput: 46,
  typeStart: 50,
  /** 「태양계 행성」 6글자. 공백에서 한 박자 쉰다. */
  typeDelays: [7, 6, 8, 12, 6, 7],
  caption: [20, 140],
} as const;

export const S3 = {
  cursorToDifficulty: [0, 20],
  clickDifficulty: 20,
  cursorToSlider: [24, 40],
  dragSlider: [40, 75],
  cursorToSubmit: [75, 92],
  clickSubmit: 98,
  caption1: [10, 90],
  caption2: [95, 150],
} as const;

export const S4 = {
  buttonToPending: [0, 6],
  helperIn: [6, 20],
  shimmerPeriod: 45,
  skeletonIn: [20, 110],
  caption: [15, 115],
} as const;

/** 성장 램프 길이 = 앱의 `duration-700` 과 동일 (700ms). */
export const GROWTH_FRAMES = Math.round((700 / 1000) * FPS); // 21
/** plant-pop 길이 = 600ms. */
export const POP_FRAMES = Math.round((600 / 1000) * FPS); // 18
/** answer-shake 길이 = 400ms. */
export const SHAKE_FRAMES = Math.round((400 / 1000) * FPS); // 12

export const S5 = {
  pageIn: [0, 20],
  /** 각 문항: 카드 등장 / 커서 도착 / 클릭 / 성장 시작 */
  questions: [
    { cardIn: [20, 40], cursor: [40, 60], click: 62, grow: 72, correct: true },
    { cardIn: [130, 150], cursor: [150, 165], click: 165, grow: null, correct: false },
    { cardIn: [250, 258], cursor: [258, 268], click: 268, grow: 270, correct: true },
    { cardIn: [320, 328], cursor: [328, 336], click: 328, grow: 330, correct: true },
    { cardIn: [380, 388], cursor: [388, 396], click: 388, grow: 390, correct: true },
  ],
  /** 마지막 정답 → 만개 */
  finalClick: 470,
  finalGrow: 480,
  submitCardIn: [505, 530],
  clickSubmit: 535,
  captions: [
    { text: "맞히면 식물이 한 단계 자랍니다", range: [75, 115] },
    { text: "틀려도 정답은 알려주지 않습니다.\n끝까지 비밀.", range: [180, 245] },
    { text: "잎이 나고", range: [280, 350] },
    { text: "꽃봉오리가 맺힙니다", range: [358, 430] },
  ],
} as const;

export const S6 = {
  cardIn: [0, 20],
  scoreCount: [6, 24],
  messageIn: [20, 32],
  halo: [20, 60],
  pops: [20, 40],
  panToExplanations: [60, 150],
  panToRanking: [150, 240],
  captions: [
    { text: "정답과 해설은 끝나고 한 번에", range: [65, 145] },
    { text: "점수는 Neon 에 저장되고 랭킹에 남습니다", range: [160, 235] },
  ],
} as const;

export const S7 = {
  plantIn: [0, 18],
  titleIn: [10, 30],
  subtitleIn: [18, 38],
  urlIn: [30, 50],
  githubIn: [45, 65],
  stackIn: [55, 75],
  fadeOut: [180, 210],
} as const;
