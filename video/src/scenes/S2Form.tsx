import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, APP_SCALE } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { AppFrame, Card } from "../ui/AppFrame";
import { BrowserChrome } from "../ui/BrowserChrome";
import { Caption, Cursor, TypedText } from "../ui/Bits";
import { EASE_OUT, fadeUp, ramp, shimmerX } from "../lib/anim";
import { S2, S3, S4, S2_PHASE } from "../timeline";
import { APP_URL, DIFFICULTIES, EXAMPLES, TOPIC } from "../lib/data";

const WIN_W = 1160;
const WIN_H = 860;

/**
 * 주제 입력 → 난이도·문항 수 → 생성 중.
 * 폼 카드는 한 번만 마운트되고 상태만 프레임에 따라 바뀐다.
 */
export const S2Form: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const winIn = spring({
    frame: frame - S2.windowIn[0],
    fps,
    config: { damping: 200 },
    durationInFrames: S2.windowIn[1] - S2.windowIn[0],
  });

  // --- 단계별 로컬 프레임 ---
  const fOpt = frame - S2_PHASE.options;
  const fGen = frame - S2_PHASE.generating;
  const generating = fGen >= S4.buttonToPending[0];

  // 난이도: 처음엔 "보통"이 기본 선택. 클릭 연출은 강조 링으로만 준다.
  const difficultyPicked = fOpt >= S3.clickDifficulty;

  // 문항 수 3 → 5
  const count = Math.round(
    interpolate(fOpt, [S3.dragSlider[0], S3.dragSlider[1]], [3, 5], {
      easing: EASE_OUT,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const sliderT = (count - 3) / (12 - 3);

  // 생성 버튼 눌림
  const sinceSubmit = fOpt - S3.clickSubmit;
  const btnScale =
    sinceSubmit >= 0 && sinceSubmit <= 8
      ? interpolate(sinceSubmit, [0, 4, 8], [1, 0.97, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const pendingT = ramp(fGen, S4.buttonToPending);
  const disabledOpacity = 1 - pendingT * 0.4;

  // 커서 경로 — 브라우저 창 로컬 좌표.
  // 각 좌표는 렌더한 정지 프레임에서 실측했다 (창 좌상단 기준).
  const cursorPath = [
    { frame: 0, x: 900, y: 760 },
    { frame: S2.cursorToInput[1], x: 390, y: 372 },
    { frame: S2_PHASE.options + S3.clickDifficulty, x: 373, y: 569 },
    // 슬라이더는 손잡이를 따라간다 (3 → 5 로 끌리는 동안 함께 이동)
    { frame: S2_PHASE.options + S3.cursorToSlider[1], x: 591, y: 567 },
    { frame: S2_PHASE.options + S3.dragSlider[1], x: 591 + sliderT * 390, y: 567 },
    { frame: S2_PHASE.options + S3.cursorToSubmit[1], x: 578, y: 666 },
    { frame: S2_PHASE.generating + 40, x: 578, y: 666 },
  ];
  const clicks = [
    S2.clickInput,
    S2_PHASE.options + S3.clickDifficulty,
    S2_PHASE.options + S3.clickSubmit,
  ];

  return (
    <AbsoluteFill
      style={{
        background: C.background,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: "relative",
          transform: `scale(${0.96 + winIn * 0.04}) translateY(${(1 - winIn) * 40 - 70}px)`, // -70: 하단 자막 자리를 비운다
          opacity: winIn,
        }}
      >
        <BrowserChrome url={APP_URL} width={WIN_W} height={WIN_H}>
          <div style={{ transform: `scale(${APP_SCALE})`, transformOrigin: "top left", width: WIN_W / APP_SCALE }}>
            <AppFrame contentWidth={640} height={(WIN_H - 52) / APP_SCALE} padY={20}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>퀴즈 만들기</h2>
              <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 14px" }}>
                AI 가 문제·보기·해설을 생성하고, 만들어진 퀴즈와 점수는 Neon Postgres 에 저장됩니다.
              </p>

              <Card style={{ opacity: disabledOpacity }}>
                {/* 주제 입력 */}
                <div style={{ ...fadeUp(frame, [S2.cardStagger[0], S2.cardStagger[0] + 10], 8) }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>어떤 주제로 퀴즈를 만들까요?</div>
                  <div
                    style={{
                      marginTop: 8,
                      width: "100%",
                      borderRadius: 12,
                      border: `1px solid ${frame >= S2.clickInput ? C.accent : C.border}`,
                      background: C.background,
                      padding: "12px 16px",
                      fontSize: 16,
                      minHeight: 24,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {frame < S2.typeStart ? (
                      <span style={{ color: C.muted }}>예) 태양계 행성</span>
                    ) : (
                      <TypedText
                        text={TOPIC}
                        startFrame={S2.typeStart}
                        delays={S2.typeDelays}
                        fontSize={16}
                      />
                    )}
                  </div>
                </div>

                {/* 예시 칩 */}
                <div
                  style={{
                    ...fadeUp(frame, [S2.cardStagger[0] + 5, S2.cardStagger[0] + 15], 8),
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {EXAMPLES.map((e) => (
                    <span
                      key={e}
                      style={{
                        borderRadius: 999,
                        border: `1px solid ${C.border}`,
                        padding: "4px 12px",
                        fontSize: 12,
                        color: C.muted,
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>

                {/* 난이도 + 문항 수 */}
                <div
                  style={{
                    ...fadeUp(frame, [S2.cardStagger[0] + 10, S2.cardStagger[1]], 8),
                    marginTop: 24,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>난이도</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                      {DIFFICULTIES.map((level) => {
                        const on = level === "보통" && difficultyPicked;
                        return (
                          <div
                            key={level}
                            style={{
                              flex: 1,
                              borderRadius: 12,
                              border: `1px solid ${on ? C.accent : C.border}`,
                              background: on ? "rgba(79,70,229,0.1)" : "transparent",
                              color: on ? C.accent : C.foreground,
                              fontWeight: on ? 500 : 400,
                              padding: "8px 12px",
                              fontSize: 14,
                              textAlign: "center",
                            }}
                          >
                            {level}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      문항 수 · <span style={{ color: C.accent }}>{count}</span>
                    </div>
                    <div style={{ marginTop: 18, position: "relative", height: 16 }}>
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 0,
                          right: 0,
                          height: 4,
                          borderRadius: 2,
                          background: C.border,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 6,
                          left: 0,
                          width: `${sliderT * 100}%`,
                          height: 4,
                          borderRadius: 2,
                          background: C.accent,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: `calc(${sliderT * 100}% - 8px)`,
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          background: C.accent,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 생성 버튼 */}
                <div
                  style={{
                    marginTop: 24,
                    borderRadius: 12,
                    background: C.accent,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 600,
                    textAlign: "center",
                    padding: "12px 16px",
                    transform: `scale(${btnScale})`,
                    opacity: generating ? 0.5 : 1,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {generating ? "AI 가 문제를 만드는 중…" : "퀴즈 생성하기"}
                  {generating && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: `${shimmerX(fGen, S4.shimmerPeriod)}%`,
                        width: "30%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                      }}
                    />
                  )}
                </div>

                {generating && (
                  <div
                    style={{
                      ...fadeUp(fGen, S4.helperIn, 6),
                      marginTop: 8,
                      textAlign: "center",
                      fontSize: 12,
                      color: C.muted,
                    }}
                  >
                    보통 10~30초 걸립니다. 창을 닫지 마세요.
                  </div>
                )}
              </Card>

              {/* 생성 중 스켈레톤 */}
              {generating && (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {[0, 1, 2].map((i) => {
                    const t = ramp(fGen, [
                      S4.skeletonIn[0] + i * 15,
                      S4.skeletonIn[0] + i * 15 + 12,
                    ]);
                    const pulse = 0.5 + 0.5 * Math.abs(Math.sin((2 * Math.PI * fGen) / 40));
                    return (
                      <Card key={i} padding={16} style={{ opacity: t }}>
                        <div
                          style={{
                            height: 12,
                            width: "70%",
                            borderRadius: 6,
                            background: C.border,
                            opacity: pulse,
                          }}
                        />
                        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                          {[0, 1, 2, 3].map((j) => (
                            <div
                              key={j}
                              style={{
                                height: 10,
                                width: `${85 - j * 8}%`,
                                borderRadius: 5,
                                background: C.border,
                                opacity: pulse * 0.7,
                              }}
                            />
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </AppFrame>
          </div>

          <Cursor path={cursorPath} clicks={clicks} />
        </BrowserChrome>
      </div>

      <Caption text="주제만 입력하면 AI 가 문제를 만듭니다" range={S2.caption} />
      <Caption
        text="난이도와 문항 수를 고르고"
        range={[S2_PHASE.options + S3.caption1[0], S2_PHASE.options + S3.caption1[1]]}
      />
      <Caption
        text="OpenAI 가 문제·보기·해설을 만들고, Neon 에 저장합니다"
        range={[S2_PHASE.generating + S4.caption[0], S2_PHASE.generating + S4.caption[1]]}
      />
    </AbsoluteFill>
  );
};
