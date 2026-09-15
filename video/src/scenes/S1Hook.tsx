import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Plant } from "../Plant";
import { C } from "../theme";
import { FONT_FAMILY } from "../fonts";
import { HeroGradient } from "../ui/Bits";
import { EASE_OUT, fadeUp, ramp } from "../lib/anim";
import { S1 } from "../timeline";

export const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const plantIn = spring({
    frame: frame - S1.plantIn[0],
    fps,
    config: { damping: 12 },
    durationInFrames: S1.plantIn[1] - S1.plantIn[0],
  });

  // 이 영상의 핵심 한 장면 — 씨앗에서 만개까지
  const progress = interpolate(frame, [S1.grow[0], S1.grow[1]], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lastPop = S1.pops.filter((p) => p <= frame).pop() ?? null;

  // 만개 후 잔잔한 호흡
  const breathe =
    frame > S1.grow[1] ? 1 + 0.01 * Math.sin((2 * Math.PI * (frame - S1.grow[1])) / 90) : 1;

  const haloScale = 0.6 + progress * 0.9;

  return (
    <AbsoluteFill style={{ background: C.background }}>
      <HeroGradient opacity={ramp(frame, S1.gradientIn)} />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          color: C.foreground,
          wordBreak: "keep-all",
        }}
      >
        {/* 식물 + 후광 */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${(0.82 + plantIn * 0.18) * breathe})`,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "rgba(0,212,146,0.25)",
              filter: "blur(48px)",
              transform: `scale(${haloScale})`,
            }}
          />
          <Plant
            progress={progress}
            size={420}
            framesSincePop={lastPop === null ? null : frame - lastPop}
            fps={fps}
            opacity={plantIn}
          />
        </div>

        {/* 배지 */}
        <div
          style={{
            ...fadeUp(frame, S1.badgeIn, 14),
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: "1px solid rgba(0,188,125,0.4)",
            background: "rgba(0,188,125,0.1)",
            padding: "8px 20px",
            fontSize: 24,
            fontWeight: 500,
            color: C.emerald600,
            marginBottom: 28,
          }}
        >
          🌱 식물 키우기
        </div>

        {/* 타이틀 */}
        <div
          style={{
            ...fadeUp(frame, S1.titleLine1),
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
          }}
        >
          한 문제 맞힐 때마다
        </div>
        <div
          style={{
            ...fadeUp(frame, S1.titleLine2),
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
          }}
        >
          <span style={{ color: C.accent }}>식물이</span> 자랍니다
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
