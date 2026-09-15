import { NextResponse } from "next/server";
import { z } from "zod";
import { gradeAttempt } from "@/lib/quiz";

const bodySchema = z.object({
  nickname: z.string().trim().min(1).max(20).catch("익명"),
  answers: z.array(z.number().int().min(0).max(3).nullable()),
  elapsedMs: z.number().int().min(0).nullable().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 제출입니다." }, { status: 400 });
  }

  try {
    const result = await gradeAttempt({
      quizId: id,
      nickname: parsed.data.nickname,
      answers: parsed.data.answers,
      elapsedMs: parsed.data.elapsedMs ?? null,
    });
    if (!result) {
      return NextResponse.json({ error: "퀴즈를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[quiz:attempt]", error);
    return NextResponse.json({ error: "채점에 실패했습니다." }, { status: 500 });
  }
}
