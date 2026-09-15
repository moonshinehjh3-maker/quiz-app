import { notFound } from "next/navigation";
import QuizPlayer from "./quiz-player";
import { getLeaderboard, getQuizForPlay } from "@/lib/quiz";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: PageProps<"/quiz/[id]">) {
  const { id } = await params;

  const data = await getQuizForPlay(id).catch(() => null);
  if (!data) notFound();

  const leaderboard = await getLeaderboard(id).catch(() => []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{data.quiz.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {data.quiz.topic} · {data.quiz.difficulty} · {data.questions.length}문항
        </p>
      </header>

      <QuizPlayer quizId={id} questions={data.questions} />

      <section>
        <h2 className="text-lg font-semibold">랭킹</h2>
        {leaderboard.length === 0 ? (
          <p className="mt-2 text-sm text-muted">아직 응시 기록이 없습니다.</p>
        ) : (
          <ol className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {leaderboard.map((row, index) => (
              <li
                key={`${row.nickname}-${row.created_at}`}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="w-5 text-muted">{index + 1}</span>
                  <span className="font-medium">{row.nickname}</span>
                </span>
                <span className="text-muted">
                  {row.score}/{row.total}
                  {row.elapsed_ms != null && (
                    <span className="ml-2 text-xs">
                      {(row.elapsed_ms / 1000).toFixed(1)}초
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
