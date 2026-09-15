import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { MAX_QUESTIONS, MIN_QUESTIONS, type Difficulty } from "./constants";
import { ensureSchema, getSql } from "./db";

export { DIFFICULTIES, MAX_QUESTIONS, MIN_QUESTIONS } from "./constants";
export type { Difficulty } from "./constants";

/** OpenAI 가 돌려줄 구조. 보기는 항상 4개. */
const generatedQuizSchema = z.object({
  title: z.string().describe("퀴즈 제목. 20자 이내."),
  questions: z
    .array(
      z.object({
        prompt: z.string().describe("질문 문장."),
        choices: z.array(z.string()).length(4).describe("보기 4개."),
        answerIndex: z.number().int().min(0).max(3).describe("정답 보기의 0-based 인덱스."),
        explanation: z.string().describe("왜 그 보기가 정답인지 2문장 이내 해설."),
      }),
    )
    .min(MIN_QUESTIONS)
    .max(MAX_QUESTIONS),
});

export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

function openai() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY 가 없습니다. Vercel 환경변수에 등록한 뒤 `vercel env pull .env.local` 을 실행하세요.",
    );
  }
  return createOpenAI({ apiKey });
}

/** 정답이 특정 위치에 몰리지 않도록 보기 순서를 서버에서 섞는다. */
function shuffleChoices(q: GeneratedQuiz["questions"][number]) {
  const indexed = q.choices.map((text, i) => ({ text, correct: i === q.answerIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    ...q,
    choices: indexed.map((c) => c.text),
    answerIndex: indexed.findIndex((c) => c.correct),
  };
}

export async function generateQuiz(input: {
  topic: string;
  difficulty: Difficulty;
  count: number;
}): Promise<GeneratedQuiz> {
  const { object } = await generateObject({
    model: openai()(MODEL),
    schema: generatedQuizSchema,
    system: [
      "너는 한국어 객관식 퀴즈 출제자다.",
      "규칙:",
      "- 모든 문제/보기/해설은 한국어로 작성한다.",
      "- 보기는 정확히 4개이며 서로 명확히 구별되어야 한다.",
      "- 정답은 반드시 하나이고, 나머지 보기는 그럴듯하지만 분명히 틀려야 한다.",
      "- 사실관계가 확실한 내용만 출제한다. 애매하거나 논쟁적인 소재는 피한다.",
      "- '다음 중 옳은 것은?' 같은 모호한 문제 대신 구체적인 질문을 쓴다.",
      "- 같은 내용을 반복 출제하지 않는다.",
    ].join("\n"),
    prompt: [
      `주제: ${input.topic}`,
      `난이도: ${input.difficulty}`,
      `문항 수: 정확히 ${input.count}개`,
      "",
      "위 조건으로 객관식 퀴즈를 만들어라.",
    ].join("\n"),
  });

  return { ...object, questions: object.questions.map(shuffleChoices) };
}

export type QuizRow = {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  model: string;
  created_at: string;
};

/** 생성된 퀴즈를 Neon 에 저장하고 id 를 돌려준다. */
export async function saveQuiz(input: {
  topic: string;
  difficulty: Difficulty;
  quiz: GeneratedQuiz;
}): Promise<string> {
  await ensureSchema();
  const sql = getSql();

  const [quiz] = (await sql`
    INSERT INTO quizzes (topic, title, difficulty, model)
    VALUES (${input.topic}, ${input.quiz.title}, ${input.difficulty}, ${MODEL})
    RETURNING id
  `) as { id: string }[];

  await sql.transaction(
    input.quiz.questions.map((q, i) =>
      sql`
        INSERT INTO questions (quiz_id, position, prompt, choices, answer_index, explanation)
        VALUES (${quiz.id}, ${i}, ${q.prompt}, ${JSON.stringify(q.choices)}, ${q.answerIndex}, ${q.explanation})
      `,
    ),
  );

  return quiz.id;
}

/** 플레이 화면용 — 정답과 해설은 내려보내지 않는다. */
export async function getQuizForPlay(id: string) {
  await ensureSchema();
  const sql = getSql();

  const [quiz] = (await sql`
    SELECT id, topic, title, difficulty, model, created_at FROM quizzes WHERE id = ${id}
  `) as QuizRow[];
  if (!quiz) return null;

  const questions = (await sql`
    SELECT position, prompt, choices FROM questions WHERE quiz_id = ${id} ORDER BY position
  `) as { position: number; prompt: string; choices: string[] }[];

  return { quiz, questions };
}

/**
 * 문항 하나를 즉시 채점한다. 정답/오답 여부만 돌려주고
 * 정답 인덱스나 해설은 내려보내지 않는다 (최종 결과 화면에서만 공개).
 */
export async function checkAnswer(input: {
  quizId: string;
  position: number;
  choice: number;
}): Promise<boolean | null> {
  await ensureSchema();
  const sql = getSql();

  const [row] = (await sql`
    SELECT answer_index FROM questions
    WHERE quiz_id = ${input.quizId} AND position = ${input.position}
  `) as { answer_index: number }[];

  if (!row) return null;
  return row.answer_index === input.choice;
}

export type GradedQuestion = {
  position: number;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  selected: number | null;
  correct: boolean;
};

/** 채점은 반드시 서버에서 한다. 클라이언트는 정답을 모른다. */
export async function gradeAttempt(input: {
  quizId: string;
  nickname: string;
  answers: (number | null)[];
  elapsedMs: number | null;
}) {
  await ensureSchema();
  const sql = getSql();

  const questions = (await sql`
    SELECT position, prompt, choices, answer_index, explanation
    FROM questions WHERE quiz_id = ${input.quizId} ORDER BY position
  `) as {
    position: number;
    prompt: string;
    choices: string[];
    answer_index: number;
    explanation: string;
  }[];

  if (questions.length === 0) return null;

  const graded: GradedQuestion[] = questions.map((q) => {
    const selected = input.answers[q.position] ?? null;
    return {
      position: q.position,
      prompt: q.prompt,
      choices: q.choices,
      answerIndex: q.answer_index,
      explanation: q.explanation,
      selected,
      correct: selected === q.answer_index,
    };
  });

  const score = graded.filter((g) => g.correct).length;

  await sql`
    INSERT INTO attempts (quiz_id, nickname, score, total, elapsed_ms)
    VALUES (${input.quizId}, ${input.nickname}, ${score}, ${questions.length}, ${input.elapsedMs})
  `;

  return { score, total: questions.length, graded };
}

export async function getRecentQuizzes(limit = 12) {
  await ensureSchema();
  const sql = getSql();
  return (await sql`
    SELECT q.id, q.topic, q.title, q.difficulty, q.created_at,
           (SELECT count(*) FROM questions WHERE quiz_id = q.id)::int AS question_count,
           (SELECT count(*) FROM attempts  WHERE quiz_id = q.id)::int AS attempt_count,
           COALESCE((SELECT max(score) FROM attempts WHERE quiz_id = q.id), 0)::int AS best_score
    FROM quizzes q
    ORDER BY q.created_at DESC
    LIMIT ${limit}
  `) as (QuizRow & {
    question_count: number;
    attempt_count: number;
    best_score: number;
  })[];
}

export async function getLeaderboard(quizId: string, limit = 10) {
  await ensureSchema();
  const sql = getSql();
  return (await sql`
    SELECT nickname, score, total, elapsed_ms, created_at
    FROM attempts
    WHERE quiz_id = ${quizId}
    ORDER BY score DESC, elapsed_ms ASC NULLS LAST, created_at ASC
    LIMIT ${limit}
  `) as {
    nickname: string;
    score: number;
    total: number;
    elapsed_ms: number | null;
    created_at: string;
  }[];
}
