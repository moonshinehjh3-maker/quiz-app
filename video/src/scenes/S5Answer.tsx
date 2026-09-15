import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Plant } from "../Plant";
import { C, growthMessage } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { Card } from "../ui/AppFrame";
import { BrowserChrome } from "../ui/BrowserChrome";
import { Caption, Cursor, ProgressBar } from "../ui/Bits";
import { fadeUp, growthAt, ramp, shakeX } from "../lib/anim";
import { POP_FRAMES, S5 } from "../timeline";
import { APP_URL, COUNT, QUESTIONS, QUIZ_META, QUIZ_TITLE } from "../lib/data";

const WIN_W = 1520;
const WIN_H = 660;

/**
 * 창 내부 좌표계에서 보기 버튼의 위치.
 * 렌더한 정지 프레임에서 실측한 값이다 (제목 → 문항 카드 → 보기 순으로 쌓인 결과).
 */
const CHOICE_X = 900;
const CHOICE_Y0 = 300;
const CHOICE_DY = 65;
const choiceY = (i: number) => CHOICE_Y0 + i * CHOICE_DY;

/** 지금 몇 번 문항이 떠 있는지. */
function currentQuestion(frame: number) {
  let idx = 0;
  S5.questions.forEach((q, i) => {
    if (frame >= q.cardIn[0]) idx = i;
  });
  if (frame >= S5.finalClick - 40) idx = QUESTIONS.length - 1;
  return idx;
}

