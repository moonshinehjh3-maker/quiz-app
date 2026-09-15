import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Plant } from "../Plant";
import { C } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { Card } from "../ui/AppFrame";
import { BrowserChrome } from "../ui/BrowserChrome";
import { Caption } from "../ui/Bits";
import { EASE_OUT, fadeUp, ramp } from "../lib/anim";
import { S6 } from "../timeline";
import { APP_URL, COUNT, QUESTIONS, QUIZ_META, QUIZ_TITLE, RANKING } from "../lib/data";

const WIN_W = 1180;
const WIN_H = 620;

export const S6Bloom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const score = Math.round(
    interpolate(frame, S6.scoreCount, [0, COUNT], {
      easing: EASE_OUT,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const lastPop = S6.pops.filter((p) => p <= frame).pop() ?? null;

  // 후광 — 앱 히어로의 emerald 후광을 크게 키워 축하 연출로 쓴다
  const haloT = ramp(frame, S6.halo);
  const haloScale = 0.6 + haloT * 1.0;
  const haloOpacity = (1 - haloT) * 0.28;

  // 카메라 — 해설 → 랭킹으로 내려간다
  const panA = interpolate(frame, S6.panToExplanations, [0, 300], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panB = interpolate(frame, S6.panToRanking, [0, 340], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = panA + panB;

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
      <BrowserChrome url={`${APP_URL}/quiz/a1b2c3`} width={WIN_W} height={WIN_H}>
        <div style={{ background: C.background, height: WIN_H - 52, overflow: "hidden" }}>
          <div
            style={{
              padding: "28px 40px",
              transform: `translateY(${-panY}px)`,
              color: C.foreground,
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {QUIZ_TITLE}
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{QUIZ_META}</div>
            </div>

            {/* 결과 카드 */}
            <div style={{ ...fadeUp(frame, S6.cardIn, 20) }}>
              <Card padding={28}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 40,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: 260,
                        height: 260,
                        borderRadius: "50%",
                        background: "rgba(0,212,146,1)",
                        filter: "blur(48px)",
                        opacity: haloOpacity,
                        transform: `scale(${haloScale})`,
                      }}
                    />
                    <Plant
                      progress={1}
                      size={260}
                      framesSincePop={lastPop === null ? null : frame - lastPop}
                      fps={fps}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, color: C.muted }}>데모 님의 결과</div>
                    <div style={{ fontSize: 76, fontWeight: 700, marginTop: 4, lineHeight: 1.1 }}>
                      <span style={{ color: C.accent }}>{score}</span>
                      <span style={{ color: C.muted }}> / {COUNT}</span>
                    </div>
                    <div style={{ ...fadeUp(frame, S6.messageIn, 12), fontSize: 20, marginTop: 8 }}>
                      꽃이 활짝 피었습니다!
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 해설 */}
            <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
              {QUESTIONS.slice(0, 3).map((q, i) => {
                const t = ramp(frame, [
                  S6.panToExplanations[0] + i * 10,
                  S6.panToExplanations[0] + i * 10 + 14,
                ]);
                const wrong = i === 1;
                return (
                  <div key={q.prompt} style={{ opacity: t, transform: `translateY(${(1 - t) * 16}px)` }}>
                    <Card padding={20}>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        {i + 1}번 · {wrong ? "오답" : "정답"}
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 500, marginTop: 4 }}>{q.prompt}</div>
                      <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                        {q.choices.map((choice, ci) => {
                          const isAnswer = ci === q.answerIndex;
                          const isPicked = ci === q.pickIndex;
                          return (
                            <div
                              key={ci}
                              style={{
                                borderRadius: 8,
                                border: `1px solid ${
                                  isAnswer
                                    ? C.emerald500
                                    : isPicked && !isAnswer
                                      ? C.red400
                                      : "transparent"
                                }`,
                                background: isAnswer
                                  ? "rgba(0,188,125,0.1)"
                                  : isPicked && !isAnswer
                                    ? "rgba(251,44,54,0.1)"
                                    : "transparent",
                                padding: "8px 12px",
                                fontSize: 14,
                              }}
                            >
                              {choice}
                              {isAnswer && (
                                <span style={{ marginLeft: 8, fontSize: 12, color: C.emerald600 }}>
                                  정답
                                </span>
                              )}
                              {isPicked && !isAnswer && (
                                <span style={{ marginLeft: 8, fontSize: 12, color: C.red500 }}>
                                  내 선택
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          borderRadius: 8,
                          background: C.background,
                          padding: "10px 12px",
                          fontSize: 14,
                          color: C.muted,
                        }}
                      >
                        {q.explanation}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* 랭킹 */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>랭킹</div>
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {RANKING.map((r, i) => {
                  const t = ramp(frame, [
                    S6.panToRanking[0] + 30 + i * 10,
                    S6.panToRanking[0] + 44 + i * 10,
                  ]);
                  return (
                    <div
                      key={r.rank}
                      style={{
                        opacity: t,
                        transform: `translateY(${(1 - t) * 12}px)`,
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        background: C.card,
                        padding: "12px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        fontSize: 15,
                      }}
                    >
                      <span style={{ color: C.muted, width: 20 }}>{r.rank}</span>
                      <span style={{ flex: 1, fontWeight: r.rank === 1 ? 600 : 400 }}>
                        {r.nickname}
                      </span>
                      <span style={{ color: C.muted }}>{r.score}</span>
                      <span style={{ color: C.muted }}>{r.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </BrowserChrome>

      {S6.captions.map((c) => (
        <Caption key={c.text} text={c.text} range={c.range} />
      ))}
    </AbsoluteFill>
  );
};
