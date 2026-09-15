import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DIFFICULTIES,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  generateQuiz,
  saveQuiz,
} from "@/lib/quiz";

// 생성은 LLM 호출이라 길어질 수 있다 (Fluid Compute 기본 런타임).
export const maxDuration = 300;

const bodySchema = z.object({
  topic: z.string().trim().min(1, "주제를 입력하세요.").max(80),
  difficulty: z.enum(DIFFICULTIES),
  count: z.coerce.number().int().min(MIN_QUESTIONS).max(MAX_QUESTIONS),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  const { topic, difficulty, count } = parsed.data;

  try {
    const quiz = await generateQuiz({ topic, difficulty, count });
    const id = await saveQuiz({ topic, difficulty, quiz });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("[quiz:create]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "퀴즈 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