export const S5Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 성장 이력 전체 — 진행바·카운터·문구가 전부 이 값 하나에서 나온다
  const events = [
    ...S5.questions.map((q) => ({ grow: q.grow, correct: q.correct })),
    { grow: S5.finalGrow, correct: true },
  ];
  const progress = growthAt(frame, events, COUNT);
  const correctCount = Math.round(progress * COUNT);

  const popFrames = [
    ...S5.questions.filter((q) => q.grow !== null && q.correct).map((q) => q.grow as number),
    S5.finalGrow,
    S5.finalGrow + 18,
  ];
  const lastPop = popFrames.filter((p) => p <= frame).pop() ?? null;

  const qIdx = currentQuestion(frame);
  const q = QUESTIONS[qIdx];
  const beat = S5.questions[qIdx];

  const clickFrame = qIdx === QUESTIONS.length - 1 ? S5.finalClick : beat.click;
  const locked = frame >= clickFrame;
  const isWrong = !beat.correct && qIdx === 1;
  const sinceShake = isWrong ? frame - (clickFrame + 7) : -1;
  const shake = isWrong && locked ? shakeX(sinceShake) : 0;

  const pageIn = ramp(frame, S5.pageIn);

  // 커서 — 창 로컬 좌표. 각 문항에서 고를 보기 위로 이동한다.
  const cursorPath = [
    { frame: 0, x: 1150, y: 620 },
    ...S5.questions.flatMap((b, i) => [
      // 다음 문항으로 넘어가는 동안 잠깐 아래로 비켰다가
      { frame: Math.max(b.cursor[0] - 8, 0), x: CHOICE_X + 160, y: 600 },
      // 고를 보기 위에 정확히 멈춘다
      { frame: b.cursor[1], x: CHOICE_X, y: choiceY(QUESTIONS[i].pickIndex) },
    ]),
    { frame: S5.finalClick, x: CHOICE_X, y: choiceY(QUESTIONS[4].pickIndex) },
    { frame: S5.clickSubmit - 12, x: CHOICE_X, y: 640 },
    { frame: S5.clickSubmit, x: CHOICE_X, y: 640 },
  ];
  const clicks = [
    ...S5.questions.slice(0, 4).map((b) => b.click),
    S5.finalClick,
    S5.clickSubmit,
  ];

  const submitIn = ramp(frame, S5.submitCardIn);

  return (
    <AbsoluteFill
      style={{
        background: C.background,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        wordBreak: "keep-all",
      }}
    >
      <div style={{ position: "relative", opacity: pageIn, transform: `translateX(${(1 - pageIn) * 40}px)` }}>
        <BrowserChrome url={`${APP_URL}/quiz/a1b2c3`} width={WIN_W} height={WIN_H}>
          <div
            style={{
              background: C.background,
              height: WIN_H - 52,
              padding: "28px 40px",
              color: C.foreground,
            }}
          >
            {/* 페이지 헤더 */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {QUIZ_TITLE}
              </div>
              <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>{QUIZ_META}</div>
            </div>

            <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
              {/* 좌측 — 성장 현황 */}
              <Card style={{ width: 520, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                  <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
                    {/* 다 자란 모습을 옅게 겹쳐 남은 여지를 보여준다 */}
                    <div style={{ position: "absolute", inset: 0 }}>
                      <Plant progress={1} size={200} opacity={0.1} />
                    </div>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <Plant
                        progress={progress}
                        size={200}
                        framesSincePop={lastPop === null ? null : frame - lastPop}
                        fps={fps}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingBottom: 6 }}>
                    <div style={{ fontSize: 20, fontWeight: 500 }}>
                      정답 <span style={{ color: C.accent }}>{correctCount}</span> / {COUNT}
                    </div>
                    <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>
                      {growthMessage(progress)}
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <ProgressBar progress={progress} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* 우측 — 문제 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    color: C.muted,
                    marginBottom: 10,
                  }}
                >
                  <span>
                    {qIdx + 1} / {COUNT}
                  </span>
                  {/* 배지는 채점이 끝나고 식물이 실제로 자라기 시작할 때 뜬다.
                      클릭 순간에 띄우면 "자랐어요"라는데 아직 씨앗인 상태가 보인다. */}
                  {locked && frame >= clickFrame + 10 && (
                    <span style={{ color: beat.correct ? C.emerald600 : C.red500 }}>
                      {beat.correct ? "정답! 식물이 자랐어요" : "오답"}
                    </span>
                  )}
                  {locked && frame < clickFrame + 10 && (
                    <span style={{ color: C.muted }}>채점 중…</span>
                  )}
                </div>

                <Card>
                  <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.4 }}>{q.prompt}</div>
                  <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                    {q.choices.map((choice, i) => {
                      const picked = locked && i === q.pickIndex;
                      const right = picked && beat.correct;
                      const wrong = picked && !beat.correct;
                      return (
                        <div
                          key={i}
                          style={{
                            borderRadius: 12,
                            border: `1px solid ${
                              right ? C.emerald500 : wrong ? C.red400 : C.border
                            }`,
                            background: right
                              ? "rgba(0,188,125,0.1)"
                              : wrong
                                ? "rgba(251,44,54,0.1)"
                                : "transparent",
                            padding: "14px 18px",
                            fontSize: 17,
                            fontWeight: picked ? 500 : 400,
                            opacity: locked && !picked ? 0.5 : 1,
                            transform: wrong ? `translateX(${shake}px)` : undefined,
                          }}
                        >
                          <span style={{ color: C.muted, marginRight: 10 }}>{"ABCD"[i]}</span>
                          {choice}
                        </div>
                      );
                    })}
                  </div>
                  {locked && (
                    <div style={{ marginTop: 14, fontSize: 13, color: C.muted }}>
                      정답과 해설은 마지막에 한 번에 공개됩니다.
                    </div>
                  )}
                </Card>

                {/* 마지막 — 닉네임 + 제출 */}
                {frame >= S5.submitCardIn[0] && (
                  <div style={{ ...fadeUp(frame, S5.submitCardIn, 16), marginTop: 14 }}>
                    <Card padding={18}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>닉네임 (랭킹에 표시됩니다)</div>
                      <div
                        style={{
                          marginTop: 8,
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                          background: C.card,
                          padding: "10px 14px",
                          fontSize: 15,
                        }}
                      >
                        데모
                      </div>
                      <div
                        style={{
                          marginTop: 14,
                          borderRadius: 12,
                          background: C.accent,
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 16,
                          textAlign: "center",
                          padding: "12px 16px",
                          opacity: submitIn,
                        }}
                      >
                        {frame >= S5.clickSubmit + 10 ? "정리 중…" : "결과와 해설 보기"}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Cursor path={cursorPath} clicks={clicks} />
        </BrowserChrome>
      </div>

      {S5.captions.map((c) => (
        <Caption key={c.text} text={c.text} range={c.range} />
      ))}
    </AbsoluteFill>
  );
};
