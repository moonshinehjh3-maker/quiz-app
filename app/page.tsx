import Link from "next/link";
import Plant from "@/components/plant";
import { getRecentQuizzes } from "@/lib/quiz";
import CreateQuizForm from "./create-quiz-form";
import HeroPlant from "./hero-plant";

export const dynamic = "force-dynamic";

/** 홈에서 성장 규칙을 한 줄로 보여주는 단계 카드. */
const STAGES = [
  { correct: 0, total: 4, name: "씨앗", hint: "시작" },
  { correct: 1, total: 4, name: "새싹", hint: "1문제 정답" },
  { correct: 2, total: 4, name: "잎", hint: "절반 정답" },
  { correct: 4, total: 4, name: "만개", hint: "전부 정답" },
];

export default async function Home() {
  let recent: Awaited<ReturnType<typeof getRecentQuizzes>> = [];
  let dbError: string | null = null;

  try {
    recent = await getRecentQuizzes();
  } catch (error) {
    dbError = error instanceof Error ? error.message : "데이터베이스에 연결하지 못했습니다.";
  }

  return (
    <div className="space-y-12">
      {/* 히어로 — 식물 키우기를 전면에 */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-[radial-gradient(120%_120%_at_0%_0%,rgba(79,70,229,0.16),transparent_58%),radial-gradient(110%_110%_at_100%_100%,rgba(16,185,129,0.20),transparent_55%)] p-7 sm:p-9">
        <div className="flex flex-col-reverse items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:max-w-sm sm:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              🌱 식물 키우기
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              한 문제 맞힐 때마다
              <br />
              식물이 자랍니다
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              주제만 입력하면 AI 가 객관식 퀴즈를 만들어 줍니다. 정답을 맞힐수록 씨앗이
              싹을 틔우고, 전부 맞히면 꽃이 활짝 핍니다.
            </p>
            <a
              href="#create"
              className="mt-5 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              퀴즈 만들러 가기
            </a>
          </div>

          <HeroPlant />
        </div>
      </section>

      {/* 성장 단계 */}
      <section>
        <h2 className="text-lg font-semibold">성장 단계</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAGES.map((stage) => (
            <li
              key={stage.name}
              className="flex flex-col items-center rounded-2xl border border-border bg-card py-4"
            >
              <Plant
                correct={stage.correct}
                total={stage.total}
                className="h-24 w-24"
                label={`${stage.name} 단계`}
              />
              <p className="mt-1 text-sm font-medium">{stage.name}</p>
              <p className="text-xs text-muted">{stage.hint}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 퀴즈 생성 */}
      <section id="create" className="scroll-mt-20">
        <h2 className="text-lg font-semibold">퀴즈 만들기</h2>
        <p className="mt-1 text-sm text-muted">
          OpenAI 가 문제·보기·해설을 생성하고, 만들어진 퀴즈와 점수는 Neon Postgres 에
          저장됩니다.
        </p>
        <div className="mt-3">
          <CreateQuizForm />
        </div>
      </section>

      {/* 최근 퀴즈 — 카드마다 최고 기록만큼 자란 식물 */}
      <section>
        <h2 className="text-lg font-semibold">최근 만들어진 퀴즈</h2>

        {dbError ? (
          <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {dbError}
          </p>
        ) : recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            아직 만들어진 퀴즈가 없습니다. 첫 씨앗을 심어 보세요.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {recent.map((quiz) => (
              <li key={quiz.id}>
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-accent"
                >
                  <Plant
                    correct={quiz.best_score}
                    total={quiz.question_count}
                    className="h-20 w-20"
                    label={`최고 기록 ${quiz.question_count}문제 중 ${quiz.best_score}문제`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{quiz.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">주제 · {quiz.topic}</p>
                    <p className="mt-2 text-xs text-muted">
                      {quiz.difficulty} · {quiz.question_count}문항 · 응시{" "}
                      {quiz.attempt_count}회
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {quiz.attempt_count === 0
                        ? "아직 아무도 키우지 않았어요"
                        : `최고 기록 ${quiz.best_score}/${quiz.question_count}`}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
