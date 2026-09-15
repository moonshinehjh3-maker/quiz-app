import { NextResponse } from "next/server";
import { z } from "zod";
import { checkAnswer } from "@/lib/quiz";

const bodySchema = z.object({
  position: z.number().int().min(0),
  choice: z.number().int().min(0).max(3),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const correct = await checkAnswer({
      quizId: id,
      position: parsed.data.position,
      choice: parsed.data.choice,
    });
    if (correct === null) {
      return NextResponse.json({ error: "문항을 찾을 수 없습니다." }, { status: 404 });
    }
    // 정답 인덱스는 응답에 포함하지 않는다.
    return NextResponse.json({ correct });
  } catch (error) {
    console.error("[quiz:check]", error);
    return NextResponse.json({ error: "채점에 실패했습니다." }, { status: 500 });
  }
}
