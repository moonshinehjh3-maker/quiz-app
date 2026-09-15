"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GradedQuestion } from "@/lib/quiz";
import Plant from "@/components/plant";

type Question = { position: number; prompt: string; choices: string[] };
type Result = { score: number; total: number; graded: GradedQuestion[] };

function growthMessage(correct: number, total: number) {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= 1) return "꽃이 활짝 피었습니다!";
  if (ratio >= 0.7) return "꽃봉오리가 맺혔어요.";
  if (ratio >= 0.4) return "잎이 무성해졌어요.";
  if (ratio > 0) return "싹이 텄어요.";
  return "아직 씨앗이에요. 한 문제만 맞혀도 싹이 납니다.";
}

export default function QuizPlayer({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [startedAt] = useState(() => Date.now());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );
  const [feedback, setFeedback] = useState<(boolean | null)[]>(() =>
    questions.map(() => null),
  );
  const [checking, setChecking] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const locked = answers[current] !== null;
  const correctCount = feedback.filter((f) => f === true).length;

  /** 보기를 고르면 즉시 서버에 채점을 물어보고 식물을 키운다. */
  async function select(choiceIndex: number) {
    if (locked || checking) return;

    setAnswers((prev) => {
      const next = [...prev];
      next[current] = choiceIndex;
      return next;
    });
    setChecking(true);
    setError(null);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: question.position, choice: choiceIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "채점에 실패했습니다.");

      setFeedback((prev) => {
        const next = [...prev];
        next[current] = data.correct;
        return next;
      });

      if (data.correct) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 650);
      }
    } catch (err) {
      // 실패하면 선택을 되돌려 다시 고를 수 있게 한다.
      setAnswers((prev) => {
        const next = [...prev];
        next[current] = null;
        return next;
      });
      setError(err instanceof Error ? err.message : "채점에 실패했습니다.");
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname.trim() || "익명",
          answers,
          elapsedMs: Date.now() - startedAt,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "채점에 실패했습니다.");
      setResult(data);
      router.refresh(); // 랭킹 갱신
    } catch (err) {
      setError(err instanceof Error ? err.message : "채점에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Plant correct={result.score} total={result.total} />
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted">{nickname.trim() || "익명"} 님의 결과</p>
              <p className="mt-1 text-4xl font-bold">
                <span className="text-accent">{result.score}</span>
                <span className="text-muted"> / {result.total}</span>
              </p>
              <p className="mt-2 text-sm">{growthMessage(result.score, result.total)}</p>
            </div>
          </div>
        </div>

        <ol className="space-y-4">
          {result.graded.map((item) => (
            <li key={item.position} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs text-muted">
                {item.position + 1}번 · {item.correct ? "정답" : "오답"}
              </p>
              <p className="mt-1 font-medium">{item.prompt}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {item.choices.map((choice, index) => {
                  const isAnswer = index === item.answerIndex;
                  const isPicked = index === item.selected;
                  return (
                    <li
                      key={index}
                      className={`rounded-lg border px-3 py-2 ${
                        isAnswer
                          ? "border-emerald-500 bg-emerald-500/10"
                          : isPicked
                            ? "border-red-400 bg-red-500/10"
                            : "border-transparent"
                      }`}
                    >
                      {choice}
                      {isAnswer && <span className="ml-2 text-xs text-emerald-600">정답</span>}
                      {isPicked && !isAnswer && (
                        <span className="ml-2 text-xs text-red-500">내 선택</span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 rounded-lg bg-background px-3 py-2 text-sm text-muted">
                {item.explanation}
              </p>
            </li>
          ))}
        </ol>

        <Link
          href="/"
          className="block rounded-xl border border-border px-4 py-3 text-center text-sm font-medium transition hover:border-accent"
        >
          새 퀴즈 만들기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 성장 현황 */}
      <div className="flex items-end gap-3 rounded-2xl border border-border bg-card p-4">
        {/* 다 자란 모습을 옅게 겹쳐 남은 성장 여지를 보여준다 */}
        <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
          <div aria-hidden className="absolute inset-0 opacity-10">
            <Plant
              correct={questions.length}
              total={questions.length}
              className="h-full w-full"
            />
          </div>
          <Plant
            correct={correctCount}
            total={questions.length}
            celebrate={celebrate}
            className="relative h-full w-full"
          />
        </div>
        <div className="min-w-0 flex-1 pb-1">
          <p className="text-sm font-medium">
            정답 <span className="text-accent">{correctCount}</span> / {questions.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            {growthMessage(correctCount, questions.length)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${(correctCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {current + 1} / {questions.length}
        </span>
        {feedback[current] !== null && (
          <span className={feedback[current] ? "text-emerald-600" : "text-red-500"}>
            {feedback[current] ? "정답! 식물이 자랐어요" : "오답"}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-lg font-medium">{question.prompt}</p>
        <ul className="mt-4 space-y-2">
          {question.choices.map((choice, index) => {
            const picked = answers[current] === index;
            const isWrongPick = picked && feedback[current] === false;
            const isRightPick = picked && feedback[current] === true;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => select(index)}
                  disabled={locked || checking}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isRightPick
                      ? "border-emerald-500 bg-emerald-500/10 font-medium"
                      : isWrongPick
                        ? "animate-[answer-shake_400ms_ease-in-out] border-red-400 bg-red-500/10 font-medium"
                        : picked
                          ? "border-accent bg-accent/10 font-medium"
                          : "border-border hover:border-accent"
                  } ${locked && !picked ? "opacity-50" : ""} disabled:cursor-default`}
                >
                  <span className="mr-2 text-muted">{"ABCD"[index]}</span>
                  {choice}
                </button>
              </li>
            );
          })}
        </ul>
        {checking && <p className="mt-3 text-xs text-muted">채점 중…</p>}
        {locked && !isLast && (
          <p className="mt-3 text-xs text-muted">
            정답과 해설은 마지막에 한 번에 공개됩니다.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {locked && !isLast && (
        <button
          type="button"
          onClick={() => setCurrent((c) => c + 1)}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          다음 문제
        </button>
      )}

      {isLast && locked && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-sm font-medium" htmlFor="nickname">
            닉네임 (랭킹에 표시됩니다)
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="익명"
            maxLength={20}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "정리 중…" : "결과와 해설 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
