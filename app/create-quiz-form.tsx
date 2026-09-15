"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/constants";

const EXAMPLES = ["태양계 행성", "한국사 조선시대", "자바스크립트 기초", "세계 축구 월드컵"];

export default function CreateQuizForm() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<string>("보통");
  const [count, setCount] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "생성에 실패했습니다.");
      router.push(`/quiz/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했습니다.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <label className="block text-sm font-medium" htmlFor="topic">
        어떤 주제로 퀴즈를 만들까요?
      </label>
      <input
        id="topic"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="예) 태양계 행성"
        maxLength={80}
        required
        disabled={pending}
        className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:border-accent disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            disabled={pending}
            onClick={() => setTopic(example)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="block text-sm font-medium">난이도</span>
          <div className="mt-2 flex gap-2">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                disabled={pending}
                onClick={() => setDifficulty(level)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition disabled:opacity-60 ${
                  difficulty === level
                    ? "border-accent bg-accent/10 font-medium text-accent"
                    : "border-border hover:border-accent"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="count">
            문항 수 · <span className="text-accent">{count}</span>
          </label>
          <input
            id="count"
            type="range"
            min={MIN_QUESTIONS}
            max={MAX_QUESTIONS}
            value={count}
            disabled={pending}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--accent)]"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || topic.trim().length === 0}
        className="mt-6 w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "AI 가 문제를 만드는 중…" : "퀴즈 생성하기"}
      </button>
      {pending && (
        <p className="mt-2 text-center text-xs text-muted">
          보통 10~30초 걸립니다. 창을 닫지 마세요.
        </p>
      )}
    </form>
  );
}
